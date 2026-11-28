import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MacroEntry, PitfallLevel } from '@/types';
import { get as getFunctionIndex } from '@/data';
import type { MacroBundle } from '@/data/macro/bundle';
import { getMacro, KIND_NAME } from '@/data/macro';
import CodeBlock from '@/ui/components/CodeBlock';
import SectionTitle from '@/ui/components/SectionTitle';
import { MacroHostBadge, MacroKindBadge, MacroLevelBadge } from '@/ui/macro/MacroBadges';
import { MacroPackError, MacroPackLoading } from '@/ui/macro/MacroPackState';
import { useMacroBundle } from '@/ui/hooks/useMacroBundle';

/**
 * 宏详情页（M2）：七段式
 * ① 定位 → ② 语法 → ③ 参数（折叠）→ ④ 示例 → ⑤ 常见错误 → ⑥ 关联 → ⑦ 进阶（折叠）
 *
 * 与函数详情页的差别：没有试算区（宏不能在网页里跑），也没有编辑态
 * （甲方编辑体系绑定 FunctionEntry，宏内容由我们统一维护）。
 */

const LEVEL_WEIGHT: Record<PitfallLevel, number> = { high: 0, mid: 1, low: 2 };
const LEVEL_LABEL: Record<PitfallLevel, string> = {
  high: '高频坑',
  mid: '常见',
  low: '少见',
};

