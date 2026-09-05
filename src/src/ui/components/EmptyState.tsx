import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

/**
 * 空态：「没找到『xxx』，你要找的是不是：」+ 3 个相近函数。
 * 文案口径见 §8.5：无搜索结果 → 没找到「xxx」，你要找的是不是：
 */

export interface Suggestion {
  id: string;
  title: string;
  oneLiner: string;
}

export interface EmptyStateProps {
  /** 用户输入的关键词 */
  keyword: string;
  /** 推荐的函数（3 个） */
  suggestions?: Suggestion[];
  /** 补充一句说明 */
  description?: string;
}

export default function EmptyState({
  keyword,
  suggestions = [],
  description,
}: EmptyStateProps): ReactElement {
  return (
    <div className="py-12">
      <p className="text-h4 text-ink">没找到「{keyword}」，你要找的是不是：</p>
      {description === undefined ? null : (
        <p className="mt-3 text-sm text-ink-2">{description}</p>
      )}
      {suggestions.length === 0 ? null : (
        <ul className="mt-4 flex flex-col gap-2">
          {suggestions.map((item) => (
            <li key={item.id} className="hairline-b">
              <Link
                to={`/f/${item.id}`}
                className="block py-3 text-sm text-ink hover:text-accent"
              >
                <span className="font-semibold">{item.title}</span>
                <span className="ml-2 text-ink-2">{item.oneLiner}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
