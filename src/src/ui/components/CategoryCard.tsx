import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryId } from '@/types';
import { CATEGORY_META, CATEGORY_LIST } from '@/data/categories';
import { byCategory, countByCategory } from '@/data';

/** 首页分类卡片：分类名 + 函数数量 + 3 个代表函数 */
export interface CategoryCardProps {
  id: CategoryId;
}

export default function CategoryCard({ id }: CategoryCardProps): ReactElement {
  const meta = CATEGORY_META[id];
  const total = countByCategory(id);
  const top = byCategory(id).slice(0, 3);

  return (
    <Link
      to={`/category/${id}`}
      className="block rounded-card hairline p-4 hover:bg-bg-sub"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-h4 font-semibold text-ink">{meta.name}</span>
        <span className="text-xs text-ink-3">{total} 个</span>
      </div>
      <p className="mt-1 text-xs text-ink-3">{meta.note}</p>
      <ul className="mt-3 flex flex-col gap-1">
        {top.map((item) => (
          <li key={item.id} className="truncate text-xs text-ink-2">
            {item.zhName === null ? item.enName : `${item.zhName} ${item.enName}`}
          </li>
        ))}
      </ul>
    </Link>
  );
}

/** 10 张分类卡片的网格（首页用） */
export function CategoryGrid(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {CATEGORY_LIST.map((meta) => (
        <CategoryCard key={meta.id} id={meta.id} />
      ))}
    </div>
  );
}
