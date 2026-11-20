/** 函数名拼写建议：编辑距离 + 候选集，不依赖任何数据层。 */

/** 标准 Levenshtein 距离，两行滚动数组 */
export function levenshtein(left: string, right: string): number {
  const a = left;
  const b = right;

  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  let previous: number[] = Array.from({ length: b.length + 1 }, (_, index) => index);
  let current: number[] = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1, // 删除
        current[j - 1] + 1, // 插入
        previous[j - 1] + cost, // 替换
      );
    }
    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[b.length];
}

export interface SuggestOptions {
  /** 超过该距离不再建议，默认 2 */
  maxDistance?: number;
}

/**
 * 在候选函数名中找最接近的一个。
 * - 输入统一转大写比较；名字太短（<3）不建议，避免噪声。
 * - 距离相同时优先推荐更短的名字，再按字典序，保证结果稳定。
 */
export function suggestFunctionName(
  input: string,
  candidates: readonly string[],
  options: SuggestOptions = {},
): string | null {
  const target = input.trim().toUpperCase();
  if (target.length < 3) {
    return null;
  }

  // 已经是合法函数名，不必再建议
  if (candidates.some((candidate) => candidate.toUpperCase() === target)) {
    return null;
  }

  // 短名字的编辑距离天生偏小（EXP 与 ERF 只差 2），阈值随长度收紧，避免误判成拼写错误。
  const maxDistance = options.maxDistance ?? (target.length <= 4 ? 1 : 2);
  let best: { name: string; distance: number } | null = null;

  for (const candidate of candidates) {
    const name = candidate.toUpperCase();
    if (name === target) {
      continue;
    }
    const distance = levenshtein(target, name);
    if (distance > maxDistance) {
      continue;
    }
    if (
      best === null ||
      distance < best.distance ||
      (distance === best.distance && name.length < best.name.length) ||
      (distance === best.distance && name.length === best.name.length && name < best.name)
    ) {
      best = { name, distance };
    }
  }

  return best === null ? null : best.name;
}
