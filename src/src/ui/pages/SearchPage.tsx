import type { ReactElement } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { catalogIndex, get } from '@/data';
import type { SearchEntry } from '@/types';
import { query } from '@/core/search';
import SearchBox from '@/ui/components/SearchBox';
import FunctionCard from '@/ui/components/FunctionCard';
import EmptyState from '@/ui/components/EmptyState';

/**
 * 搜索结果页。
 * 搜索框在上方常驻，下方是命中列表（首页的搜索下拉只给 8 条，这里给全部）。
 * URL 带 ?q= 参数，刷新、分享都不丢关键词。
 *
 * 结果列表底部再加一块「相关推荐」（G）：取前 3 条命中的 relatedIds 去重后展示，
 * 让关联关系在详情页之外也能被发现；数据来自 related.json，不触发 packs 加载。
 */

const MAX_SUGGESTIONS = 8;

export default function SearchPage(): ReactElement {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const keyword = params.get('q') ?? '';
  const trimmed = keyword.trim();
  const results = trimmed === '' ? [] : query(catalogIndex, trimmed, 200);

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

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-4 text-h2 text-ink">搜索</h1>
      <SearchBox
        initialValue={keyword}
        onSubmit={(kw) => navigate(`/search?q=${encodeURIComponent(kw)}`)}
      />

      <div className="mt-6 flex flex-col gap-2">
        {trimmed === '' ? (
          <p className="text-sm text-ink-3">
            输入函数名、拼音首字母（如 zxcx），或直接描述你要做什么（如「两个表匹配数据」）。
          </p>
        ) : results.length === 0 ? (
          <EmptyState keyword={trimmed} />
        ) : (
          results.map((entry) => (
            <div key={entry.id} className="hairline-b">
              <FunctionCard entry={entry} />
            </div>
          ))
        )}
      </div>

      {suggestions.length === 0 ? null : (
        <section className="mt-8">
          <h2 className="mb-1 text-h4 text-ink">这些常一起用</h2>
          <p className="mb-3 text-sm text-ink-3">命中的函数常与之搭配或容易混淆，可以一并看看。</p>
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
    </div>
  );
}


