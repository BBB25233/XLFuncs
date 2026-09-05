import type { CalcContext, CalcHandler, CalcOutcome, CellValue } from '@/types';
import { ERROR_CODES } from '@/core/errors';
import { cellValue, columnOf, indexToCol, parseCell, sliceSheet } from '@/core/ref';
import { formatNumber, toNumber } from './helpers';
import { fail, ok, stripQuotes } from './types';

/**
 * 查找与引用类 7 个函数的试算实现（纯函数，零 DOM）。
 * 数据来自 src/data/packs/lookup.ts 里各条目 examples[0] 的 dataTsv / tableId。
 *
 * 简化说明：
 * - OFFSET 只返回偏移后的「单个单元格」（忽略 height/width 区域返回）。
 * - MATCH 仅支持精确匹配（match_type 0）；1/-1 也按精确处理（简化）。
 * - UNIQUE 简化为「去重后拼接成展示串」，忽略 by_col（数据均为单列）、
 *   exactly_once 仅保留恰好出现一次的值。
 * - ROW/COLUMN 对超出样表范围的引用返回 #REF!（Excel 本身不报错，但这里按边界校验）。
 */

/** 判断一个裸字符串是不是「列字母+行号」形式的单元格引用 */
function isCellRef(raw: string): boolean {
  return /^[A-Za-z]+\d+$/.test(raw.trim());
}

/* ============================ INDEX ============================ */

export const indexCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const arrayRef = (args.array ?? '').trim();
  const block = sliceSheet(sheet, arrayRef);
  if (block === null) {
    return fail({ error: ERROR_CODES.REF, reason: '区域写法不是 Excel 认识的区域引用。', fix: '写成「左上角:右下角」，如 A2:B5。' });
  }
  const rowRaw = (args.row_num ?? '').trim();
  const colRaw = (args.column_num ?? '').trim();
  const rowNum = toNumber(rowRaw);
  const colNum = colRaw === '' ? 1 : toNumber(colRaw);
  if (rowNum === null || colNum === null) {
    return fail({ error: ERROR_CODES.VALUE, reason: '行号或列号不是数字。', fix: '行号、列号填正整数。' });
  }
  const rowIdx = rowNum - 1;
  const colIdx = colNum - 1;
  const row = block.rows[rowIdx];
  if (row === undefined) {
    return fail({ error: ERROR_CODES.REF, reason: '行号超出了区域的实际行数。', fix: '行号最大只能到区域的总行数。' });
  }
  const value = row[colIdx];
  if (value === undefined) {
    return fail({ error: ERROR_CODES.REF, reason: '列号超出了区域的实际列数。', fix: '列号最大只能到区域的总列数。' });
  }
  return ok(value as CellValue);
};

/* ============================ MATCH ============================ */

export const matchCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.lookup_value ?? '';
  const sq = stripQuotes(raw);
  let target: string;
  if (sq.quoted) {
    target = sq.inner;
  } else if (isCellRef(raw)) {
    target = String(cellValue(sheet, raw.trim()) ?? '');
  } else {
    target = sq.inner;
  }

  const arrayRef = (args.lookup_array ?? '').trim();
  const block = sliceSheet(sheet, arrayRef);
  if (block === null) {
    return fail({ error: ERROR_CODES.NA, reason: '查找区域不是合法的单元格引用。', fix: '只框一列，如 $A$2:$A$9。' });
  }
  if (block.header.length > 1) {
    return fail({ error: ERROR_CODES.NA, reason: 'MATCH 只接受单行或单列，不能框整块多列区域。', fix: '把范围改成单列，如 $A$2:$A$9。' });
  }

  const col = columnOf(block, 0);
  const position = col.findIndex((v) => (v === null ? '' : String(v)) === target);
  if (position < 0) {
    return fail({ error: ERROR_CODES.NA, reason: '要找的值在查找范围里不存在（可能是空格或格式不一致）。', fix: '核对有没有打错字、两边格式是否一致。' });
  }
  return ok(position + 1, formatNumber(position + 1));
};

/* ============================ INDIRECT ============================ */

export const indirectCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.ref_text ?? '';
  const sq = stripQuotes(raw);
  let address: string;
  if (sq.quoted) {
    address = sq.inner;
  } else if (isCellRef(raw)) {
    // 单元格里存的是「地址文字」，取出它的内容当作地址
    address = String(cellValue(sheet, raw.trim()) ?? '');
  } else {
    address = raw.trim();
  }

  const res = cellValue(sheet, address);
  if (res === null) {
    return fail({ error: ERROR_CODES.REF, reason: '那段地址文字指向的单元格不存在或无效。', fix: '地址必须是合法引用，如 "B2" 或指向合法地址的单元格。' });
  }
  return ok(res);
};

