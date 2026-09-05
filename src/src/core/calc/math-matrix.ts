import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { sliceSheet } from '@/core/ref';
import { fail, ok } from './types';
import { formatNumber, toNumber } from './helpers';
import { determinant, inverse, multiply } from './matrix';

/**
 * 数学类矩阵函数在线试算实现（B10 批次）：
 *   mdeterm   · 行列式
 *   minverse  · 逆矩阵
 *   mmult     · 矩阵相乘
 *   sumx2my2  · Σ(x²−y²)
 *   sumx2py2  · Σ(x²+y²)
 *   sumxmy2   · Σ((x−y)²)
 *
 * 共享设施（与 math-a.ts / lookup.ts 一致）：
 * - ok / fail 来自 ./types
 * - ERROR_CODES / make 来自 @/core/errors
 * - formatNumber / toNumber 来自 ./helpers
 * - determinant / inverse / multiply 来自 ./matrix
 * - sliceSheet 来自 @/core/ref
 *
 * 区域读取统一走 sliceSheet；空白 / 文本单元格 → toNumber 返回 null → #VALUE!。
 * 矩阵结果（minverse / mmult）沿用 TRANSPOSE 的多行展示：行用 '\n' 连接、行内单元格用 ',' 连接。
 */

/** Sheet（已切片区域）→ number[][]；任意单元格非数字（含空白）→ 返回 null（代表 #VALUE!）。 */
function toNumberMatrix(sheet: Sheet): number[][] | null {
  const m: number[][] = [];
  for (const row of sheet.rows) {
    const r: number[] = [];
    for (const cell of row) {
      const n = toNumber(cell);
      if (n === null) {
        return null;
      }
      r.push(n);
    }
    m.push(r);
  }
  return m;
}

/** Sheet（已切片区域）→ 一维数字列表（行主序展平）；任意单元格非数字 → 返回 null。 */
function toNumberList(sheet: Sheet): number[] | null {
  const out: number[] = [];
  for (const row of sheet.rows) {
    for (const cell of row) {
      const n = toNumber(cell);
      if (n === null) {
        return null;
      }
      out.push(n);
    }
  }
  return out;
}

/** 读取一个矩阵型区域（mdeterm/minverse/mmult 用）。 */
function readMatrix(
  ctx: CalcContext,
  key: string,
): { matrix: number[][] | null; error: CalcOutcome | null } {
  const ref = (ctx.args[key] ?? '').trim();
  const sliced = sliceSheet(ctx.sheet, ref);
  if (sliced === null) {
    return {
      matrix: null,
      error: fail(
        make(
          ERROR_CODES.REF,
          `「${ref || '(空)'}」不是 Excel 认识的矩形区域引用，没法读取矩阵。`,
          '写成「左上角:右下角」的形式，如 A2:B3。',
        ),
      ),
    };
  }
  const m = toNumberMatrix(sliced);
  if (m === null) {
    return {
      matrix: null,
      error: fail(
        make(
          ERROR_CODES.VALUE,
          '矩阵区域里混进了空白或文本单元格，矩阵运算要求每个格子都是数字。',
          '把区域的每个单元格都填成数字；空值按业务含义填 0。',
        ),
      ),
    };
  }
  return { matrix: m, error: null };
}

/** 读取一个数组型区域（sumx* 用），展平为一维列表。 */
function readList(
  ctx: CalcContext,
  key: string,
): { list: number[] | null; error: CalcOutcome | null } {
  const ref = (ctx.args[key] ?? '').trim();
  const sliced = sliceSheet(ctx.sheet, ref);
  if (sliced === null) {
    return {
      list: null,
      error: fail(
        make(
          ERROR_CODES.REF,
          `「${ref || '(空)'}」不是 Excel 认识的矩形区域引用。`,
          '写成「左上角:右下角」的形式，如 A2:A5。',
        ),
      ),
    };
  }
  const list = toNumberList(sliced);
  if (list === null) {
    return {
      list: null,
      error: fail(
        make(
          ERROR_CODES.VALUE,
          '区域里混进了空白或文本单元格，数组运算要求每个格子都是数字。',
          '清理数据，把所有单元格都填成数字。',
        ),
      ),
    };
  }
  return { list, error: null };
}

/** number[][] → 多行展示串（行用 '\n'，行内用 ','）。 */
function matrixToDisplay(m: number[][]): string {
  return m.map((row) => row.map((v) => formatNumber(v)).join(',')).join('\n');
}

/* ===================== MDETERM · 行列式 ===================== */
export const mdetermCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { matrix, error } = readMatrix(ctx, 'array');
  if (error !== null) {
    return error;
  }
  const m = matrix as number[][];
  if (m.length === 0) {
    return fail(make(ERROR_CODES.VALUE, '矩阵区域是空的，没法算行列式。', '选一片非空的方阵区域。'));
  }
  const n = m.length;
  for (const row of m) {
    if (row.length !== n) {
      return fail(
        make(
          ERROR_CODES.VALUE,
          'MDETERM 只接受方阵（行数必须等于列数），现在选的区域不是方形。',
          '把区域裁成 n 行 n 列的方阵。',
        ),
      );
    }
  }
  const det = determinant(m);
  if (!Number.isFinite(det)) {
    return fail(make(ERROR_CODES.VALUE, '行列式算不出来（区域可能不是方阵）。', '确认区域是方阵。'));
  }
  return ok(det, formatNumber(det));
};

