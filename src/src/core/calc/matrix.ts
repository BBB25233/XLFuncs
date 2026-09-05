/**
 * B0 支撑模块：矩阵运算（纯函数、零 DOM）。
 * 行主序 number[][] 表示矩阵。供后续函数批次（如 MMULT / MINVERSE / LINEST 等）复用。
 *
 * ❌ 本文件禁止 import 任何 window / document / localStorage / React。
 */

/** 矩阵转置：交换行与列。 */
export function transpose(m: number[][]): number[][] {
  const rows = m.length;
  if (rows === 0) return [];
  const cols = m[0].length;
  const result: number[][] = [];
  for (let j = 0; j < cols; j++) {
    const row: number[] = [];
    for (let i = 0; i < rows; i++) {
      row.push(m[i][j]);
    }
    result.push(row);
  }
  return result;
}

/** 矩阵乘法 C = A·B；内维不一致（A 列数 ≠ B 行数）返回 null。 */
export function multiply(a: number[][], b: number[][]): number[][] | null {
  const aRows = a.length;
  if (aRows === 0) return [];
  const aCols = a[0].length;
  const bRows = b.length;
  if (bRows === 0) return [];
  const bCols = b[0].length;
  if (aCols !== bRows) return null;
  const result: number[][] = [];
  for (let i = 0; i < aRows; i++) {
    const row: number[] = [];
    for (let j = 0; j < bCols; j++) {
      let sum = 0;
      for (let k = 0; k < aCols; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

/** 方阵行列式；非方阵返回 NaN。带部分主元的高斯消元以提高数值稳定性。 */
export function determinant(m: number[][]): number {
  const n = m.length;
  if (n === 0) return 1;
  for (let i = 0; i < n; i++) {
    if (m[i].length !== n) return NaN; // 非方阵
  }
  const a = m.map((row) => row.slice());
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    let maxVal = Math.abs(a[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > maxVal) {
        maxVal = Math.abs(a[r][col]);
        pivot = r;
      }
    }
    if (maxVal === 0) return 0;
    if (pivot !== col) {
      const tmp = a[col];
      a[col] = a[pivot];
      a[pivot] = tmp;
      det = -det;
    }
    det *= a[col][col];
    for (let r = col + 1; r < n; r++) {
      const factor = a[r][col] / a[col][col];
      for (let c = col; c < n; c++) {
        a[r][c] -= factor * a[col][c];
      }
    }
  }
  return det;
}

/** 方阵求逆（Gauss-Jordan）；奇异或非方阵返回 null。 */
export function inverse(m: number[][]): number[][] | null {
  const n = m.length;
  if (n === 0) return null;
  for (let i = 0; i < n; i++) {
    if (m[i].length !== n) return null; // 非方阵
  }
  const a = m.map((row) => row.slice());
  const inv: number[][] = Array.from({ length: n }, (_, i) => {
    const row = new Array(n).fill(0);
    row[i] = 1;
    return row;
  });
  for (let col = 0; col < n; col++) {
    let pivot = col;
    let maxVal = Math.abs(a[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > maxVal) {
        maxVal = Math.abs(a[r][col]);
        pivot = r;
      }
    }
    if (maxVal === 0) return null; // 奇异
    if (pivot !== col) {
      const ta = a[col];
      a[col] = a[pivot];
      a[pivot] = ta;
      const ti = inv[col];
      inv[col] = inv[pivot];
      inv[pivot] = ti;
    }
    const pivVal = a[col][col];
    for (let c = 0; c < n; c++) {
      a[col][c] /= pivVal;
      inv[col][c] /= pivVal;
    }
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = a[r][col];
      for (let c = 0; c < n; c++) {
        a[r][c] -= factor * a[col][c];
        inv[r][c] -= factor * inv[col][c];
      }
    }
  }
  return inv;
}

/**
 * 解线性方程组 A·x = b。
 * - 方阵：Gauss-Jordan 精确求解；奇异返回 null。
 * - 矩形（m≠n）：用正规方程 (AᵀA)x = Aᵀb 的最小二乘解；AᵀA 奇异（秩亏）返回 null。
 * - 维度不一致返回 null。
 */
export function solve(A: number[][], b: number[]): number[] | null {
  const m = A.length;
  if (m === 0) return null;
  const n = A[0].length;
  for (let i = 0; i < m; i++) {
    if (A[i].length !== n) return null; // 行长度不一致
  }
  if (b.length !== m) return null;

  if (m === n) {
    const a = A.map((row) => row.slice());
    const x = b.slice();
    for (let col = 0; col < n; col++) {
      let pivot = col;
      let maxVal = Math.abs(a[col][col]);
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(a[r][col]) > maxVal) {
          maxVal = Math.abs(a[r][col]);
          pivot = r;
        }
      }
      if (maxVal === 0) return null; // 奇异
      if (pivot !== col) {
        const ta = a[col];
        a[col] = a[pivot];
        a[pivot] = ta;
        const tx = x[col];
        x[col] = x[pivot];
        x[pivot] = tx;
      }
      const pivVal = a[col][col];
      for (let c = col; c < n; c++) a[col][c] /= pivVal;
      x[col] /= pivVal;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = a[r][col];
        for (let c = col; c < n; c++) a[r][c] -= factor * a[col][c];
        x[r] -= factor * x[col];
      }
    }
    return x;
  }

  // 矩形 → 正规方程最小二乘
  const ATA: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < m; k++) s += A[k][i] * A[k][j];
      row[j] = s;
    }
    ATA.push(row);
  }
  const ATb: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < m; k++) s += A[k][i] * b[k];
    ATb[i] = s;
  }
  return solve(ATA, ATb); // 方阵路径；秩亏返回 null
}
