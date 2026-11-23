import type { CellValue, ExampleItem, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { parseTsv } from '@/core/tsv';

/**
 * 详情页「表格视图」的唯一解析入口。
 *
 * 示例区与试算区必须显示同一张表：试算的算式就写在这张表上，
 * 两边各算一次（历史问题：试算区只认 sampleTableId，导致 139 个函数看不到数据）。
 */

export interface TableView {
  /** 三张统一样表的名字；由 dataTsv 还原的临时表没有名字 */
  name?: string;
  header: string[];
  rows: CellValue[][];
  /** 表头左上角所在单元格，如 'A1' */
  anchor: string;
}

/** TSV → 表；表头占 anchor 所在行，数据自下一行开始（与 core/ref.ts 的 sheetFromTsv 同口径） */
export function tableFromTsv(tsv: string, anchor: string): TableView | null {
  const parsed = parseTsv(tsv);
  if (parsed.length === 0) {
    return null;
  }
  const [header, ...body] = parsed;
  return { header, rows: body as CellValue[][], anchor };
}

/** 某个示例自己的数据源：dataTsv 优先，其次三张统一样表 */
export function tableOfExample(example: ExampleItem): TableView | null {
  if (example.dataTsv !== undefined && example.dataTsv !== '') {
    return tableFromTsv(example.dataTsv, example.dataAnchor);
  }
  if (example.tableId !== undefined) {
    const table = SAMPLE_TABLES[example.tableId];
    return { name: table.name, header: table.columns, rows: table.rows, anchor: table.anchor };
  }
  return null;
}

/**
 * 试算区用的表。优先级与 core/ref.ts 的 buildCalcSheet 完全一致
 * （calc.sampleTableId → examples[0]），否则会出现「显示的表」和「真正参与计算的表」不是同一张。
 */
export function tableOfCalc(entry: FunctionEntry): TableView | null {
  const id = entry.calc.sampleTableId;
  if (id !== undefined) {
    const table = SAMPLE_TABLES[id];
    return { name: table.name, header: table.columns, rows: table.rows, anchor: table.anchor };
  }
  const first = entry.examples[0];
  if (first === undefined) {
    return null;
  }
  return tableOfExample(first);
}
