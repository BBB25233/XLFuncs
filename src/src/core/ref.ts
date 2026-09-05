import type { CalcSpec, CellValue, FunctionEntry, SampleTableId, Sheet } from '@/types';
import { parseTsv } from './tsv';

/**
 * A1 引用解析与样表切片（纯函数，零 DOM）。
 *
 * 坐标约定：
 * - 行列都用 **0 基** 表示。'A1' → { col: 0, row: 0 }
 * - 一张样表的表头占第 1 行，数据从第 2 行开始（anchor = 'A1'）
 * - 一个 Sheet 的 anchor 指向**数据区左上角**（如 'A2'），不含表头
 */

/** 解析出来的区域（0 基，闭区间） */
export interface RefRange {
  c1: number;
  r1: number;
  c2: number;
  r2: number;
}

/** 单元格坐标（0 基） */
export interface CellPos {
  col: number;
  row: number;
}

/**
 * 样表的结构化形态。data 层的 SampleTable 天然兼容，
 * 这里单独定义是为了让 core 层不必依赖 data 层。
 */
export interface TableLike {
  columns: string[];
  rows: CellValue[][];
  /** 表头左上角所在单元格，如 'A1' */
  anchor: string;
}

/** 按样表 id 取表的解析函数（由调用方注入，保持 core 层纯净） */
export type TableResolver = (id: SampleTableId) => TableLike | null;

/** 列标 → 0 基列号：A → 0，Z → 25，AA → 26 */
export function colToIndex(col: string): number {
  const upper = col.toUpperCase();
  let result = 0;
  for (let i = 0; i < upper.length; i += 1) {
    const code = upper.charCodeAt(i);
    if (code < 65 || code > 90) {
      return -1;
    }
    result = result * 26 + (code - 64);
  }
  return result - 1;
}

/** 0 基列号 → 列标：0 → A，25 → Z，26 → AA */
export function indexToCol(index: number): string {
  let n = index;
  let out = '';
  while (n >= 0) {
    out = String.fromCharCode((n % 26) + 65) + out;
    n = Math.floor(n / 26) - 1;
  }
  return out;
}

/** 解析单元格引用，如 'B2' → { col: 1, row: 1 }；非法返回 null */
export function parseCell(cell: string): CellPos | null {
  const matched = /^([A-Za-z]+)(\d+)$/.exec(cell.trim());
  if (matched === null) {
    return null;
  }
  const col = colToIndex(matched[1]);
  if (col < 0) {
    return null;
  }
  const row = Number.parseInt(matched[2], 10) - 1;
  if (!Number.isFinite(row) || row < 0) {
    return null;
  }
  return { col, row };
}

/**
 * 解析区域引用，如 'A2:C9' → { c1:0, r1:1, c2:2, r2:8 }。
 * 支持单格写法（'F2' → c1=c2, r1=r2）与反着框（'C9:A2' 会自动规范化）。
 */
export function parseRef(ref: string): RefRange | null {
  const trimmed = ref.trim().replace(/\$/g, '');
  if (trimmed === '') {
    return null;
  }
  const parts = trimmed.split(':');
  if (parts.length === 1) {
    const pos = parseCell(parts[0]);
    return pos === null ? null : { c1: pos.col, r1: pos.row, c2: pos.col, r2: pos.row };
  }
  if (parts.length !== 2) {
    return null;
  }
  const a = parseCell(parts[0]);
  const b = parseCell(parts[1]);
  if (a === null || b === null) {
    return null;
  }
  return {
    c1: Math.min(a.col, b.col),
    r1: Math.min(a.row, b.row),
    c2: Math.max(a.col, b.col),
    r2: Math.max(a.row, b.row),
  };
}

/** 把区域引用格式化成字符串（便于生成「数据从 A2 开始」这类说明） */
export function formatRef(range: RefRange): string {
  return `${indexToCol(range.c1)}${range.r1 + 1}:${indexToCol(range.c2)}${range.r2 + 1}`;
}

/** 取一片矩形区域内的单元格值；越界补 null，保证行数严格等于区域高度 */
function pickBlock(
  source: { rowCount: number; colCount: number; at: (row: number, col: number) => CellValue },
  origin: CellPos,
  range: RefRange,
): CellValue[][] {
  const startRow = Math.max(range.r1 - origin.row, 0);
  const endRow = range.r2 - origin.row;
  const startCol = Math.max(range.c1 - origin.col, 0);
  const endCol = range.c2 - origin.col;

  const out: CellValue[][] = [];
  for (let r = startRow; r <= endRow; r += 1) {
    const row: CellValue[] = [];
    for (let c = startCol; c <= endCol; c += 1) {
      row.push(source.at(r, c));
    }
    out.push(row);
  }
  return out;
}

/** 取一列区域内的表头文字；越界返回空串 */
function pickHeader(header: string[], origin: CellPos, range: RefRange): string[] {
  const out: string[] = [];
  for (let c = range.c1; c <= range.c2; c += 1) {
    const idx = c - origin.col;
    out.push(idx >= 0 && idx < header.length ? header[idx] : '');
  }
  return out;
}

/**
 * 把一张样表按区域切成 Sheet（表头在 anchor 那一行，数据从下一行开始）。
 * 越界行补 null，方便模拟「公式下拉后区域跑偏」这类错误场景。
 */
