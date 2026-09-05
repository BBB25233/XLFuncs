import type { ReactElement } from 'react';
import type { ArgItem, FunctionEntry } from '@/types';
import SectionTitle from '@/ui/components/SectionTitle';
import { EditableText } from '@/ui/detail/EditBar';

/**
 * 板块③：参数逐项说明。
 * 每个参数固定 4 要素：填什么 / 能填什么（枚举常见取值）/ 不填会怎样 / 填错会怎样。
 * 参数超过 4 个时必须标注「最常填错的是第 X 个」（PRD §10.5.2）。
 */

export interface SectionArgsProps {
  entry: FunctionEntry;
  editing: boolean;
  /** 当前高亮的参数 key（由板块②点击触发） */
  activeKey: string;
  onArgFieldChange: (
    index: number,
    key: 'zh' | 'desc' | 'accepts' | 'ifOmitted' | 'tip',
    value: string,
  ) => void;
}

function Field({
  label,
  value,
  editing,
  onChange,
  tone = 'normal',
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  tone?: 'normal' | 'warn';
}): ReactElement {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <span className="shrink-0 text-xs text-ink-3 sm:w-20">{label}</span>
      <div className={`min-w-0 flex-1 text-sm ${tone === 'warn' ? 'text-warn' : 'text-ink-2'}`}>
        <EditableText value={value} editing={editing} onChange={onChange} multiline />
      </div>
    </div>
  );
}

function ArgCard({
  arg,
  index,
  editing,
  activeKey,
  onArgFieldChange,
}: {
  arg: ArgItem;
  index: number;
  editing: boolean;
  activeKey: string;
  onArgFieldChange: SectionArgsProps['onArgFieldChange'];
}): ReactElement {
  const active = activeKey === arg.key;

  return (
    <div
      id={`arg-${arg.key}`}
      className={`rounded-card px-4 py-3 ${
        active ? 'bg-bg-sub' : 'bg-bg'
      } hairline`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-h4 font-semibold text-ink">
          <EditableText
            value={arg.zh}
            editing={editing}
            onChange={(value) => onArgFieldChange(index, 'zh', value)}
            ariaLabel="参数中文名"
          />
        </span>
        <span className="font-mono text-xs text-ink-3">{arg.en}</span>
        <span
          className={`inline-flex h-5 items-center rounded-badge border px-2 text-xs ${
            arg.required ? 'border-line text-ink-2' : 'border-line text-ink-3'
          }`}
        >
          {arg.required ? '必填' : '选填'}
        </span>
        {arg.pitfallRank === undefined ? null : (
          <span className="inline-flex h-5 items-center rounded-badge border border-line px-2 text-xs text-warn">
            最常填错第 {arg.pitfallRank} 个
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Field
          label="填什么"
          value={arg.desc}
          editing={editing}
          onChange={(value) => onArgFieldChange(index, 'desc', value)}
        />
        {arg.accepts === undefined ? null : (
          <Field
            label="能填什么"
            value={arg.accepts}
            editing={editing}
            onChange={(value) => onArgFieldChange(index, 'accepts', value)}
          />
        )}
        {arg.ifOmitted === undefined ? null : (
          <Field
            label="不填会怎样"
            value={arg.ifOmitted}
            editing={editing}
            onChange={(value) => onArgFieldChange(index, 'ifOmitted', value)}
          />
        )}
        {arg.tip === undefined ? null : (
          <Field
            label="填错会怎样"
            value={arg.tip}
            editing={editing}
            onChange={(value) => onArgFieldChange(index, 'tip', value)}
            tone="warn"
          />
        )}
        {arg.example === undefined ? null : (
          <p className="text-xs text-ink-3">
            示例写法：<code className="font-mono">{arg.example}</code>
          </p>
        )}
      </div>
    </div>
  );
}

export default function SectionArgs({
  entry,
  editing,
  activeKey,
  onArgFieldChange,
}: SectionArgsProps): ReactElement {
  if (entry.syntax.args.length === 0) {
    return (
      <section>
        <SectionTitle index={3} title="参数逐项说明" />
        <p className="text-sm text-ink-3">这个函数的参数说明还在编写中。</p>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle index={3} title="参数逐项说明" />
      <div className="flex flex-col gap-3">
        {entry.syntax.args.map((arg, index) => (
          <ArgCard
            key={arg.key}
            arg={arg}
            index={index}
            editing={editing}
            activeKey={activeKey}
            onArgFieldChange={onArgFieldChange}
          />
        ))}
      </div>
    </section>
  );
}
