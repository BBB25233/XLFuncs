import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { CategoryId } from '@/types';
import { CATEGORY_META, CATEGORY_IDS } from '@/data/categories';
import { byCategory, countByCategory } from '@/data';
import FunctionCard from '@/ui/components/FunctionCard';
import EmptyState from '@/ui/components/EmptyState';

/**
 * 分类列表页：按分类过滤索引（**不加载正文**，F28）。
 * 默认按常用度排序（索引本身已经是常用度降序）。
 */
export default function CategoryPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const categoryId = id as CategoryId | undefined;

  if (categoryId === undefined || !CATEGORY_IDS.includes(categoryId)) {
    return (
      <div className="mx-auto max-w-content">
        <EmptyState
          keyword="这个分类"
          description="这个分类不存在，回到首页按分类浏览，或者直接搜索函数名。"
        />
        <div className="mt-4">
          <Link to="/" className="text-sm text-accent hover:text-accent-hover">
            回到首页
          </Link>
        </div>
      </div>
    );
  }

  const meta = CATEGORY_META[categoryId];
  const entries = byCategory(categoryId);

  return (
    <div className="mx-auto max-w-content">
      <nav className="mb-4 text-xs text-ink-3">
        <Link to="/" className="hover:text-ink">
          首页
        </Link>
        <span className="mx-1">/</span>
        <span>{meta.name}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-h2 text-ink">{meta.name}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {meta.note} · 共 {countByCategory(categoryId)} 个
        </p>
      </header>

      {entries.length === 0 ? (
        <EmptyState keyword={meta.name} description="这个分类下的内容还在编写中。" />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div key={entry.id} className="hairline-b">
              <FunctionCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
