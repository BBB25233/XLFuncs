import type { ReactElement } from 'react';
import { useCopy } from '@/ui/clipboard/useCopy';

/**
 * 两个变体的复制按钮：`复制公式` / `复制公式+数据`。
 * 载荷统一由 core/tsv.ts 生产，**禁止在组件里自己拼字符串**（ADR-A4）。
 */

export interface CopyButtonProps {
  /** 要复制的文本（由 core 层拼好） */
  text: string;
  /** 按钮文案 */
  label: string;
  /** 复制成功后的提示文案，默认统一口径 */
  hint?: string;
  /** primary = 实心蓝主按钮；secondary = 白底描边次按钮 */
  variant?: 'primary' | 'secondary';
  /** 禁用（内容为空时） */
  disabled?: boolean;
}

export default function CopyButton({
  text,
  label,
  hint,
  variant = 'secondary',
  disabled = false,
}: CopyButtonProps): ReactElement {
  const { copy } = useCopy();

  const base =
    'inline-flex h-9 items-center justify-center rounded-btn px-4 text-sm sm:h-9';
  const style =
    variant === 'primary'
      ? 'bg-accent text-white hover:bg-accent-hover'
      : 'border border-line bg-bg text-ink hover:border-ink-3';

  return (
    <button
      type="button"
      disabled={disabled || text === ''}
      onClick={() => {
        void copy(text, hint);
      }}
      className={`${base} ${style} ${
        disabled || text === '' ? 'cursor-not-allowed opacity-40' : ''
      }`}
    >
      {label}
    </button>
  );
}
