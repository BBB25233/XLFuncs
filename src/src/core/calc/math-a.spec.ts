import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  absCalc,
  signCalc,
  gcdCalc,
  lcmCalc,
  modCalc,
  quotientCalc,
  powerCalc,
  productCalc,
  sqrtCalc,
  sumsqCalc,
  seriesumCalc,
  factCalc,
  factdoubleCalc,
  multinomialCalc,
  combinCalc,
  combinaCalc,
  permutCalc,
  romanCalc,
  baseCalc,
  decimalCalc,
  arabicCalc,
  truncCalc,
  piCalc,
} from './math-a';

const handlers: Record<string, CalcHandler> = {
  abs: absCalc,
  sign: signCalc,
  gcd: gcdCalc,
  lcm: lcmCalc,
  mod: modCalc,
  quotient: quotientCalc,
  power: powerCalc,
  product: productCalc,
  sqrt: sqrtCalc,
  sumsq: sumsqCalc,
  seriesum: seriesumCalc,
  fact: factCalc,
  factdouble: factdoubleCalc,
  multinomial: multinomialCalc,
  combin: combinCalc,
  combina: combinaCalc,
  permut: permutCalc,
  roman: romanCalc,
  base: baseCalc,
  decimal: decimalCalc,
  arabic: arabicCalc,
  trunc: truncCalc,
  pi: piCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('math-a 类试算自测（23 个函数）', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (entry === null || !entry.calc.enabled) {
        throw new Error(`函数 ${id} 的 calc 未启用或加载失败`);
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i as 'employee' | 'sales' | 'attendance'])!;
      if (sheet === null) {
        throw new Error(`函数 ${id} 的 buildCalcSheet 返回 null`);
      }
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
