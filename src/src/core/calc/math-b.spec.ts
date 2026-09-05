import { describe, expect, it } from 'vitest';
import type { CalcContext, CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  sinCalc,
  cosCalc,
  tanCalc,
  asinCalc,
  acosCalc,
  atanCalc,
  atan2Calc,
  sinhCalc,
  coshCalc,
  tanhCalc,
  asinhCalc,
  acoshCalc,
  atanhCalc,
  degreesCalc,
  radiansCalc,
  sqrtpiCalc,
  randCalc,
  randbetweenCalc,
  ceilingMathCalc,
  floorMathCalc,
  mroundCalc,
  evenCalc,
  oddCalc,
} from './math-b';

/** 21 个确定性函数走通用 display 相等断言 */
const deterministicHandlers: Record<string, CalcHandler> = {
  sin: sinCalc,
  cos: cosCalc,
  tan: tanCalc,
  asin: asinCalc,
  acos: acosCalc,
  atan: atanCalc,
  atan2: atan2Calc,
  sinh: sinhCalc,
  cosh: coshCalc,
  tanh: tanhCalc,
  asinh: asinhCalc,
  acosh: acoshCalc,
  atanh: atanhCalc,
  degrees: degreesCalc,
  radians: radiansCalc,
  sqrtpi: sqrtpiCalc,
  'ceiling-math': ceilingMathCalc,
  'floor-math': floorMathCalc,
  mround: mroundCalc,
  even: evenCalc,
  odd: oddCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('math-b 试算自测（21 个确定性函数）', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(deterministicHandlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (entry === null || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = deterministicHandlers[id]({
          sheet,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        });
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

/** rand / randbetween 非确定性：自定义断言（不比对固定 display） */
describe('math-b 随机函数自定义断言', () => {
  it('RAND 返回 [0,1) 区间随机数', async () => {
    const entry = (await loadFunction('rand')) as FunctionEntry;
    const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
    const ctx: CalcContext = { sheet, args: mergeArgs(entry.calc.fields, {}), spec: entry.calc };
    const outcome = randCalc(ctx);
    expect(outcome.ok, 'RAND 应成功').toBe(true);
    if (outcome.ok) {
      const n = Number(outcome.display);
      expect(Number.isFinite(n), 'RAND 返回值应为数字').toBe(true);
      expect(n >= 0 && n < 1, `RAND 应在 [0,1)，实际 ${n}`).toBe(true);
    }
  });

  it('RANDBETWEEN 返回 [bottom,top] 内整数', async () => {
    const entry = (await loadFunction('randbetween')) as FunctionEntry;
    const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
    const ctx: CalcContext = {
      sheet,
      args: mergeArgs(entry.calc.fields, { bottom: '1', top: '10' }),
      spec: entry.calc,
    };
    const outcome = randbetweenCalc(ctx);
    expect(outcome.ok, 'RANDBETWEEN 应成功').toBe(true);
    if (outcome.ok) {
      const n = Number(outcome.display);
      expect(Number.isInteger(n), `RANDBETWEEN 应为整数，实际 ${n}`).toBe(true);
      expect(n >= 1 && n <= 10, `RANDBETWEEN 应在 [1,10]，实际 ${n}`).toBe(true);
    }
  });

  it('RANDBETWEEN 非整数下界返回 #VALUE!', async () => {
    const entry = (await loadFunction('randbetween')) as FunctionEntry;
    const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
    const ctx: CalcContext = {
      sheet,
      args: mergeArgs(entry.calc.fields, { bottom: '1.5', top: '10' }),
      spec: entry.calc,
    };
    const outcome = randbetweenCalc(ctx);
    expect(outcome.ok, '非整数下界应失败').toBe(false);
    if (!outcome.ok) expect(outcome.value.error).toBe('#VALUE!');
  });

  it('RANDBETWEEN 下界 > 上界返回 #NUM!', async () => {
    const entry = (await loadFunction('randbetween')) as FunctionEntry;
    const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
    const ctx: CalcContext = {
      sheet,
      args: mergeArgs(entry.calc.fields, { bottom: '10', top: '1' }),
      spec: entry.calc,
    };
    const outcome = randbetweenCalc(ctx);
    expect(outcome.ok, '下界>上界应失败').toBe(false);
    if (!outcome.ok) expect(outcome.value.error).toBe('#NUM!');
  });
});