export function sliceTable(table: TableLike, ref: string): Sheet | null {
  const range = parseRef(ref);
  const anchorPos = parseCell(table.anchor);
  if (range === null || anchorPos === null) {
    return null;
  }
  const origin: CellPos = { col: anchorPos.col, row: anchorPos.row + 1 };
  const rows = pickBlock(
    {
      rowCount: table.rows.length,
      colCount: table.columns.length,
      at: (r, c) => {
        const row = table.rows[r];
        if (row === undefined) {
          return null;
        }
        const cell = row[c];
        return cell === undefined ? null : cell;
      },
    },
    origin,
    range,
  );
  return {
    anchor: `${indexToCol(range.c1)}${Math.max(origin.row, range.r1) + 1}`,
    header: pickHeader(table.columns, { col: anchorPos.col, row: anchorPos.row }, range),
    rows,
  };
}

/**
 * 在一个 Sheet 内再切一片（origin 是 Sheet 的数据区左上角）。
 * 用于 SUMIFS 的求和区域 / 条件区域各自切片。
 */
export function sliceSheet(sheet: Sheet, ref: string): Sheet | null {
  const range = parseRef(ref);
  const anchorPos = parseCell(sheet.anchor);
  if (range === null || anchorPos === null) {
    return null;
  }
  const rows = pickBlock(
    {
      rowCount: sheet.rows.length,
      colCount: sheet.header.length,
      at: (r, c) => {
        const row = sheet.rows[r];
        if (row === undefined) {
          return null;
        }
        const cell = row[c];
        return cell === undefined ? null : cell;
      },
    },
    anchorPos,
    range,
  );
  return {
    anchor: `${indexToCol(range.c1)}${Math.max(anchorPos.row, range.r1) + 1}`,
    header: pickHeader(sheet.header, anchorPos, range),
    rows,
  };
}

/** 把整张样表切成 Sheet（表头 + 全部数据行） */
export function wholeTable(table: TableLike): Sheet | null {
  const anchorPos = parseCell(table.anchor);
  if (anchorPos === null || table.columns.length === 0) {
    return null;
  }
  const ref = `${table.anchor}:${indexToCol(anchorPos.col + table.columns.length - 1)}${
    anchorPos.row + 1 + table.rows.length
  }`;
  return sliceTable(table, ref);
}

/** 把一个 Sheet 的某一列抽成一维数组（取每行的第 index 列，默认第一列） */
export function columnOf(sheet: Sheet, index = 0): CellValue[] {
  return sheet.rows.map((row) => (row[index] === undefined ? null : row[index]));
}

/** 读 Sheet 里某个单元格的值；越界返回 null */
export function cellValue(sheet: Sheet, cell: string): CellValue | null {
  const pos = parseCell(cell);
  const anchorPos = parseCell(sheet.anchor);
  if (pos === null || anchorPos === null) {
    return null;
  }
  const rowIdx = pos.row - anchorPos.row;
  const colIdx = pos.col - anchorPos.col;
  const row = sheet.rows[rowIdx];
  if (row === undefined) {
    return null;
  }
  const value = row[colIdx];
  return value === undefined ? null : value;
}

/** TSV 文本 → Sheet（表头占第一行，数据从第二行开始） */
export function sheetFromTsv(tsv: string, anchor = 'A1'): Sheet | null {
  const rows = parseTsv(tsv);
  if (rows.length === 0) {
    return null;
  }
  const [header, ...body] = rows;
  return {
    anchor: shiftAnchor(anchor),
    header,
    rows: body as CellValue[][],
  };
}

/** 'A1'（表头行）→ 'A2'（数据起始行） */
function shiftAnchor(anchor: string): string {
  const pos = parseCell(anchor);
  if (pos === null) {
    return 'A2';
  }
  return `${indexToCol(pos.col)}${pos.row + 2}`;
}

/**
 * 为一个函数条目准备试算用的 Sheet。
 * 优先用 calc.sampleTableId 指定的样表；没有则回退到 examples[0] 的数据。
 */
export function buildCalcSheet(entry: FunctionEntry, resolver: TableResolver): Sheet | null {
  const spec: CalcSpec = entry.calc;

  if (spec.sampleTableId !== undefined) {
    const table = resolver(spec.sampleTableId);
    if (table !== null) {
      return wholeTable(table);
    }
  }

  const first = entry.examples[0];
  if (first === undefined) {
    return null;
  }
  if (first.dataTsv !== undefined && first.dataTsv !== '') {
    return sheetFromTsv(first.dataTsv, first.dataAnchor);
  }
  if (first.tableId !== undefined) {
    const table = resolver(first.tableId);
    if (table !== null) {
      return wholeTable(table);
    }
  }
  // 没有显式数据源：若试算已开放，返回一个空 Sheet，让不读表的标量类函数
  // （如 NPV / MIRR / NOMINAL / SLN / SYD 等只从 args 取参数的函数）也能跑通；
  // 仍返回 null 仅在本函数未开放试算时（UI 不应调用 evaluateEntry 的情况）。
  if (spec.enabled) {
    return { anchor: 'A1', header: [], rows: [] };
  }
  return null;
}
