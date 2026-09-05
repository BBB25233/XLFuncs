import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  cellCalc, errorTypeCalc, infoCalc, iserrCalc, isevenCalc, isformulaCalc,
  islogicalCalc, isnaCalc, isnontextCalc, isoddCalc, isrefCalc, istextCalc,
  nCalc, naCalc, sheetCalc, sheetsCalc, typeCalc,
} from './information-b';

const handlers: Record<string, CalcHandler> = {
  cell: cellCalc,
  'error-type': errorTypeCalc,
  info: infoCalc,
  iserr: iserrCalc,
  iseven: isevenCalc,
  isformula: isformulaCalc,
  islogical: islogicalCalc,
  isna: isnaCalc,
  isnontext: isnontextCalc,
  isodd: isoddCalc,
  isref: isrefCalc,
  istext: istextCalc,
  n: nCalc,
  na: naCalc,
  sheet: sheetCalc,
  sheets: sheetsCalc,
  type: typeCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('information-b 试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (!entry || !entry.calc.enabled) {
        throw new Error(`函数 ${id} 的 calc 未启用或加载失败`);
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i] ?? null)!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({
          sheet,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        });
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) {
            expect(outcome.value.error).toBe(preset.expect);
          }
        } else {
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) {
            expect(outcome.display).toBe(preset.expect);
          }
        }
      });
    }
  });
});
