import { useEffect, useState } from 'react';

/**
 * Toast 队列的全局 hook。
 * 采用模块级单例 + 订阅，避免为一条提示引入全局 Context 与 Provider 层层包裹。
 */

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

const TOAST_DURATION = 2000;

let toastSeq = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

/** 通知所有订阅者（复制一份数组，避免外部误改内部状态） */
function emit(): void {
  const snapshot = toasts.slice();
  listeners.forEach((listener) => listener(snapshot));
}

/** 弹出一条顶部轻提示。toast 文案必须使用 §8.5 的统一口径 */
export function showToast(text: string, kind: ToastKind = 'success'): void {
  toastSeq += 1;
  const id = toastSeq;
  toasts = [...toasts, { id, kind, text }];
  emit();
  window.setTimeout(() => {
    dismissToast(id);
  }, TOAST_DURATION);
}

/** 手动关闭一条提示（2 秒后也会自动淡出） */
export function dismissToast(id: number): void {
  const next = toasts.filter((item) => item.id !== id);
  if (next.length === toasts.length) {
    return;
  }
  toasts = next;
  emit();
}

/** 订阅当前 toast 列表，供 ToastHost 渲染 */
export function useToasts(): ToastItem[] {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    listeners.add(setItems);
    // 挂载时同步一次，避免错过订阅前已经存在的提示
    setItems(toasts.slice());
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return items;
}
