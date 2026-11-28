import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MacroKind } from '@/types';
import { KIND_NAME, MACRO_KINDS, macroByKind } from '@/data/macro';
import { useMacroBundle } from '@/ui/hooks/useMacroBundle';
import { MacroPackError, MacroPackLoading } from '@/ui/macro/MacroPackState';
import { useCopy } from '@/ui/clipboard/useCopy';

/**
 * 宏速查表（M2 初版 / M3 扩到 60 条 / 错误码 30 条 / 概念 36 条 / 成员 90 条 / 语句 45 条 / JSA 30 条 / 配方 40 条后共 271 条 + 20 个内建函数 = 291 行）。
 *
 * 条目部分的数据来自已收录条目（syntax + oneLiner），所以不会出现
 * 「速查表和详情页说法不一致」；内建函数组来自同一个宏内容包的 `builtins`。
 * M3 拆包后由 `useMacroBundle()` 提供内容，页面负责三态。
 */

function CopyRow({ code, hint }: { code: string; hint: string }): ReactElement {
  const { copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => {
        void copy(code, hint);
      }}
      className="rounded-badge border border-line px-2 py-0.5 text-xs text-ink-3 hover:bg-bg-sub hover:text-ink"
      aria-label="复制这一行"
      title="复制"
    >
      复制
    </button>
  );
}

export default function MacroCheatsheetPage(): ReactElement {
  const { status, bundle, error, retry } = useMacroBundle();

  if (status !== 'ready' || bundle === null) {
    return status === 'error' ? (
      <MacroPackError error={error} retry={retry} />
    ) : (
      <MacroPackLoading label="正在加载速查表" />
    );
  }

  const total = bundle.entries.length;
  const builtinTotal = bundle.builtins.length;

  return (
    <div className="mx-auto max-w-content">
      <h1 className="text-h1 text-ink">宏速查表</h1>
      <p className="mt-2 text-body text-ink-2">
        一屏看完 {total} 条已收录写法 + {builtinTotal} 个常用内建函数（共 {total + builtinTotal} 行），点「复制」直接拿去用。
      </p>
      <p className="mt-1 text-xs text-ink-3">
        写法只保留骨架，参数含义点条目名进详情看；内建函数没有详情页，按骨架填参数即可。所有内容在 Excel 上验证过，WPS 见首页说明。
      </p>

      {MACRO_KINDS.filter((kind) => kind.id !== 'error').map((kind) => {
        const items = macroByKind(bundle, kind.id as MacroKind);
        if (items.length === 0) {
          return null;
        }
        return (
          <section key={kind.id} className="mt-8">
            <h2 className="mb-2 text-h3 text-ink">{kind.name}</h2>
            <div className="overflow-x-auto rounded-card border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-sub text-left text-xs text-ink-3">
                    <th className="px-3 py-2 font-normal">名称</th>
                    <th className="px-3 py-2 font-normal">写法骨架</th>
                    <th className="px-3 py-2 font-normal">一句话</th>
                    <th className="px-3 py-2 font-normal"> </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((entry) => (
                    <tr key={entry.id} className="hairline-t align-top">
                      <td className="whitespace-nowrap px-3 py-2">
                        <Link to={`/macro/${entry.id}`} className="text-ink hover:text-accent">
                          {entry.zhName ?? entry.enName}
                        </Link>
                        <span className="ml-2 font-mono text-xs text-ink-3">{entry.enName}</span>
                      </td>
                      <td className="px-3 py-2">
                        <pre className="scroll-x font-mono text-xs text-ink">
                          <code className="whitespace-pre">{entry.syntax}</code>
                        </pre>
                      </td>
                      <td className="px-3 py-2 text-xs text-ink-2">{entry.oneLiner}</td>
                      <td className="px-3 py-2 text-right">
                        <CopyRow
                          code={entry.syntax}
                          hint={`已复制${KIND_NAME[entry.kind]}：${entry.zhName ?? entry.enName}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <section className="mt-8">
        <h2 className="mb-2 text-h3 text-ink">常用内建函数</h2>
        <p className="mb-3 text-xs text-ink-3">
          VBA 自带、写宏时几乎天天用到的 {builtinTotal} 个。它们不属于「宏条目」，没有详情页。
        </p>
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-sub text-left text-xs text-ink-3">
                <th className="px-3 py-2 font-normal">函数</th>
                <th className="px-3 py-2 font-normal">写法骨架</th>
                <th className="px-3 py-2 font-normal">一句话</th>
                <th className="px-3 py-2 font-normal"> </th>
              </tr>
            </thead>
            <tbody>
              {bundle.builtins.map((item) => (
                <tr key={item.name} className="hairline-t align-top">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-ink">{item.name}</td>
                  <td className="px-3 py-2">
                    <pre className="scroll-x font-mono text-xs text-ink">
                      <code className="whitespace-pre">{item.syntax}</code>
                    </pre>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-2">{item.oneLiner}</td>
                  <td className="px-3 py-2 text-right">
                    <CopyRow code={item.syntax} hint={`已复制内建函数：${item.name}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 flex gap-4 text-sm">
        <Link to="/macro" className="text-accent hover:text-accent-hover">
          回到宏首页
        </Link>
        <Link to="/" className="text-accent hover:text-accent-hover">
          看看函数速查
        </Link>
      </div>
    </div>
  );
}
