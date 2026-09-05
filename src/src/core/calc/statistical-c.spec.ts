import { describe, expect, it } from 'vitest';
import type { CalcContext, CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  avedevCalc,
  averageaCalc,
  binomDistCalc,
  correlCalc,
  countblankCalc,
  covariancePCalc,
  covarianceSCalc,
  devsqCalc,
  forecastLinearCalc,
  frequencyCalc,
  geomeanCalc,
  growthCalc,
  harmeanCalc,
  interceptCalc,
  kurtCalc,
  largeCalc,
  linestCalc,
  logestCalc,
  medianCalc,
  modeMultCalc,
  modeSnglCalc,
  normDistCalc,
  normSDistCalc,
  pearsonCalc,
} from './statistical-c';

const handlers: Record<string, CalcHandler> = {
  avedev: avedevCalc,
  averagea: averageaCalc,
  'binom-dist': binomDistCalc,
  correl: correlCalc,
  countblank: countblankCalc,
  'covariance-p': covariancePCalc,
  'covariance-s': covarianceSCalc,
  devsq: devsqCalc,
  'forecast-linear': forecastLinearCalc,
  frequency: frequencyCalc,
  geomean: geomeanCalc,
  growth: growthCalc,
  harmean: harmeanCalc,
  intercept: interceptCalc,
  kurt: kurtCalc,
  large: largeCalc,
  linest: linestCalc,
  logest: logestCalc,
  median: medianCalc,
  'mode-mult': modeMultCalc,
  'mode-sngl': modeSnglCalc,
  'norm-dist': normDistCalc,
  'norm-s-dist': normSDistCalc,
  pearson: pearsonCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string): boolean => ERROR_CODES.includes(s);

describe('统计 C 类（24 个）试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (!entry || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i as keyof typeof SAMPLE_TABLES])!;
      entry.calc.cases.forEach((preset) => {
        const spec = entry.calc;
        const outcome = handlers[id]({
          sheet,
          args: mergeArgs(spec.fields, preset.values),
          spec,
        } as CalcContext);
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
