import type { CalcContext, CalcHandler, CalcOutcome, CellValue, Sheet } from '@/types';
import { ERROR_CODES, make } from '@/core/errors';
import { fail, ok, stripQuotes } from './types';
import { sliceSheet } from '@/core/ref';
import {
  formatNumber,
  numericValues,
  countNonBlank,
  avgValues,
  maxValues,
  minValues,
} from './helpers';
import { parseCriterion } from './criteria';

/**
 * 数据库类（补充批次 B9，11 个函数）：
 *   daverage / dcount / dcounta / dget / dmax / dmin / dproduct /
 *   dstdev / dstdevp / dvar / dvarp
 *
 * 这些函数都取 数据库区域 + 条件区域 + 字段，先按条件筛选行，再对字段列聚合。
 * 复用 DSUM 的「切片 + 按条件表筛选」思路；条件单元格统一走 parseCriterion()
 * （文本条件需带引号，如 "水果"；比较条件如 ">9" 也带引号），与 criteria.ts 一致。
 *
 * 条件区：同一行多条件 = 逻辑「与」(AND)；分多行 = 逻辑「或」(OR)。
 * 错误：field 不存在 → #VALUE!；条件区域为空 → #VALUE!；区域非法 → #REF!；
 * DGET 无匹配 → #VALUE!，多匹配 → #NUM!。
 */

interface Prepared {
  error: CalcOutcome | null;
  header: string[];
  rows: CellValue[][];
  targetCol: number;
  matched: CellValue[][];
}

/** 读取数据库 + 条件区域，筛选匹配行，解析目标字段列 */
function prepare(ctx: CalcContext): Prepared {
  const { sheet, args } = ctx;
  const dbRef = (args.database ?? '').trim();
  const fieldRaw = args.field ?? '';
  const critRef = (args.criteria ?? '').trim();

  if (dbRef === '') {
    return {
      error: fail(
        make(ERROR_CODES.REF, '数据库区域为空', '请填写数据库区域，如 A1:D5（含表头）。'),
      ),
      header: [],
      rows: [],
      targetCol: -1,
      matched: [],
    };
  }
  const dbBlock = sliceSheet(sheet, dbRef);
  if (dbBlock === null) {
    return {
      error: fail(
        make(ERROR_CODES.REF, `数据库区域「${dbRef}」无效`, '区域要写成「左上角:右下角」，如 A1:D5。'),
      ),
      header: [],
      rows: [],
      targetCol: -1,
      matched: [],
    };
  }
  const dbHeader = dbBlock.header;
  const dbRows = dbBlock.rows;

  // ---------- 解析 field ----------
  const fieldName = stripQuotes(fieldRaw).inner.trim();
  let targetCol = -1;
  if (/^\d+$/.test(fieldName)) {
    const idx = Number.parseInt(fieldName, 10) - 1; // 1 基
    if (idx >= 0 && idx < dbHeader.length) {
      targetCol = idx;
    }
  } else {
    targetCol = dbHeader.indexOf(fieldName);
  }
  if (targetCol < 0) {
    return {
      error: fail(
        make(
          ERROR_CODES.VALUE,
          `找不到字段列「${fieldName}」`,
          'field 用列名文本（与表头一字不差）或列序号（从 1 开始）。',
        ),
      ),
      header: dbHeader,
      rows: dbRows,
      targetCol: -1,
      matched: [],
    };
  }

  // ---------- 解析 criteria ----------
  if (critRef === '') {
    return {
      error: fail(
        make(ERROR_CODES.VALUE, '条件区域为空', '请填写条件区域，如 A6:A7（首行条件列名、其下条件值）。'),
      ),
      header: dbHeader,
      rows: dbRows,
      targetCol,
      matched: [],
    };
  }
  const critBlock = sliceSheet(sheet, critRef);
  if (critBlock === null) {
    return {
      error: fail(
        make(ERROR_CODES.REF, `条件区域「${critRef}」无效`, '区域要写成「左上角:右下角」，如 A6:A7。'),
      ),
      header: dbHeader,
      rows: dbRows,
      targetCol,
      matched: [],
    };
  }
  const critRows = critBlock.rows;

  // 仅有表头（无条件行）→ 汇总全部数据行
  if (critRows.length <= 1) {
    return { error: null, header: dbHeader, rows: dbRows, targetCol, matched: dbRows };
  }
  const critHeader = critRows[0];

  // 校验条件列名是否都在数据库表头里
  for (let j = 0; j < critHeader.length; j += 1) {
    const fname = critHeader[j];
    if (fname === null || String(fname).trim() === '') {
      continue;
    }
    if (dbHeader.indexOf(String(fname).trim()) < 0) {
      return {
        error: fail(
          make(
            ERROR_CODES.VALUE,
            `条件列名「${String(fname).trim()}」在数据库里找不到`,
            '条件表表头必须从数据库表头复制，做到一字不差（含空格、大小写）。',
          ),
        ),
        header: dbHeader,
        rows: dbRows,
        targetCol,
        matched: [],
      };
    }
  }

  // 逐行判断：任一条件行（AND 组合）成立即命中；行与行 = OR
  const matched: CellValue[][] = [];
  for (const dbRow of dbRows) {
    let matchedAny = false;
    for (let r = 1; r < critRows.length; r += 1) {
      const condRow = critRows[r];
      let allTrue = true;
      let hasCond = false;
      for (let j = 0; j < critHeader.length; j += 1) {
        const fname = critHeader[j];
        if (fname === null || String(fname).trim() === '') {
          continue;
        }
        const cval = condRow[j];
        if (cval === null || String(cval).trim() === '') {
          continue; // 该格留空 = 不约束此列
        }
        const dbCol = dbHeader.indexOf(String(fname).trim());
        const criterion = parseCriterion(String(cval), sheet);
        if (criterion.failure !== null) {
          return { error: fail(criterion.failure), header: dbHeader, rows: dbRows, targetCol, matched: [] };
        }
        hasCond = true;
        if (!criterion.test(dbRow[dbCol])) {
          allTrue = false;
          break;
        }
      }
      if (allTrue && hasCond) {
        matchedAny = true;
        break;
      }
    }
    if (matchedAny) {
      matched.push(dbRow);
    }
  }

  return { error: null, header: dbHeader, rows: dbRows, targetCol, matched };
}