/* ============================ OFFSET ============================ */

export const offsetCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const base = parseCell((args.reference ?? '').trim());
  if (base === null) {
    return fail({ error: ERROR_CODES.REF, reason: '基准格不是合法的单元格引用。', fix: '写成一个单元格，如 A2。' });
  }
  const rows = toNumber(args.rows);
  const cols = toNumber(args.cols);
  if (rows === null || cols === null) {
    return fail({ error: ERROR_CODES.VALUE, reason: '下移/右移的偏移量不是数字。', fix: '偏移量填整数，如 2、0。' });
  }

  const anchorPos = parseCell(sheet.anchor);
  if (anchorPos === null) {
    return fail({ error: ERROR_CODES.REF, reason: '样表坐标异常。', fix: '请联系管理员。' });
  }
  const maxRow = anchorPos.row + sheet.rows.length - 1;
  const maxCol = anchorPos.col + sheet.header.length - 1;

  const newRow = base.row + rows;
  const newCol = base.col + cols;
  if (newRow < anchorPos.row || newRow > maxRow || newCol < anchorPos.col || newCol > maxCol) {
    return fail({ error: ERROR_CODES.REF, reason: '偏移后跑出了数据区域之外。', fix: '减小偏移量，确保移动后仍在数据范围内。' });
  }

  const res = cellValue(sheet, `${indexToCol(newCol)}${newRow + 1}`);
  return ok(res ?? null);
};

/* ============================ ROW ============================ */

export const rowCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const pos = parseCell((args.reference ?? '').trim());
  if (pos === null) {
    return fail({ error: ERROR_CODES.REF, reason: '引用的单元格不是合法的区域（区域须是单个单元格）。', fix: '填单个单元格，如 A5。' });
  }
  const anchorPos = parseCell(sheet.anchor);
  if (anchorPos === null) {
    return fail({ error: ERROR_CODES.REF, reason: '样表坐标异常。', fix: '请联系管理员。' });
  }
  const maxRow = anchorPos.row + sheet.rows.length - 1;
  const maxCol = anchorPos.col + sheet.header.length - 1;
  if (pos.row < anchorPos.row || pos.row > maxRow || pos.col < anchorPos.col || pos.col > maxCol) {
    return fail({ error: ERROR_CODES.REF, reason: '引用的单元格不在示例数据范围内。', fix: '引用示例数据范围内的单元格。' });
  }
  return ok(pos.row + 1, formatNumber(pos.row + 1));
};

/* ============================ COLUMN ============================ */

export const columnCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const pos = parseCell((args.reference ?? '').trim());
  if (pos === null) {
    return fail({ error: ERROR_CODES.REF, reason: '引用的单元格不是合法的区域（区域须是单个单元格）。', fix: '填单个单元格，如 C5。' });
  }
  const anchorPos = parseCell(sheet.anchor);
  if (anchorPos === null) {
    return fail({ error: ERROR_CODES.REF, reason: '样表坐标异常。', fix: '请联系管理员。' });
  }
  const maxCol = anchorPos.col + sheet.header.length - 1;
  // 列号独立于数据行，只校验列范围
  if (pos.col < anchorPos.col || pos.col > maxCol) {
    return fail({ error: ERROR_CODES.REF, reason: '引用的列不在示例数据范围内。', fix: '引用示例数据范围内的列。' });
  }
  return ok(pos.col + 1, formatNumber(pos.col + 1));
};

/* ============================ UNIQUE ============================ */

export const uniqueCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const arrayRef = (args.array ?? '').trim();
  const block = sliceSheet(sheet, arrayRef);
  if (block === null) {
    return fail({ error: ERROR_CODES.REF, reason: '区域写法不是 Excel 认识的区域引用。', fix: '写成「左上角:右下角」，如 A2:A7。' });
  }

  const values = columnOf(block, 0);
  // 统计出现次数，保留首次出现顺序
  const seen = new Map<string, number>();
  const ordered: string[] = [];
  for (const v of values) {
    const key = v === null ? '' : String(v);
    const count = seen.get(key) ?? 0;
    if (count === 0) {
      ordered.push(key);
    }
    seen.set(key, count + 1);
  }

  const exactlyOnceRaw = (args.exactly_once ?? 'FALSE').trim().toUpperCase();
  const exactlyOnce = exactlyOnceRaw === 'TRUE' || exactlyOnceRaw === '1';
  const result = exactlyOnce ? ordered.filter((k) => seen.get(k) === 1) : ordered;

  return ok(result.join(', '));
};

