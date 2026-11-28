import { useState } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MacroKind } from '@/types';
import {
  getMacro,
  MACRO_KINDS,
  macroByKind,
  macroCountByKind,
  searchMacros,
} from '@/data/macro';
import { useMacroBundle } from '@/ui/hooks/useMacroBundle';
import MacroCard from '@/ui/macro/MacroCard';
import MacroSearchBox from '@/ui/macro/MacroSearchBox';
import { MacroPackError, MacroPackLoading } from '@/ui/macro/MacroPackState';

/**
 * 宏首页（M2）：场景配方在最上面，往下按类型分组，右侧一列学习路径。
 *
 * 信息架构依据计划 §3.1：配方是小白入口，概念与语句是被配方带出来的；
 * 高手走搜索 + 速查表，所以顶部也直接给速查表入口。
 *
 * M3 拆包后：内容来自 `useMacroBundle()`（文件夹版按需注入 packs/macro.<hash>.js），
 * 本页只处理三态，不再静态 import 任何宏正文。
 */

const PATH_STEPS: Array<{ title: string; desc: string; ids: string[] }> = [
  {
    title: '第 1 步：先让宏跑起来',
    desc: '知道宏是什么、怎么启用、代码放哪，能按 F5 看到一个弹框。',
    ids: ['what-is-macro', 'macro-security', 'module-and-procedure'],
  },
  {
    title: '第 2 步：能读写单元格',
    desc: '会引用区域、赋值、按行循环，能把一张表的数据处理一遍。',
    ids: ['range-vs-cells', 'value', 'dim', 'for-next'],
  },
  {
    title: '第 3 步：做完整的小工具',
    desc: '会判断、会查找、会套格式，能照着配方改成自己表里的脚本。',
    ids: ['find', 'numberformat', 'delete-empty-rows'],
  },
];

export default function MacroHomePage(): ReactElement {
  const { status, bundle, error, retry } = useMacroBundle();
  const [keyword, setKeyword] = useState('');

  if (status !== 'ready' || bundle === null) {
    return status === 'error' ? (
      <MacroPackError error={error} retry={retry} />
    ) : (
      <MacroPackLoading />
    );
  }

  const counts = macroCountByKind(bundle);
  const total = bundle.entries.length;
  const hits = keyword.trim() === '' ? null : searchMacros(bundle, keyword, 999);
  const hitIds = hits === null ? null : new Set(hits.map((entry) => entry.id));
  const recipes = macroByKind(bundle, 'recipe').filter(
    (entry) => hitIds === null || hitIds.has(entry.id),
  );

  return (
    <div className="mx-auto max-w-content">
      <section className="mb-8">
        <h1 className="text-h1 text-ink">宏与 VBA</h1>
        <p className="mt-2 text-body text-ink-2">
          {total} 条：配方 {counts.recipe} · 概念 {counts.concept} · 语句 {counts.statement} ·
          对象成员 {counts.member} · 错误码 {counts.error}。说人话、给能直接跑的代码。
        </p>
        <p className="mt-1 text-xs text-ink-3">
          这里只教「怎么写、怎么避坑」，不提供在线运行宏——宏要跑在你自己电脑的 Excel 里。
        </p>
      </section>

      <div className="mb-6">
        <MacroSearchBox bundle={bundle} onKeywordChange={setKeyword} />
        {hits === null ? null : (
          <p className="mt-2 text-xs text-ink-3">
            命中 {hits.length} 条{recipes.length === 0 && hits.length === 0 ? '，换个说法试试（如「筛选」「1004」）' : ''}
          </p>
        )}
      </div>

      <div className="mb-6 rounded-card border border-line bg-bg-sub px-4 py-3">
        <p className="text-sm text-ink">
          <span className="mr-1 text-warn">!</span>
          WPS 说明：本页内容只在 <span className="font-medium">Excel</span> 上验证过。WPS
          专业版内置 VBA、写法基本一致；<span className="font-medium">WPS 个人版默认没有 VBA</span>
          ，需要另装「VBA 宏插件」。WPS 的 JS 宏（JSA）是另一套语法，这里不涉及。
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <section className="mb-8">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-h3 text-ink">我要做什么</h2>
              <Link to="/macro/cheatsheet" className="text-sm text-accent hover:text-accent-hover">
                直接看速查表 →
              </Link>
            </div>
            <p className="mb-3 text-sm text-ink-3">
              不知道从哪下手就先挑一件事，照着脚本改成自己表里的列名即可。
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {recipes.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/macro/${entry.id}`}
                  className="rounded-card border border-line px-4 py-3 hover:bg-bg-sub"
                >
                  <p className="text-h4 text-ink">{entry.zhName ?? entry.enName}</p>
                  <p className="mt-1 text-xs text-ink-2">{entry.oneLiner}</p>
                </Link>
              ))}
            </div>
          </section>

          {MACRO_KINDS.filter((kind) => kind.id !== 'recipe').map((kind) => {
            const items = macroByKind(bundle, kind.id as MacroKind).filter(
              (entry) => hitIds === null || hitIds.has(entry.id),
            );
            if (items.length === 0) {
              return null;
            }
            return (
              <section key={kind.id} className="mb-8">
                <h2 className="text-h3 text-ink">{kind.name}</h2>
                <p className="mb-2 text-sm text-ink-3">{kind.desc}</p>
                <div>
                  {items.map((entry) => (
                    <MacroCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-card border border-line p-4">
            <h2 className="mb-2 text-h4 text-ink">学习路径</h2>
            <p className="mb-3 text-xs text-ink-3">按顺序看，三步就能自己改脚本。</p>
            <ol className="flex flex-col gap-3">
              {PATH_STEPS.map((step) => (
                <li key={step.title}>
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  <p className="mt-1 text-xs text-ink-3">{step.desc}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {step.ids.map((id) => {
                      const target = getMacro(bundle, id);
                      if (target === null) {
                        return null;
                      }
                      return (
                        <Link
                          key={id}
                          to={`/macro/${id}`}
                          className="text-accent hover:text-accent-hover"
                        >
                          {`→ ${target.zhName ?? target.enName}`}
                        </Link>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