/** 取匹配行中目标字段列的值 */
function fieldValues(p: Prepared): CellValue[] {
  return p.matched.map((row) => row[p.targetCol]);
}

/** 样本/总体 标准差 */
function stdev(nums: number[], population: boolean): number {
  const n = nums.length;
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const ss = nums.reduce((a, b) => a + (b - mean) * (b - mean), 0);
  return Math.sqrt(ss / (population ? n : n - 1));
}

/** 样本/总体 方差 */
function variance(nums: number[], population: boolean): number {
  const n = nums.length;
  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const ss = nums.reduce((a, b) => a + (b - mean) * (b - mean), 0);
  return ss / (population ? n : n - 1);
}

/* ===================== DAVERAGE · 条件均值 ===================== */
export const daverageCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const nums = numericValues(fieldValues(p));
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.DIV0, '没有符合条件的数字可求平均', '检查字段列是否为数字，或放宽条件。'),
    );
  }
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return ok(avg, formatNumber(avg));
};

/* ===================== DCOUNT · 条件计数（仅数字） ===================== */
export const dcountCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const count = numericValues(fieldValues(p)).length;
  return ok(count, formatNumber(count));
};

/* ===================== DCOUNTA · 条件计数（非空） ===================== */
export const dcountaCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const count = countNonBlank(fieldValues(p));
  return ok(count, formatNumber(count));
};

/* ===================== DGET · 取唯一匹配值 ===================== */
export const dgetCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  if (p.matched.length === 0) {
    return fail(
      make(ERROR_CODES.VALUE, '没有符合条件的记录', 'DGET 要求恰好一条匹配；放宽/收窄条件后再试。'),
    );
  }
  if (p.matched.length > 1) {
    return fail(
      make(ERROR_CODES.NUM, '符合条件的记录多于一条', 'DGET 要求唯一匹配；改为 DMAX/DSUM 等聚合函数，或加条件收窄到一行。'),
    );
  }
  const v = p.matched[0][p.targetCol];
  const display = v === null || v === '' ? '' : typeof v === 'number' ? formatNumber(v) : String(v);
  return ok(v, display);
};

/* ===================== DMAX · 条件最大值 ===================== */
export const dmaxCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const m = maxValues(fieldValues(p));
  if (m === null) {
    return fail(
      make(ERROR_CODES.DIV0, '没有符合条件的数字可求最大', '检查字段列是否为数字，或放宽条件。'),
    );
  }
  return ok(m, formatNumber(m));
};

/* ===================== DMIN · 条件最小值 ===================== */
export const dminCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const m = minValues(fieldValues(p));
  if (m === null) {
    return fail(
      make(ERROR_CODES.DIV0, '没有符合条件的数字可求最小', '检查字段列是否为数字，或放宽条件。'),
    );
  }
  return ok(m, formatNumber(m));
};

/* ===================== DPRODUCT · 条件乘积 ===================== */
export const dproductCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const nums = numericValues(fieldValues(p));
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.DIV0, '没有符合条件的数字可连乘', '检查字段列是否为数字，或放宽条件。'),
    );
  }
  const prod = nums.reduce((a, b) => a * b, 1);
  return ok(prod, formatNumber(prod));
};

/* ===================== DSTDEV · 样本标准差 ===================== */
export const dstdevCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const nums = numericValues(fieldValues(p));
  if (nums.length < 2) {
    return fail(
      make(ERROR_CODES.DIV0, '样本标准差至少需要 2 个数值', '增加匹配的数据行，或改用 DSTDEVP。'),
    );
  }
  const s = stdev(nums, false);
  return ok(s, formatNumber(s));
};

/* ===================== DSTDEVP · 总体标准差 ===================== */
export const dstdevpCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const nums = numericValues(fieldValues(p));
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.DIV0, '没有符合条件的数字可求总体标准差', '检查字段列是否为数字，或放宽条件。'),
    );
  }
  const s = stdev(nums, true);
  return ok(s, formatNumber(s));
};

/* ===================== DVAR · 样本方差 ===================== */
export const dvarCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const nums = numericValues(fieldValues(p));
  if (nums.length < 2) {
    return fail(
      make(ERROR_CODES.DIV0, '样本方差至少需要 2 个数值', '增加匹配的数据行，或改用 DVARP。'),
    );
  }
  const v = variance(nums, false);
  return ok(v, formatNumber(v));
};

/* ===================== DVARP · 总体方差 ===================== */
export const dvarpCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const p = prepare(ctx);
  if (p.error) return p.error;
  const nums = numericValues(fieldValues(p));
  if (nums.length === 0) {
    return fail(
      make(ERROR_CODES.DIV0, '没有符合条件的数字可求总体方差', '检查字段列是否为数字，或放宽条件。'),
    );
  }
  const v = variance(nums, true);
  return ok(v, formatNumber(v));
};
