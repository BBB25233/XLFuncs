import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import { indexCalc, matchCalc, indirectCalc, offsetCalc, rowCalc, columnCalc, uniqueCalc } from './lookup';
import { hlookupCalc, lookupCalc, chooseCalc, addressCalc, columnsCalc, rowsCalc, transposeCalc } from './lookup';

const handlers: Record<string, CalcHandler> = {
  index: indexCalc,
  match: matchCalc,
  indirect: indirectCalc,
  offset: offsetCalc,
  row: rowCalc,
  column: columnCalc,
  unique: uniqueCalc,
  hlookup: hlookupCalc,
  lookup: lookupCalc,
  choose: chooseCalc,
  address: addressCalc,
  columns: columnsCalc,
  rows: rowsCalc,
  transpose: transposeCalc,
};
const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('查找与引用类试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = await loadFunction(id) as FunctionEntry;
      if (!entry || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({ sheet, args: mergeArgs(entry.calc.fields, preset.values), spec: entry.calc });
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) expect(outcome.value.error).toBe(preset.expect);
        } else {
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) expect(outcome.display).toBe(preset.expect);
        }
      });
    }
  });
});
