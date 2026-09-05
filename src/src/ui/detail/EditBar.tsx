import type { ReactElement } from 'react';
import type { FunctionEntry } from '@/types';
import { MESSAGES } from '@/storage/keys';
import type { UseEditDraftResult } from '@/ui/hooks/useEditDraft';

/**
 * 编辑模式的三个 UI 件：
 * 1. EditableText —— 各板块共用的「看是文字、编辑是输入框」，避免每个板块各写一套
 * 2. EditNoticeBar —— 顶部浅黄编辑态提示条
 * 3. EditBar —— 底部常驻操作条（保存 / 取消 / 恢复官方原文）
 */

export interface EditableTextProps {
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  /** 多行（段落说明用） */
  multiline?: boolean;
  /** 非编辑态的额外 class */
  className?: string;
  placeholder?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/** 看是文字、编辑是输入框 */
export function EditableText({
  value,
  editing,
  onChange,
  multiline = false,
  className = '',
  placeholder = '',
  ariaLabel,
}: EditableTextProps): ReactElement {
  if (!editing) {
    return <span className={className}>{value}</span>;
  }

  const shared =
    'w-full rounded-input border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent';

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`${shared} resize-y`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={shared}
    />
  );
}

/** 顶部浅黄编辑态提示条：明确告诉用户改动存在哪里 */
export function EditNoticeBar({ dirty }: { dirty: boolean }): ReactElement {
  return (
    <div className="mb-6 rounded-card bg-bg-edit px-4 py-3">
      <p className="text-sm text-ink-2">
        编辑中 · 改动保存在本机浏览器
        {dirty ? '（有未保存的改动）' : ''}
      </p>
    </div>
  );
}

export interface EditBarProps {
  draft: FunctionEntry | null;
  api: UseEditDraftResult;
  onExit: () => void;
}

/** 底部常驻操作条 */
export default function EditBar({ draft, api, onExit }: EditBarProps): ReactElement {
  if (draft === null) {
    return <span className="hidden" />;
  }

  const onSave = async (): Promise<void> => {
    await api.save();
    onExit();
  };

  const onCancel = (): void => {
    api.cancel();
    onExit();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-ink-2 hover:text-ink"
        >
          取消
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void api.restoreOfficial().then(() => onExit());
            }}
            className="text-sm text-ink-2 hover:text-ink"
          >
            恢复官方原文
          </button>
          <button
            type="button"
            disabled={!api.dirty || api.saving}
            onClick={() => {
              if (window.confirm('确认保存本次编辑结果吗？\n保存后将覆盖本机已保存的内容。')) {
                void onSave();
              }
            }}
            className={`inline-flex h-9 items-center rounded-btn px-4 text-sm text-white ${
              api.dirty && !api.saving ? 'bg-accent hover:bg-accent-hover' : 'bg-ink-3'
            }`}
          >
            {api.saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
      <p className="pb-2 text-center text-xs text-ink-3">{MESSAGES.clearBrowser}</p>
    </div>
  );
}
