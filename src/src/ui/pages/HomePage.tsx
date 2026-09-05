import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { all, TOTAL_COUNT } from '@/data';
import SearchBox from '@/ui/components/SearchBox';
import { CategoryGrid } from '@/ui/components/CategoryCard';
import FunctionCard from '@/ui/components/FunctionCard';

/**
 * 首页：搜索框 + 10 张分类卡片 + 5 个常用函数快捷入口 +
 * 顶部「中文名是助记名，往 Excel 里输入请用英文名」说明（P0-17）。
 */
export default function HomePage(): ReactElement {
  const navigate = useNavigate();

  // 「最常用的 5 个函数」：取常用度最高（usageLevel 降序）的 5 个，与板块标题一致
  const quickEntries = all().slice(0, 5);

  return (
    <div className="mx-auto max-w-content">
      <section className="mb-8">
        <h1 className="text-h1 text-ink">Excel 函数速查</h1>
        <p className="mt-2 text-body text-ink-2">
          {TOTAL_COUNT} 个核心函数，中文助记名 + 英文对照，支持在线试算与一键复制。
        </p>
        <p className="mt-1 text-xs text-ink-3">
          中文名只是帮你理解和搜索的「助记名」，往 Excel 里输入的永远是英文名。
        </p>
      </section>

      <section className="mb-8">
        <SearchBox
          onSubmit={(keyword) => {
            navigate(`/search?q=${encodeURIComponent(keyword)}`);
          }}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-h3 text-ink">最常用的 5 个函数</h2>
        <div className="flex flex-col gap-2">
          {quickEntries.map((entry) => (
            <div key={entry.id} className="hairline-b">
              <FunctionCard entry={entry} dense />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-h3 text-ink">按分类浏览</h2>
        <CategoryGrid />
      </section>

      <section>
        <h2 className="mb-3 text-h3 text-ink">全部 {TOTAL_COUNT} 个函数</h2>
        <div className="flex flex-col gap-2">
          {all().map((entry) => (
            <div key={entry.id} className="hairline-b">
              <FunctionCard entry={entry} dense />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
