/**
 * B0 支撑模块：分位数 / 排名（纯函数、零 DOM）。
 * 实现 Excel PERCENTILE.INC / PERCENTILE.EXC 风格的线性插值，以及 RANK.AVG 风格平均排名。
 * 供后续统计函数批次复用。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/** 内部：values 已升序，按 PERCENTILE.INC 公式做最近秩线性插值。q ∈ [0,1]。 */
export function quantileSorted(values: number[], q: number): number {
  const n = values.length;
  if (n === 0) return NaN;
  if (n === 1) return values[0];
  if (q <= 0) return values[0];
  if (q >= 1) return values[n - 1];
  const pos = q * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return values[lo];
  const frac = pos - lo;
  return values[lo] + frac * (values[hi] - values[lo]);
}

/** Excel PERCENTILE.INC：最近秩线性插值；k ∈ [0,1]，越界返回 NaN。 */
export function percentileInc(values: number[], k: number): number {
  if (!(k >= 0 && k <= 1)) return NaN;
  const sorted = values.slice().sort((a, b) => a - b);
  return quantileSorted(sorted, k);
}

/** Excel PERCENTILE.EXC：独占法，位置 = k·(n+1)；k ∈ (0,1)。位置落在 [1,n] 之外返回 NaN。 */
export function percentileExc(values: number[], k: number): number {
  if (!(k > 0 && k < 1)) return NaN;
  const sorted = values.slice().sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return NaN;
  const pos = k * (n + 1);
  if (pos < 1 || pos > n) return NaN;
  if (Number.isInteger(pos)) return sorted[pos - 1];
  const lo = Math.floor(pos);
  const hi = lo + 1;
  const frac = pos - lo;
  return sorted[lo - 1] + frac * (sorted[hi - 1] - sorted[lo - 1]);
}

/** RANK.AVG 风格平均排名。order：0=降序（最大值排第1），1=升序（最小值排第1）；并列取平均排名。 */
export function rank(value: number, values: number[], order: 0 | 1): number {
  if (order === 0) {
    let greater = 0;
    let equal = 0;
    for (const v of values) {
      if (v > value) greater++;
      else if (v === value) equal++;
    }
    if (equal === 0) return NaN; // 值不存在于集合中
    return greater + (equal + 1) / 2;
  } else {
    let less = 0;
    let equal = 0;
    for (const v of values) {
      if (v < value) less++;
      else if (v === value) equal++;
    }
    if (equal === 0) return NaN;
    return less + (equal + 1) / 2;
  }
}