/* ============================================================================
 * 以下 7 个函数为查找与引用类的试算实现（第一版 v1.0）。
 *
 * 简化说明：
 * - HLOOKUP 仅支持精确匹配（range_lookup 忽略或 FALSE）；首行即 block.header。
 * - LOOKUP 仅向量形式、精确匹配；result_vector 省略时返回查找向量同位置的值。
 * - CHOOSE 最多 5 个候选值，序号超出候选数或非法 → #VALUE!。
 * - ADDRESS 仅处理正整数行/列号；abs_num 取 1~4；a1=FALSE 走 R1C1 样式。
 * - COLUMNS / ROWS 直接返回切片后 block.header.length / block.rows.length。
 * - TRANSPOSE 自实现转置（不依赖 matrix.ts），输出以 \n 分行、, 分列。
 * ========================================================================== */

/** 取查找表某一行（1 基）的值数组：第 1 行是表头，其余是数据行 */
function blockRowAt(block: { header: CellValue[]; rows: CellValue[][] }, idx: number): CellValue[] | undefined {
  if (idx <= 0) {
    return undefined;
  }
  if (idx === 1) {
    return block.header;
  }
  return block.rows[idx - 2];
}

/* ============================ HLOOKUP ============================ */

export const hlookupCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.lookup_value ?? '';
  const sq = stripQuotes(raw);
  let target: string;
  if (sq.quoted) {
    target = sq.inner;
  } else if (isCellRef(raw)) {
    target = String(cellValue(sheet, raw.trim()) ?? '');
  } else {
    target = sq.inner;
  }

  const block = sliceSheet(sheet, (args.table_array ?? '').trim());
  if (block === null) {
    return fail({ error: ERROR_CODES.REF, reason: '区域写法不是 Excel 认识的区域引用。', fix: '写成「左上角:右下角」，如 A1:B3。' });
  }

  const col = block.header.findIndex((v) => String(v ?? '') === target);
  if (col < 0) {
    return fail({ error: ERROR_CODES.NA, reason: '要找的值在第一行里不存在（可能是空格或格式不一致）。', fix: '核对首行有没有打错字、两边格式是否一致。' });
  }

  const rowNum = toNumber(args.row_index_num ?? '');
  if (rowNum === null || !Number.isInteger(rowNum) || rowNum < 1) {
    return fail({ error: ERROR_CODES.REF, reason: '返回行号必须是不小于 1 的整数。', fix: '行号从 1 开始，填正整数。' });
  }
  const rowArr = blockRowAt(block, rowNum);
  if (rowArr === undefined) {
    return fail({ error: ERROR_CODES.REF, reason: '返回行号超出了区域的实际行数。', fix: '行号最大只能到区域的总行数。' });
  }
  return ok((rowArr[col] ?? null) as CellValue);
};

/* ============================ LOOKUP ============================ */

export const lookupCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const raw = args.lookup_value ?? '';
  const sq = stripQuotes(raw);
  let target: string;
  if (sq.quoted) {
    target = sq.inner;
  } else if (isCellRef(raw)) {
    target = String(cellValue(sheet, raw.trim()) ?? '');
  } else {
    target = sq.inner;
  }

  const vectorBlock = sliceSheet(sheet, (args.lookup_vector ?? '').trim());
  if (vectorBlock === null || vectorBlock.header.length === 0) {
    return fail({ error: ERROR_CODES.REF, reason: '查找区域不是合法的单元格引用。', fix: '写成单列区域，如 A2:A4。' });
  }
  const vector = columnOf(vectorBlock, 0);
  const idx = vector.findIndex((v) => String(v ?? '') === target);
  if (idx < 0) {
    return fail({ error: ERROR_CODES.NA, reason: '要找的值在查找向量里不存在（可能是格式不一致）。', fix: '核对有没有打错字、两边格式是否一致。' });
  }

  const resultRef = (args.result_vector ?? '').trim();
  if (resultRef === '') {
    return ok((vector[idx] ?? null) as CellValue);
  }
  const resultBlock = sliceSheet(sheet, resultRef);
  if (resultBlock === null) {
    return fail({ error: ERROR_CODES.REF, reason: '返回区域不是合法的单元格引用。', fix: '写成单列区域，如 B2:B4。' });
  }
  const resultCol = columnOf(resultBlock, 0);
  const rv = resultCol[idx];
  if (rv === undefined) {
    return fail({ error: ERROR_CODES.NA, reason: '返回区域的行数比查找向量短，取不到对应位置。', fix: '让返回向量与查找向量行数一致。' });
  }
  return ok((rv ?? null) as CellValue);
};

