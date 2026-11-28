import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { MacroBundle } from '@/data/macro/bundle';
import {
  ensureMacroBundle,
  getMacroSnapshot,
  subscribeMacro,
  type MacroStatus,
} from '@/data/macro/store';

/**
 * 宏内容加载 hook（M3 拆包）。
 *
 * 页面不再直接 import 内容（那会把 60 条正文打进壳），而是：
 * 首次挂载 → ensureMacroBundle()（文件夹版注入 packs/macro.<hash>.js）
 * → 从 store 的快照里拿 ready/loading/error 三态与重试入口。
 */

export interface UseMacroBundleResult {
  status: MacroStatus;
  bundle: MacroBundle | null;
  error: string | null;
  /** 失败后重新加载（也用于「包被替换了想刷新」） */
  retry: () => void;
}

export function useMacroBundle(): UseMacroBundleResult {
  const snapshot = useSyncExternalStore(subscribeMacro, getMacroSnapshot, getMacroSnapshot);

  useEffect(() => {
    if (snapshot.status === 'idle') {
      void ensureMacroBundle().catch(() => undefined);
    }
  }, [snapshot.status]);

  const retry = useCallback((): void => {
    void ensureMacroBundle().catch(() => undefined);
  }, []);

  return { status: snapshot.status, bundle: snapshot.bundle, error: snapshot.error, retry };
}
