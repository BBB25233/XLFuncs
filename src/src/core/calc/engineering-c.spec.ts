import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  complexCalc,
  imabsCalc,
  imaginaryCalc,
  imargumentCalc,
  imconjugateCalc,
  imcosCalc,
  imcoshCalc,
  imcotCalc,
  imcscCalc,
  imcschCalc,
  imdivCalc,
  imexpCalc,
  imlnCalc,
  imlog10Calc,
  imlog2Calc,
  impowerCalc,
  improductCalc,
  imrealCalc,
  imsecCalc,
  imsechCalc,
  imsinCalc,
  imsinhCalc,
  imsqrtCalc,
  imsubCalc,
  imsumCalc,
  imtanCalc,
} from './engineering-c';

const handlers: Record<string, CalcHandler> = {
  complex: complexCalc,
  imabs: imabsCalc,
  imaginary: imaginaryCalc,
  imargument: imargumentCalc,
  imconjugate: imconjugateCalc,
  imcos: imcosCalc,
  imcosh: imcoshCalc,
  imcot: imcotCalc,
  imcsc: imcscCalc,
  imcsch: imcschCalc,
  imdiv: imdivCalc,
  imexp: imexpCalc,
  imln: imlnCalc,
  imlog10: imlog10Calc,
  imlog2: imlog2Calc,
  impower: impowerCalc,
  improduct: improductCalc,
  imreal: imrealCalc,
  imsec: imsecCalc,
  imsech: imsechCalc,
  imsin: imsinCalc,
  imsinh: imsinhCalc,
  imsqrt: imsqrtCalc,
  imsub: imsubCalc,
  imsum: imsumCalc,
  imtan: imtanCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('engineering-c 类试算自测（26 个复数函数）', () => {
  it('每个函数都有 ≥1 个 ok 用例和 ≥3 个 error 用例', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (entry === null || !entry.calc.enabled) {
        throw new Error(`函数 ${id} 的 calc 未启用或加载失败`);
      }
      const okCount = entry.calc.cases.filter((preset) => preset.type === 'ok').length;
      const errCount = entry.calc.cases.filter((preset) => preset.type === 'error').length;
      expect(okCount, `${id} 至少 1 个 ok 用例`).toBeGreaterThanOrEqual(1);
      expect(errCount, `${id} 至少 3 个 error 用例`).toBeGreaterThanOrEqual(3);
    }
  });

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