/* ============================ CHOOSE ============================ */

export const chooseCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const idx = toNumber(args.index_num ?? '');
  if (idx === null || !Number.isInteger(idx) || idx < 1) {
    return fail({ error: ERROR_CODES.VALUE, reason: '序号必须是 1 到候选值个数之间的整数。', fix: '序号从 1 开始填正整数。' });
  }
  const keys = ['value1', 'value2', 'value3', 'value4', 'value5'];
  const values = keys.map((k) => (args[k] ?? '').trim());
  const provided = values.filter((v) => v !== '').length;
  if (idx > provided) {
    return fail({ error: ERROR_CODES.VALUE, reason: '序号超出了候选值的数量。', fix: '序号最大只能到候选项的个数（1~' + provided + '）。' });
  }
  const picked = stripQuotes(values[idx - 1]).inner;
  return ok(picked as CellValue);
};

/* ============================ ADDRESS ============================ */

export const addressCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { args } = ctx;
  const row = toNumber(args.row_num ?? '');
  const col = toNumber(args.column_num ?? '');
  if (row === null || col === null || !Number.isInteger(row) || !Number.isInteger(col) || row < 1 || col < 1) {
    return fail({ error: ERROR_CODES.VALUE, reason: '行号和列号必须是正整数（A 列是 1）。', fix: '行号、列号都填正整数。' });
  }
  const abs = toNumber((args.abs_num ?? '1').trim());
  if (abs === null || !Number.isInteger(abs) || abs < 1 || abs > 4) {
    return fail({ error: ERROR_CODES.VALUE, reason: '引用类型必须是 1~4 的整数。', fix: '1=绝对、2=行绝对列相对、3=行相对列绝对、4=相对。' });
  }
  const a1Raw = (args.a1 ?? 'TRUE').trim().toUpperCase();
  const a1 = a1Raw !== 'FALSE' && a1Raw !== '0';
  if (!a1) {
    return ok(`R${row}C${col}` as CellValue);
  }
  const colLetter = indexToCol(col - 1);
  const colPrefix = abs === 1 || abs === 3 ? '$' : '';
  const rowPrefix = abs === 1 || abs === 2 ? '$' : '';
  return ok(`${colPrefix}${colLetter}${rowPrefix}${row}` as CellValue);
};

/* ============================ COLUMNS ============================ */

export const columnsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const block = sliceSheet(sheet, (args.array ?? '').trim());
  if (block === null) {
    return fail({ error: ERROR_CODES.REF, reason: '区域写法不是 Excel 认识的区域引用。', fix: '写成「左上角:右下角」，如 A1:C3。' });
  }
  return ok(block.header.length as CellValue);
};

/* ============================ ROWS ============================ */

export const rowsCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const block = sliceSheet(sheet, (args.array ?? '').trim());
  if (block === null) {
    return fail({ error: ERROR_CODES.REF, reason: '区域写法不是 Excel 认识的区域引用。', fix: '写成「左上角:右下角」，如 A2:C4。' });
  }
  return ok(block.rows.length as CellValue);
};

/* ============================ TRANSPOSE ============================ */

export const transposeCalc: CalcHandler = (ctx: CalcContext): CalcOutcome => {
  const { sheet, args } = ctx;
  const block = sliceSheet(sheet, (args.array ?? '').trim());
  if (block === null) {
    return fail({ error: ERROR_CODES.REF, reason: '区域写法不是 Excel 认识的区域引用。', fix: '写成「左上角:右下角」，如 A2:C3。' });
  }
  const colCount = block.header.length;
  const rowCount = block.rows.length;
  if (colCount === 0 || rowCount === 0) {
    return ok('' as CellValue);
  }
  const out: string[] = [];
  for (let c = 0; c < colCount; c += 1) {
    const newRow: string[] = [];
    for (let r = 0; r < rowCount; r += 1) {
      const v = block.rows[r]?.[c];
      newRow.push(v === null || v === undefined ? '' : String(v));
    }
    out.push(newRow.join(','));
  }
  return ok(out.join('\n') as CellValue);
};
