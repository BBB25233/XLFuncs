import type { DeepPartial } from '@/types';

/**
 * 增量 diff 与合并（ADR-A2 / ARCHITECTURE §3.8）。
 *
 * 三原则：
 * 1. 只存差异：deepDiff(内置, 编辑后) 逐字段比较，相同则 omit（返回 undefined）
 * 2. 数组整体替换：examples / pitfalls / args 只要有一项变了就存整个数组，
 *    不做数组内逐项 diff —— 半截数组的合并 bug 极难排查
 * 3. 删掉即恢复：resetFunction(id) = delete functions[id]，天然幂等
 */

/** 是不是「普通对象」（数组不算） */
function isPlainObject(value: unknown): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** 两个数组是否完全一样（逐项严格相等） */
function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 * 计算从 base 到 edited 的增量。
 * @returns 有差异时返回增量对象；完全没改返回 undefined
 */
export function deepDiff<T>(base: T, edited: T): DeepPartial<T> | undefined {
  if (base === edited) {
    return undefined;
  }

  // 数组整体替换
  if (Array.isArray(base) || Array.isArray(edited)) {
    if (Array.isArray(base) && Array.isArray(edited) && arraysEqual(base, edited)) {
      return undefined;
    }
    return edited as unknown as DeepPartial<T>;
  }

  if (isPlainObject(base) && isPlainObject(edited)) {
    const baseObj = base as unknown as Record<string, unknown>;
    const editedObj = edited as unknown as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    let changed = false;

    for (const [key, value] of Object.entries(editedObj)) {
      const delta = deepDiff(baseObj[key], value);
      if (delta !== undefined) {
        out[key] = delta;
        changed = true;
      }
    }
    return changed ? (out as unknown as DeepPartial<T>) : undefined;
  }

  // 基本类型（含 null）：值不同就整体替换
  return edited as unknown as DeepPartial<T>;
}

/**
 * 把增量合并回基础对象。
 * 数组整体覆盖，对象按 key 递归合并。
 */
export function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (patch === undefined || patch === null) {
    return base;
  }
  if (Array.isArray(patch)) {
    return patch as unknown as T;
  }
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch as unknown as T;
  }

  const baseObj = base as unknown as Record<string, unknown>;
  const patchObj = patch as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = { ...baseObj };

  for (const [key, value] of Object.entries(patchObj)) {
    out[key] = deepMerge(baseObj[key], value as DeepPartial<unknown>);
  }

  return out as unknown as T;
}

/** 判断一个对象是不是空的（{} 视为没有改动） */
export function isEmptyPatch(patch: unknown): boolean {
  if (patch === undefined || patch === null) {
    return true;
  }
  if (Array.isArray(patch)) {
    return patch.length === 0;
  }
  if (isPlainObject(patch)) {
    return Object.keys(patch as Record<string, unknown>).length === 0;
  }
  return false;
}