function MacroNotFound({ id, bundle }: { id: string; bundle: MacroBundle }): ReactElement {
  const picks = ['delete-empty-rows', 'format-column', 'what-is-macro']
    .map((mid) => getMacro(bundle, mid))
    .filter((entry): entry is MacroEntry => entry !== null);

  return (
    <div className="mx-auto max-w-content py-12">
      <p className="text-h4 text-ink">没找到「{id}」这条宏内容</p>
      <p className="mt-2 text-sm text-ink-2">
        可能还没收录。先看看下面这几条最常用的，或者回宏首页按类型找。
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {picks.map((entry) => (
          <li key={entry.id} className="hairline-b">
            <Link to={`/macro/${entry.id}`} className="block py-3 text-sm text-ink hover:text-accent">
              <span className="font-semibold">
                {entry.zhName === null ? entry.enName : entry.zhName}
              </span>
              <span className="ml-2 text-ink-2">{entry.oneLiner}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-4">
        <Link to="/macro" className="text-sm text-accent hover:text-accent-hover">
          回到宏首页
        </Link>
        <Link to="/" className="text-sm text-accent hover:text-accent-hover">
          回到函数首页
        </Link>
      </div>
    </div>
  );
}

/** 关联跳转：先看是不是宏条目，再退回函数条目 */
function RelatedLink({
  id,
  why,
  bundle,
}: {
  id: string;
  why: string;
  bundle: MacroBundle;
}): ReactElement | null {
  const macro = getMacro(bundle, id);
  if (macro !== null) {
    return (
      <li className="hairline-b py-2">
        <Link to={`/macro/${id}`} className="text-sm text-ink hover:text-accent">
          {macro.zhName === null ? '' : `${macro.zhName} `}
          <span className="font-mono text-ink-2">{macro.enName}</span>
        </Link>
        <span className="ml-2 inline-flex h-5 items-center rounded-badge border border-line bg-bg-sub px-2 text-xs text-ink-3">
          宏 · {KIND_NAME[macro.kind]}
        </span>
        <p className="mt-1 text-xs text-ink-2">{why}</p>
      </li>
    );
  }

  const fn = getFunctionIndex(id);
  if (fn !== null) {
    return (
      <li className="hairline-b py-2">
        <Link to={`/f/${id}`} className="text-sm text-ink hover:text-accent">
          {fn.zhName === null ? '' : `${fn.zhName} `}
          <span className="font-mono text-ink-2">{fn.enName}</span>
        </Link>
        <span className="ml-2 inline-flex h-5 items-center rounded-badge border border-line bg-bg-sub px-2 text-xs text-ink-3">
          函数
        </span>
        <p className="mt-1 text-xs text-ink-2">{why}</p>
      </li>
    );
  }

  return null;
}

function DetailBody({ entry, bundle }: { entry: MacroEntry; bundle: MacroBundle }): ReactElement {
  const pitfalls = entry.pitfalls
    .slice()
    .sort((a, b) => LEVEL_WEIGHT[a.level] - LEVEL_WEIGHT[b.level]);

  return (
    <div className="mx-auto max-w-content">
      <nav className="mb-3 text-xs text-ink-3">
        <Link to="/macro" className="hover:text-accent">
          宏与 VBA
        </Link>
        <span className="mx-1">/</span>
        <span>{KIND_NAME[entry.kind]}</span>
      </nav>

      <header className="mb-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-h1 text-ink">{entry.zhName ?? entry.enName}</h1>
          <span className="font-mono text-sm text-ink-2">{entry.enName}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <MacroKindBadge kind={entry.kind} />
          <MacroHostBadge host={entry.host} />
          <MacroLevelBadge level={entry.level} />
        </div>
      </header>

      {entry.hostNotes === undefined ? null : (
        <div className="mb-6 rounded-card border border-line bg-bg-sub px-4 py-3">
          <p className="text-sm text-ink">
            <span className="mr-1 text-warn">!</span>
            宿主差异：{entry.hostNotes}
          </p>
        </div>
      )}

      <section className="mb-8">
        <SectionTitle index={1} title="这是干什么的" />
        <p className="text-body text-ink">{entry.oneLiner}</p>
        <p className="mt-2 text-sm text-ink-2">{entry.summary}</p>
      </section>

      <section className="mb-8">
        <SectionTitle index={2} title="怎么写" />
        <CodeBlock code={entry.syntax} large hint="已复制语法骨架" />
      </section>

      {entry.params === undefined || entry.params.length === 0 ? null : (
        <section className="mb-8">
          <SectionTitle index={3} title="参数说明" />
          <details className="rounded-card border border-line">
            <summary className="cursor-pointer px-4 py-3 text-sm text-ink-2">
              展开 {entry.params.length} 个参数
            </summary>
            <div className="hairline-t overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-3">
                    <th className="px-4 py-2 font-normal">参数</th>
                    <th className="px-4 py-2 font-normal">类型</th>
                    <th className="px-4 py-2 font-normal">必填</th>
                    <th className="px-4 py-2 font-normal">填什么</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.params.map((param) => (
                    <tr key={param.name} className="hairline-t align-top">
                      <td className="px-4 py-2 font-mono text-ink">{param.name}</td>
                      <td className="px-4 py-2 text-ink-2">{param.type}</td>
                      <td className="px-4 py-2 text-ink-2">{param.required ? '必填' : '可选'}</td>
                      <td className="px-4 py-2 text-ink-2">{param.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}

      <section className="mb-8">
        <SectionTitle index={4} title="能直接跑的示例" />
        <div className="flex flex-col gap-4">
          {entry.examples.map((example) => (
            <div key={example.title} className="rounded-card border border-line p-4">
              <p className="mb-2 text-h4 text-ink">{example.title}</p>
              <CodeBlock code={example.code} hint="已复制这段代码" />
              <dl className="mt-3 flex flex-col gap-1 text-xs">
                <div className="flex gap-2">
                  <dt className="shrink-0 text-ink-3">怎么运行</dt>
                  <dd className="text-ink-2">{example.howToRun}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 text-ink-3">会看到</dt>
                  <dd className="text-ink-2">{example.result}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <SectionTitle index={5} title="常见错误与注意事项" />
        {pitfalls.length === 0 ? (
          <p className="text-sm text-ink-3">这一条的踩坑记录还在补。</p>
        ) : (
          <div>
            {pitfalls.map((pitfall) => (
              <div key={pitfall.title} className="hairline-b py-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-badge border border-line text-[11px] text-warn">
                    !
                  </span>
                  <span className="text-h4 font-semibold text-ink">{pitfall.title}</span>
                  {pitfall.errorCode === undefined ? null : (
                    <code className="font-mono text-sm text-err">{pitfall.errorCode}</code>
                  )}
                  <span className="inline-flex h-5 items-center rounded-badge border border-line px-2 text-xs text-ink-3">
                    {LEVEL_LABEL[pitfall.level]}
                  </span>
                </div>
                <p className="pl-6 text-sm text-ink-2">
                  <span className="text-ink-3">为什么会错：</span>
                  {pitfall.reason}
                </p>
                <p className="mt-1 pl-6 text-sm text-ink">
                  <span className="text-ink-3">怎么改：</span>
                  {pitfall.fix}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <SectionTitle index={6} title="相关条目" />
        <ul>
          {entry.related.map((item) => (
            <RelatedLink key={`${item.id}-${item.kind}`} id={item.id} why={item.why} bundle={bundle} />
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <SectionTitle index={7} title="进阶与边界" />
        <details className="rounded-card border border-line">
          <summary className="cursor-pointer px-4 py-3 text-sm text-ink-2">展开补充说明</summary>
          <div className="hairline-t px-4 py-3 text-sm text-ink-2">
            <p>
              本页示例都在 Excel 桌面版上验证过；WPS 只在专业版（内置 VBA）下写法一致，
              个人版需要另装宏插件，且未做逐条实测。
            </p>
            <p className="mt-2">
              这里不教的事：删除文件、改注册表、调用 Shell、用
              <code className="font-mono">CreateObject("WScript.Shell")</code>
              启动外部程序。这类代码在别人的电脑上有真实风险，出了问题也很难排查。
            </p>
            {entry.params === undefined ? (
              <p className="mt-2">这条没有参数，照着语法骨架替换表名/区域即可。</p>
            ) : null}
          </div>
        </details>
      </section>
    </div>
  );
}

export default function MacroDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { status, bundle, error, retry } = useMacroBundle();

  if (status !== 'ready' || bundle === null) {
    return status === 'error' ? (
      <MacroPackError error={error} retry={retry} />
    ) : (
      <MacroPackLoading label="正在加载这条宏内容" />
    );
  }

  if (id === undefined || id === '') {
    return <MacroNotFound id="这个条目" bundle={bundle} />;
  }
  const entry = getMacro(bundle, id);
  if (entry === null) {
    return <MacroNotFound id={id} bundle={bundle} />;
  }
  return <DetailBody entry={entry} bundle={bundle} />;
}
