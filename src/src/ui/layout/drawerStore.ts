import { useEffect, useState } from 'react';

/**
 * 安卓抽屉开合状态的全局 store。
 * 与 useToast 相同的「模块级单例 + 订阅」范式：原生返回键监听在 React 组件之外，
 * 需要能同步读取「抽屉是否打开」，故额外提供 isDrawerOpen() 直读模块真值。
 */

let open = false;
const listeners = new Set<(open: boolean) => void>();

/** 供组件外的原生返回键监听同步读取（不经 React 状态） */
export function isDrawerOpen(): boolean {
  return open;
}

/** 设置抽屉开合；仅在状态变化时通知订阅者 */
export function setDrawerOpen(next: boolean): void {
  if (open === next) {
    return;
  }
  open = next;
  listeners.forEach((listener) => listener(next));
}

/** 订阅抽屉开合状态，供 Drawer 渲染 */
export function useDrawerOpen(): boolean {
  const [value, setValue] = useState<boolean>(open);

  useEffect(() => {
    listeners.add(setValue);
    // 挂载时同步一次，避免错过订阅前已存在的状态
    setValue(open);
    return () => {
      listeners.delete(setValue);
    };
  }, []);

  return value;
}
