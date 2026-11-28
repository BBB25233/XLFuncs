import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all, TOTAL_COUNT } from '@/data';
import { MACRO_STATS } from '@/data/macro/stats';
import SearchBox from '@/ui/components/SearchBox';
import { CategoryGrid } from '@/ui/components/CategoryCard';
import FunctionCard from '@/ui/components/FunctionCard';

/**
 * 首页：搜索框 + 两张工具入口卡（公式解释器 / 宏与 VBA）+ 分类卡片 +
 * 5 个常用函数快捷入口 +
 * 顶部「中文名是助记名，往 Excel 里输入请用英文名」说明（P0-17）。
 *
 * 宏入口与公式解释器同权：并排、同卡片样式、同位置。
 * 这里只 import 统计常量 `MACRO_STATS`，不会把宏内容包拉下来（首页仍 0 个包）。
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
          {TOTAL_COUNT} 个核心函数，中文助记名 + 英文对照，支持在线试算与一键复制；
          另有 {MACRO_STATS.total} 条 VBA 宏写法与 {MACRO_STATS.cheatsheet} 行宏速查表。
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

      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link
          to="/interpreter"
          className="flex flex-col rounded-card border border-line bg-bg p-4 hover:border-accent"
        >
          <h2 className="text-h3 text-ink">公式解释器</h2>
          <p className="mt-1 text-sm text-ink-2">
            粘贴一段多层嵌套的公式，按步骤讲清它先算什么、后算什么、每一步产出什么。
          </p>
          <span className="mt-2 text-xs text-accent">粘贴公式，逐步拆解 →</span>
        </Link>

        <Link
          to="/macro"
          className="flex flex-col rounded-card border border-line bg-bg p-4 hover:border-accent"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-h3 text-ink">宏与 VBA</h2>
            <span className="rounded-full bg-bg-sub px-2 py-0.5 text-xs text-ink-3">
              {MACRO_STATS.total} 条
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-2">
            从录制宏到条件变色、去重，配方 + 概念 + 语句 + 对象成员，配 {MACRO_STATS.cheatsheet}
            行速查表。只讲怎么写、怎么避坑，不提供在线运行宏。
          </p>
          <span className="mt-2 text-xs text-accent">按场景找写法 →</span>
        </Link>
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
