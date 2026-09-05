import type { ReactElement } from 'react';
import type { FunctionEntry, PitfallLevel } from '@/types';
import SectionTitle from '@/ui/components/SectionTitle';
import { EditableText } from '@/ui/detail/EditBar';

/**
 * 板块⑤：常见错误与注意事项。
 * 每条固定句式：错在哪 → 为什么会错 → 怎么改。错误值用等宽红字。
 * 条目按 level 排序：high 优先展示（PRD §5.2）。
 */

export interface SectionPitfallsProps {
  entry: FunctionEntry;
  editing: boolean;
  onPitfallFieldChange: (
    index: number,
    key: 'title' | 'reason' | 'fix',
    value: string,
  ) => void;
}

const LEVEL_WEIGHT: Record<PitfallLevel, number> = { high: 0, mid: 1, low: 2 };
const LEVEL_LABEL: Record<PitfallLevel, string> = {
  high: '高频坑',
  mid: '常见',
  low: '少见',
};

export default function SectionPitfalls({
  entry,
  editing,
  onPitfallFieldChange,
}: SectionPitfallsProps): ReactElement {
  if (entry.pitfalls.length === 0) {
    return (
      <section>
        <SectionTitle index={5} title="常见错误与注意事项" />
        <p className="text-sm text-ink-3">这个函数的注意事项还在编写中。</p>
      </section>
    );
  }

  // 按踩坑频率排序；编辑态保持原顺序，避免用户输入时条目乱跳
  const ordered = editing
    ? entry.pitfalls.map((pitfall, index) => ({ pitfall, index }))
    : entry.pitfalls
        .map((pitfall, index) => ({ pitfall, index }))
        .sort((a, b) => LEVEL_WEIGHT[a.pitfall.level] - LEVEL_WEIGHT[b.pitfall.level]);

  return (
    <section>
      <SectionTitle index={5} title="常见错误与注意事项" />
      <div>
        {ordered.map(({ pitfall, index }) => (
          <div key={`${pitfall.title}-${index}`} className="hairline-b py-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-badge border border-line text-[11px] text-warn">
                !
              </span>
              <span className="text-h4 font-semibold text-ink">
                <EditableText
                  value={pitfall.title}
                  editing={editing}
                  onChange={(value) => onPitfallFieldChange(index, 'title', value)}
                  ariaLabel="错在哪"
                />
              </span>
              {pitfall.errorCode === undefined ? null : (
                <code className="font-mono text-sm text-err">{pitfall.errorCode}</code>
              )}
              <span className="inline-flex h-5 items-center rounded-badge border border-line px-2 text-xs text-ink-3">
                {LEVEL_LABEL[pitfall.level]}
              </span>
            </div>
            <p className="pl-6 text-sm text-ink-2">
              <span className="text-ink-3">为什么会错：</span>
              <EditableText
                value={pitfall.reason}
                editing={editing}
                multiline
                onChange={(value) => onPitfallFieldChange(index, 'reason', value)}
                ariaLabel="为什么会错"
              />
            </p>
            <p className="mt-1 pl-6 text-sm text-ink">
              <span className="text-ink-3">怎么改：</span>
              <EditableText
                value={pitfall.fix}
                editing={editing}
                multiline
                onChange={(value) => onPitfallFieldChange(index, 'fix', value)}
                ariaLabel="怎么改"
              />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
