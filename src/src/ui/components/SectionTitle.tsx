import type { ReactElement } from 'react';

/** 详情页 6 大板块的编号标题：①②③…，18/28 加粗，标题与内容间距 16px */
export interface SectionTitleProps {
  /** 板块序号，从 1 开始，渲染为带圈数字 */
  index: number;
  title: string;
  /** 右侧的附加内容（如「复制语法」按钮） */
  extra?: ReactElement;
}

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

export default function SectionTitle({ index, title, extra }: SectionTitleProps): ReactElement {
  const mark = CIRCLED[index - 1] ?? `${index}.`;

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-h3 text-ink">
        <span className="mr-2 text-ink-3">{mark}</span>
        {title}
      </h2>
      {extra === undefined ? <span className="hidden" /> : extra}
    </div>
  );
}
