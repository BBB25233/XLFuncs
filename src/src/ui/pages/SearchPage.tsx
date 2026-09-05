import type { ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogIndex } from '@/data';
import { query } from '@/core/search';
import SearchBox from '@/ui/components/SearchBox';
import FunctionCard from '@/ui/components/FunctionCard';
import EmptyState from '@/ui/components/EmptyState';

/**
 * 搜索结果页。
 * 搜索框在上方常驻，下方是命中列表（首页的搜索下拉只给 8 条，这里给全部）。
 * URL 带 ?q= 参数，刷新、分享都不丢关键词。
 */
export default function SearchPage(): ReactElement {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const keyword = params.get('q') ?? '';
  const trimmed = keyword.trim();
  const results = trimmed === '' ? [] : query(catalogIndex, trimmed, 200);

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
    </div>
  );
}
