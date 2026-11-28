import { useCallback, useEffect, useState } from 'react';
import type { FunctionEntry } from '@/types';
import { getFunctionEntry, pushRecent } from '@/storage/repository';

/**
 * 详情页数据 hook：封装「分包加载 + diff 合并 + loading / error 三态」。
 * 页面只管渲染，不关心数据从哪来。
 */

export interface UseFunctionEntryResult {
  entry: FunctionEntry | null;
  loading: boolean;
  /** 找不到的中文说明；正常情况下是 null */
  error: string | null;
  /** 保存或恢复原文后重新拉一次 */
  reload: () => void;
}

export function useFunctionEntry(id: string | undefined): UseFunctionEntryResult {
  const [entry, setEntry] = useState<FunctionEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  const reload = useCallback((): void => {
    setVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (id === undefined || id === '') {
      setEntry(null);
      setLoading(false);
      setError('没有指定要查看的函数');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getFunctionEntry(id)
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        if (loaded === null) {
          setEntry(null);
          // 这一支是「清单里没有这个 id」，属于正常 404，不该显示成加载失败
          setError(null);
        } else {
          setEntry(loaded);
          pushRecent(id);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setEntry(null);
        // 内容包加载器抛的是带文件名/分类的中文说明，优先透出；其它异常用兜底文案
        const message =
          err instanceof Error && err.message !== ''
            ? err.message
            : '这个函数的内容没能加载出来，请刷新页面重试';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, version]);

  return { entry, loading, error, reload };
}
