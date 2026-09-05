import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FunctionEntry } from '@/types';
import { resetFunction, saveFunction } from '@/storage/repository';
import { showToast, type ToastKind } from '@/ui/hooks/useToast';

/**
 * 编辑模式 hook：草稿 state、脏检查、保存 / 取消 / 恢复官方原文。
 *
 * 保存走 storage/repository.saveFunction() —— 内部只写「改了哪几个字段」的增量，
 * 我们以后更新内置内容时，甲方的改动会自动叠加在上面。
 */

export interface UseEditDraftResult {
  /** 当前草稿；entry 还没加载好时是 null */
  draft: FunctionEntry | null;
  /** 和原文相比有没有改动 */
  dirty: boolean;
  saving: boolean;
  /** 改一句话用途 */
  setOneLiner: (value: string) => void;
  /** 改补充说明 */
  setSummary: (value: string) => void;
  /** 改「返回什么」 */
  setReturnValue: (value: string) => void;
  /** 改中文占位符语法行 */
  setPatternCn: (value: string) => void;
  /** 改英文原式语法行 */
  setPatternEn: (value: string) => void;
  /** 改某个参数的某个字段 */
  setArgField: (index: number, key: 'zh' | 'desc' | 'accepts' | 'ifOmitted' | 'tip', value: string) => void;
  /** 改某个示例的某个字段 */
  setExampleField: (
    index: number,
    key: 'title' | 'scene' | 'formula' | 'result' | 'explanation' | 'dataTsv',
    value: string,
  ) => void;
  /** 改某条注意事项的某个字段 */
  setPitfallField: (index: number, key: 'title' | 'reason' | 'fix', value: string) => void;
  /** 改某条相关函数的说明 */
  setRelatedField: (index: number, key: 'why', value: string) => void;
  /** 保存 */
  save: () => Promise<void>;
  /** 放弃改动，回到原文 */
  cancel: () => void;
  /** 恢复官方原文 */
  restoreOfficial: () => Promise<void>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function useEditDraft(entry: FunctionEntry | null): UseEditDraftResult {
  const [draft, setDraft] = useState<FunctionEntry | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // 原文变了（切换函数 / 保存后重新加载 / 恢复原文）就重置草稿
  useEffect(() => {
    setDraft(entry === null ? null : clone(entry));
  }, [entry]);

  const dirty = useMemo<boolean>(() => {
    if (entry === null || draft === null) {
      return false;
    }
    return JSON.stringify(entry) !== JSON.stringify(draft);
  }, [entry, draft]);

  /** 统一的可变更新入口 */
  const mutate = useCallback((updater: (current: FunctionEntry) => void): void => {
    setDraft((current) => {
      if (current === null) {
        return current;
      }
      const next = clone(current);
      updater(next);
      return next;
    });
  }, []);

  const setOneLiner = useCallback(
    (value: string): void => {
      mutate((current) => {
        current.oneLiner = value;
      });
    },
    [mutate],
  );

  const setSummary = useCallback(
    (value: string): void => {
      mutate((current) => {
        current.summary = value;
      });
    },
    [mutate],
  );

  const setReturnValue = useCallback(
    (value: string): void => {
      mutate((current) => {
        current.returnValue = value;
      });
    },
    [mutate],
  );

  const setPatternCn = useCallback(
    (value: string): void => {
      mutate((current) => {
        current.syntax.patternCn = value;
      });
    },
    [mutate],
  );

  const setPatternEn = useCallback(
    (value: string): void => {
      mutate((current) => {
        current.syntax.patternEn = value;
      });
    },
    [mutate],
  );

  const setArgField = useCallback(
    (index: number, key: 'zh' | 'desc' | 'accepts' | 'ifOmitted' | 'tip', value: string): void => {
      mutate((current) => {
        const arg = current.syntax.args[index];
        if (arg === undefined) {
          return;
        }
        arg[key] = value;
      });
    },
    [mutate],
  );

  const setExampleField = useCallback(
    (
      index: number,
      key: 'title' | 'scene' | 'formula' | 'result' | 'explanation' | 'dataTsv',
      value: string,
    ): void => {
      mutate((current) => {
        const example = current.examples[index];
        if (example === undefined) {
          return;
        }
        example[key] = value;
      });
    },
    [mutate],
  );

  const setPitfallField = useCallback(
    (index: number, key: 'title' | 'reason' | 'fix', value: string): void => {
      mutate((current) => {
        const pitfall = current.pitfalls[index];
        if (pitfall === undefined) {
          return;
        }
        pitfall[key] = value;
      });
    },
    [mutate],
  );

  const setRelatedField = useCallback(
    (index: number, key: 'why', value: string): void => {
      mutate((current) => {
        const related = current.related[index];
        if (related === undefined) {
          return;
        }
        related[key] = value;
      });
    },
    [mutate],
  );

  const save = useCallback(async (): Promise<void> => {
    if (draft === null) {
      return;
    }
    setSaving(true);
    try {
      const outcome = await saveFunction(draft);
      showToast(outcome.message, outcome.ok ? 'success' : 'error');
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const cancel = useCallback((): void => {
    setDraft(entry === null ? null : clone(entry));
  }, [entry]);

  const restoreOfficial = useCallback(async (): Promise<void> => {
    if (draft === null) {
      return;
    }
    const outcome = resetFunction(draft.id);
    showToast(outcome.message, 'success');
    setDraft(clone(await loadOfficial(draft.id) ?? draft));
  }, [draft]);

  return {
    draft,
    dirty,
    saving,
    setOneLiner,
    setSummary,
    setReturnValue,
    setPatternCn,
    setPatternEn,
    setArgField,
    setExampleField,
    setPitfallField,
    setRelatedField,
    save,
    cancel,
    restoreOfficial,
  };
}

/** 直接取内置原文（恢复官方原文后用它刷新草稿） */
async function loadOfficial(id: string): Promise<FunctionEntry | null> {
  const { loadFunction } = await import('@/data/loadFunction');
  return loadFunction(id);
}

/** 供调用方复用的 toast 类型 */
export type EditToastKind = ToastKind;
