import type { ReactElement } from 'react';
import type { FunctionEntry } from '@/types';
import SectionTitle from '@/ui/components/SectionTitle';
import { EditableText } from '@/ui/detail/EditBar';
import { useCopy } from '@/ui/clipboard/useCopy';

/**
 * 板块①：一句话用途。
 * 必须带上 P0-17 的显式说明：中文名是助记名，往 Excel 里输入请用英文名（可点击复制）。
 */

export interface SectionOneLinerProps {
  entry: FunctionEntry;
  editing: boolean;
  onChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
}

export default function SectionOneLiner({
  entry,
  editing,
  onChange,
  onSummaryChange,
}: SectionOneLinerProps): ReactElement {
  const { copy } = useCopy();

  return (
    <section>
      <SectionTitle index={1} title="一句话用途" />
      {editing ? (
        <div className="flex flex-col gap-3">
          <EditableText
            value={entry.oneLiner}
            editing
            onChange={onChange}
            className="text-h3"
            ariaLabel="一句话用途"
            placeholder="≤20 字，动词开头，如：竖着查表，返回同一行别处的值"
          />
          <EditableText
            value={entry.summary}
            editing
            multiline
            onChange={onSummaryChange}
            ariaLabel="补充说明"
            placeholder="2–3 句说明「什么时候该用它」"
          />
        </div>
      ) : (
        <>
          <p className="text-h3 text-ink">{entry.oneLiner}</p>
          <p className="mt-3 text-body text-ink-2">{entry.summary}</p>
        </>
      )}

      <div className="mt-4 rounded-card bg-bg-sub px-4 py-3">
        <p className="text-sm text-ink-2">
          中文名只是帮你理解和搜索的
          <span className="text-ink">助记名</span>
          ，往 Excel 里输入的永远是
          <button
            type="button"
            onClick={() => {
              void copy(entry.enName);
            }}
            className="mx-1 font-mono text-accent hover:text-accent-hover"
          >
            {entry.enName}
          </button>
          （点一下可复制）。
        </p>
      </div>
    </section>
  );
}