/* ===================== MINVERSE · 逆矩阵 ===================== */
export const minverseCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { matrix, error } = readMatrix(ctx, 'array');
  if (error !== null) {
    return error;
  }
  const m = matrix as number[][];
  if (m.length === 0) {
    return fail(make(ERROR_CODES.VALUE, '矩阵区域是空的，没法求逆。', '选一片非空的方阵区域。'));
  }
  const n = m.length;
  for (const row of m) {
    if (row.length !== n) {
      // 按本批次契约约定：minverse 非方阵 → #NUM!（与 mdeterm 的 #VALUE! 区分）
      return fail(
        make(
          ERROR_CODES.NUM,
          'MINVERSE 只接受方阵（行数必须等于列数），现在选的区域不是方形。',
          '把区域裁成 n 行 n 列的方阵。',
        ),
      );
    }
  }
  const inv = inverse(m);
  if (inv === null) {
    return fail(
      make(
        ERROR_CODES.NUM,
        '这个矩阵不可逆（行列式为 0，行或列线性相关），Excel 报 #NUM!。',
        '先用 MDETERM 判断行列式是否为 0，为 0 则无法求逆。',
      ),
    );
  }
  return ok(matrixToDisplay(inv) as CellValue);
};

/* ===================== MMULT · 矩阵相乘 ===================== */
export const mmultCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const a = readMatrix(ctx, 'array1');
  if (a.error !== null) {
    return a.error;
  }
  const b = readMatrix(ctx, 'array2');
  if (b.error !== null) {
    return b.error;
  }
  const product = multiply(a.matrix as number[][], b.matrix as number[][]);
  if (product === null) {
    return fail(
      make(
        ERROR_CODES.VALUE,
        '两个矩阵的维度不匹配：矩阵1的列数必须等于矩阵2的行数。',
        '用 TRANSPOSE 转置其中一个，或调整区域使「前列 = 后行」。',
      ),
    );
  }
  return ok(matrixToDisplay(product) as CellValue);
};

/* ===================== SUMX2MY2 · Σ(x²−y²) ===================== */
export const sumx2my2Calc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const xr = readList(ctx, 'array_x');
  if (xr.error !== null) {
    return xr.error;
  }
  const yr = readList(ctx, 'array_y');
  if (yr.error !== null) {
    return yr.error;
  }
  const x = xr.list as number[];
  const y = yr.list as number[];
  if (x.length !== y.length) {
    return fail(
      make(
        ERROR_CODES.NA,
        '两个区域的大小不一致（元素个数不同），Excel 报 #N/A。',
        '保证两个区域的行数（或列数）完全相同。',
      ),
    );
  }
  let total = 0;
  for (let i = 0; i < x.length; i += 1) {
    total += x[i] * x[i] - y[i] * y[i];
  }
  return ok(total, formatNumber(total));
};

/* ===================== SUMX2PY2 · Σ(x²+y²) ===================== */
export const sumx2py2Calc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const xr = readList(ctx, 'array_x');
  if (xr.error !== null) {
    return xr.error;
  }
  const yr = readList(ctx, 'array_y');
  if (yr.error !== null) {
    return yr.error;
  }
  const x = xr.list as number[];
  const y = yr.list as number[];
  if (x.length !== y.length) {
    return fail(
      make(
        ERROR_CODES.NA,
        '两个区域的大小不一致（元素个数不同），Excel 报 #N/A。',
        '保证两个区域的行数（或列数）完全相同。',
      ),
    );
  }
  let total = 0;
  for (let i = 0; i < x.length; i += 1) {
    total += x[i] * x[i] + y[i] * y[i];
  }
  return ok(total, formatNumber(total));
};

/* ===================== SUMXMY2 · Σ((x−y)²) ===================== */
export const sumxmy2Calc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const xr = readList(ctx, 'array_x');
  if (xr.error !== null) {
    return xr.error;
  }
  const yr = readList(ctx, 'array_y');
  if (yr.error !== null) {
    return yr.error;
  }
  const x = xr.list as number[];
  const y = yr.list as number[];
  if (x.length !== y.length) {
    return fail(
      make(
        ERROR_CODES.NA,
        '两个区域的大小不一致（元素个数不同），Excel 报 #N/A。',
        '保证两个区域的行数（或列数）完全相同。',
      ),
    );
  }
  let total = 0;
  for (let i = 0; i < x.length; i += 1) {
    const d = x[i] - y[i];
    total += d * d;
  }
  return ok(total, formatNumber(total));
};
