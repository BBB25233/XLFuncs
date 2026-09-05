import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  percentileExcCalc,
  percentileIncCalc,
  quartileExcCalc,
  quartileIncCalc,
  rankAvgCalc,
  rankEqCalc,
  smallCalc,
  skewCalc,
  stdevPCalc,
  stdevSCalc,
  stdevaCalc,
  stdevpaCalc,
  rsqCalc,
  slopeCalc,
  steyxCalc,
  trendCalc,
  trimmeanCalc,
  permutationaCalc,
  poissonDistCalc,
  tDistCalc,
  varPCalc,
  varSCalc,
  varaCalc,
  varpaCalc,
} from './statistical-d';

const handlers: Record<string, CalcHandler> = {
  'percentile-exc': percentileExcCalc,
  'percentile-inc': percentileIncCalc,
  'quartile-exc': quartileExcCalc,
  'quartile-inc': quartileIncCalc,
  'rank-avg': rankAvgCalc,
  'rank-eq': rankEqCalc,
  small: smallCalc,
  skew: skewCalc,
  'stdev-p': stdevPCalc,
  'stdev-s': stdevSCalc,
  stdeva: stdevaCalc,
  'stdevpa': stdevpaCalc,
  rsq: rsqCalc,
  slope: slopeCalc,
  steyx: steyxCalc,
  trend: trendCalc,
  trimmean: trimmeanCalc,
  permutationa: permutationaCalc,
  'poisson-dist': poissonDistCalc,
  't-dist': tDistCalc,
  'var-p': varPCalc,
  'var-s': varSCalc,
  vara: varaCalc,
  'varpa': varpaCalc,
};
const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('statistical-d 试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry;
      if (!entry || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({
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
