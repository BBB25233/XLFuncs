import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { catalogIndex, get } from '@/data';
import { buildMacroIndex, KIND_NAME } from '@/data/macro';
import type { MacroHost, MacroKind, SearchEntry } from '@/types';
import { query } from '@/core/search';
import SearchBox from '@/ui/components/SearchBox';
import FunctionCard from '@/ui/components/FunctionCard';
import EmptyState from '@/ui/components/EmptyState';
import { MacroHostBadge, MacroKindBadge } from '@/ui/macro/MacroBadges';
import { useMacroBundle } from '@/ui/hooks/useMacroBundle';

/**
 * 搜索结果页。
 * 搜索框在上方常驻，下方是命中列表（首页的搜索下拉只给 8 条，这里给全部）。
 * URL 带 ?q= 参数，刷新、分享都不丢关键词。
 *
 * M2：函数与宏合并搜索——两套索引都用 core/search 的六级打分，
 * 结果分两块展示（函数在上、宏在下），各自带类型徽标；宏结果可再按宿主/类型筛选。
 * 宏正文不进 catalog.json，所以这里不会影响 414 条函数的统计口径。
 */

const MAX_SUGGESTIONS = 8;

const HOST_FILTERS: Array<{ id: 'all' | MacroHost; label: string }> = [
  { id: 'all', label: '全部宿主' },
  { id: 'excel', label: 'Excel' },
  { id: 'wps', label: 'WPS' },
];

const KIND_FILTERS: Array<{ id: 'all' | MacroKind; label: string }> = [
  { id: 'all', label: '全部类型' },
  { id: 'recipe', label: KIND_NAME.recipe },
  { id: 'concept', label: KIND_NAME.concept },
  { id: 'statement', label: KIND_NAME.statement },
  { id: 'jsa', label: KIND_NAME.jsa },
  { id: 'member', label: KIND_NAME.member },
];

export default function SearchPage(): ReactElement {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const keyword = params.get('q') ?? '';
  const trimmed = keyword.trim();
  const results = trimmed === '' ? [] : query(catalogIndex, trimmed, 200);

  // 宏索引来自按需加载的内容包（M3 拆包）；未加载时函数搜索照常可用
  const { status: macroStatus, bundle: macroBundle, error: macroError, retry: retryMacro } =
    useMacroBundle();
  const macroIndex = useMemo(
    () => (macroBundle === null ? [] : buildMacroIndex(macroBundle)),
    [macroBundle],
  );
  const macroHits = trimmed === '' ? [] : query(macroIndex, trimmed, 100);
  const macroLoading = macroStatus === 'idle' || macroStatus === 'loading';

  const [hostFilter, setHostFilter] = useState<'all' | MacroHost>('all');
  const [kindFilter, setKindFilter] = useState<'all' | MacroKind>('all');

  const filteredMacros = macroHits.filter((entry) => {
    if (kindFilter !== 'all' && entry.kind !== kindFilter) return false;
    if (hostFilter !== 'all' && !entry.host.includes(hostFilter)) return false;
    return true;
  });

  const shownIds = new Set(results.map((entry) => entry.id));
  const suggestionIds: string[] = [];
  for (const entry of results.slice(0, 3)) {
    for (const id of entry.relatedIds ?? []) {
      if (shownIds.has(id) || suggestionIds.includes(id)) continue;
      suggestionIds.push(id);
      if (suggestionIds.length >= MAX_SUGGESTIONS) break;
    }
    if (suggestionIds.length >= MAX_SUGGESTIONS) break;
  }
  const suggestions = suggestionIds
    .map((id) => get(id))
    .filter((entry): entry is SearchEntry => entry !== null);

  // 宏包还在加载时不要过早显示「搜不到」：函数可能确实没有，但宏还没参与比对
  const noHits = results.length === 0 && filteredMacros.length === 0 && !macroLoading;

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-4 text-h2 text-ink">搜索</h1>
      <SearchBox
        initialValue={keyword}
        onSubmit={(kw) => navigate(`/search?q=${encodeURIComponent(kw)}`)}
      />

      {trimmed === '' ? (
        <p className="mt-6 text-sm text-ink-3">
          输入函数名、拼音首字母（如 zxcx），或者直接描述你要做什么（如「两个表匹配数据」「删空行」）。
        </p>
      ) : noHits ? (
        <div className="mt-6">
          <EmptyState keyword={trimmed} />
        </div>
      ) : (
        <>
          {results.length === 0 ? null : (
            <section className="mt-6">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-h4 text-ink">函数</h2>
                <span className="inline-flex h-5 items-center rounded-badge border border-line bg-bg-sub px-2 text-xs text-ink-3">
                  {results.length} 条
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {results.map((entry) => (
                  <div key={entry.id} className="hairline-b">
                    <FunctionCard entry={entry} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {macroLoading ? (
            <p className="mt-6 text-xs text-ink-3">宏内容正在加载，命中结果稍后自动补上…</p>
          ) : null}
          {macroStatus === 'error' ? (
            <p className="mt-6 text-xs text-ink-3">
              宏内容没能加载（{macroError}）。
              <button
                type="button"
                onClick={retryMacro}
                className="ml-1 text-accent hover:text-accent-hover"
              >
                重试
              </button>
              ，不影响上面的函数搜索。
            </p>
          ) : null}

          {macroHits.length === 0 ? null : (
            <section className="mt-8">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-h4 text-ink">宏</h2>
                <span className="inline-flex h-5 items-center rounded-badge border border-line bg-bg-sub px-2 text-xs text-ink-3">
                  {filteredMacros.length} / {macroHits.length} 条
                </span>
              </div>
              <p className="mb-3 text-xs text-ink-3">
                宏条目只在这里露出标题，点进去看完整写法与示例。
              </p>

              <div className="mb-3 flex flex-wrap gap-2">
                {HOST_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setHostFilter(filter.id)}
                    className={`rounded-badge border px-2.5 py-1 text-xs ${
                      hostFilter === filter.id
                        ? 'border-accent text-accent'
                        : 'border-line text-ink-3 hover:text-ink'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
                {KIND_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setKindFilter(filter.id)}
                    className={`rounded-badge border px-2.5 py-1 text-xs ${
                      kindFilter === filter.id
                        ? 'border-accent text-accent'
                        : 'border-line text-ink-3 hover:text-ink'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {filteredMacros.length === 0 ? (
                <p className="text-sm text-ink-3">
                  命中的宏条目被当前筛选条件过滤掉了，换个筛选试试。
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredMacros.map((entry) => (
                    <div key={entry.id} className="hairline-b">
                      <Link
                        to={`/macro/${entry.id}`}
                        className="block rounded-card px-4 py-3 hover:bg-bg-sub"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink">
                            {entry.zhName === null ? entry.enName : entry.zhName}
                          </span>
                          <span className="font-mono text-sm text-ink-2">{entry.enName}</span>
                          <MacroKindBadge kind={entry.kind} />
                          <MacroHostBadge host={entry.host} />
                        </div>
                        <p className="mt-1 text-xs text-ink-2">{entry.oneLiner}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {suggestions.length === 0 ? null : (
            <section className="mt-8">
              <h2 className="mb-1 text-h4 text-ink">这些常一起用</h2>
              <p className="mb-3 text-sm text-ink-3">
                命中的函数常与之搭配或容易混淆，可以一并看看。
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/f/${entry.id}`}
                    className="rounded-card bg-bg-sub px-3 py-2 text-sm text-ink hover:text-brand"
                  >
                    {entry.zhName === null ? '' : `${entry.zhName} `}
                    <span className="font-mono text-ink-2">{entry.enName}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
