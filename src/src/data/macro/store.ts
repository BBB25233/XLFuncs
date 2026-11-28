import type { MacroBundle } from './bundle';
import { loadMacroBundle } from '@/data/macro/loader';

/**
 * 宏内容的一次性加载状态机（M3 拆包）。
 *
 * 为什么要有 store 而不是每个页面各自 useState：
 * - 同一份宏包被 `/macro`、`/macro/:id`、`/macro/cheatsheet`、`/search` 四处使用，
 *   各自加载会重复注入脚本/重复解析；
 * - 失败要能「重试」，而重试入口（页面上的按钮）与加载状态必须共享；
 * - 用 `useSyncExternalStore` 暴露快照，保证 React 18 下订阅语义正确。
 *
 * 状态：idle → loading → ready | error（error 后再次调用 ensure 视为重试）。
 */

export type MacroStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MacroSnapshot {
  status: MacroStatus;
  bundle: MacroBundle | null;
  /** 加载失败时给用户看的中文说明（含缺失包名） */
  error: string | null;
}

let snapshot: MacroSnapshot = { status: 'idle', bundle: null, error: null };
let inflight: Promise<MacroBundle> | null = null;
let loader: () => Promise<MacroBundle> = loadMacroBundle;
const listeners = new Set<() => void>();

/** 测试注入点：替换加载实现并清空状态 */
export function __setMacroLoaderForTest(next: () => Promise<MacroBundle>): void {
  loader = next;
  snapshot = { status: 'idle', bundle: null, error: null };
  inflight = null;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeMacro(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 当前快照；对象只在状态变化时替换，可直接给 useSyncExternalStore */
export function getMacroSnapshot(): MacroSnapshot {
  return snapshot;
}

/** 已加载的内容（未加载时为 null）；给不进 React 的小工具用 */
export function peakMacroBundle(): MacroBundle | null {
  return snapshot.bundle;
}

/**
 * 确保宏内容已加载；并发调用共享同一个 Promise。
 * 失败后调用本函数即重试（状态回到 loading）。
 */
export function ensureMacroBundle(): Promise<MacroBundle> {
  if (snapshot.status === 'ready' && snapshot.bundle !== null) {
    return Promise.resolve(snapshot.bundle);
  }
  if (inflight !== null) {
    return inflight;
  }

  snapshot = { status: 'loading', bundle: snapshot.bundle, error: null };
  emit();

  inflight = loader()
    .then((bundle) => {
      snapshot = { status: 'ready', bundle, error: null };
      inflight = null;
      emit();
      return bundle;
    })
    .catch((err: unknown) => {
      const message =
        err instanceof Error && err.message !== ''
          ? err.message
          : '宏内容没能加载出来，请刷新页面重试';
      snapshot = { status: 'error', bundle: null, error: message };
      inflight = null;
      emit();
      throw err instanceof Error ? err : new Error(message);
    });

  return inflight;
}
