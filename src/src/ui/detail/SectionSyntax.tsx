import type { ReactElement } from 'react';
import type { FunctionEntry } from '@/types';
import SectionTitle from '@/ui/components/SectionTitle';
import CodeBlock from '@/ui/components/CodeBlock';
import { EditableText } from '@/ui/detail/EditBar';

/**
 * 板块②：语法结构。
 * 两行：上行中文占位符（选填参数用 [ ] 包起来），下行英文原式。
 * 点某个参数 → 下方参数说明滚动并高亮对应项（高亮状态由详情页持有）。
 */

export interface SectionSyntaxProps {
  entry: FunctionEntry;
  editing: boolean;
  /** 当前高亮的参数 key */
  activeKey: string;
  onActiveKeyChange: (key: string) => void;
  onPatternCnChange: (value: string) => void;
  onPatternEnChange: (value: string) => void;
}

export default function SectionSyntax({
  entry,
  editing,
  activeKey,
  onActiveKeyChange,
  onPatternCnChange,
  onPatternEnChange,
}: SectionSyntaxProps): ReactElement {
  const pick = (key: string): void => {
    onActiveKeyChange(key);
    const node = document.getElementById(`arg-${key}`);
    if (node !== null) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section>
      <SectionTitle index={2} title="语法结构" />

      {editing ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-ink-3">中文占位符行（选填参数用 [ ] 包起来）</p>
            <EditableText
              value={entry.syntax.patternCn}
              editing
              onChange={onPatternCnChange}
              ariaLabel="中文占位符行"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-ink-3">英文原式行</p>
            <EditableText
              value={entry.syntax.patternEn}
              editing
              onChange={onPatternEnChange}
              ariaLabel="英文原式行"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <CodeBlock code={entry.syntax.patternCn} />
          <CodeBlock code={entry.syntax.patternEn} />
        </div>
      )}

      {entry.syntax.args.length === 0 ? null : (
        <div className="mt-4 flex flex-wrap gap-2">
          {entry.syntax.args.map((arg) => (
            <button
              key={arg.key}
              type="button"
              onClick={() => pick(arg.key)}
              className={`inline-flex h-8 items-center rounded-badge border px-3 text-xs ${
                activeKey === arg.key
                  ? 'border-accent text-accent'
                  : 'border-line text-ink-2 hover:text-ink'
              }`}
            >
              {arg.zh}
              {arg.required ? '' : '（选填）'}
            </button>
          ))}
        </div>
      )}

      {entry.returnValue === '' ? null : (
        <p className="mt-4 text-sm text-ink-2">
          <span className="text-ink-3">返回什么：</span>
          {entry.returnValue}
        </p>
      )}
    </section>
  );
}
