import type { ReactElement } from 'react';
import { useToasts, dismissToast } from '@/ui/hooks/useToast';
import type { ToastItem } from '@/ui/hooks/useToast';

const KIND_STYLE: Record<ToastItem['kind'], string> = {
  success: 'text-ok',
  error: 'text-err',
  info: 'text-ink-2',
};

/** 单条轻提示 */
export function Toast({ item }: { item: ToastItem }): ReactElement {
  return (
    <div
      className="fade-in flex items-center justify-between gap-4 rounded-btn hairline bg-bg px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <span className={`text-sm ${KIND_STYLE[item.kind]}`}>{item.text}</span>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        className="shrink-0 text-xs text-ink-3 hover:text-ink"
        aria-label="关闭提示"
      >
        关闭
      </button>
    </div>
  );
}

/**
 * Toast 容器：固定在顶部居中，2 秒后自动淡出。
 * 无阴影、无深色底，只用 0.5px 细线区分层次。
 */
export function ToastHost(): ReactElement {
  const items = useToasts();

  if (items.length === 0) {
    return <span className="hidden" />;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto w-full max-w-content">
          <Toast item={item} />
        </div>
      ))}
    </div>
  );
}

export default ToastHost;
