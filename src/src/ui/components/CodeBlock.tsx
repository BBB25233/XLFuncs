import type { ReactElement } from 'react';
import { useCopy } from '@/ui/clipboard/useCopy';

/**
 * 等宽公式块：底色 #F7F7F5、6px 圆角、16px 内边距、
 * 超出宽度不换行横向滚动（保证公式完整），右上角一个复制小图标。
 */

function CopyIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10.5 3.5H4A1.5 1.5 0 0 0 2.5 5v6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface CodeBlockProps {
  /** 公式或代码原文 */
  code: string;
  /** 复制成功后的提示文案（默认统一口径） */
  hint?: string;
  /** 大号展示（详情页语法区用） */
  large?: boolean;
}

export default function CodeBlock({ code, hint, large = false }: CodeBlockProps): ReactElement {
  const { copy } = useCopy();

  return (
    <div className="relative rounded-code bg-code-bg">
      <button
        type="button"
        onClick={() => {
          void copy(code, hint);
        }}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-badge text-ink-3 hover:bg-bg hover:text-ink"
        aria-label="复制"
        title="复制"
      >
        <CopyIcon />
      </button>
      <pre
        className={`scroll-x overflow-y-hidden rounded-code px-4 py-3 pr-10 font-mono text-ink ${
          large ? 'text-code' : 'text-code'
        }`}
      >
        <code className="whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
