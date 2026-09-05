import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import { pmtCalc, rateCalc, nperCalc, pvCalc, fvCalc } from './financial';

const handlers: Record<string, typeof pmtCalc> = {
  pmt: pmtCalc,
  rate: rateCalc,
  nper: nperCalc,
  pv: pvCalc,
  fv: fvCalc,
};
const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('财务类 TVM 试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry;
      if (!entry || !entry.calc.enabled) {
        continue;
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({
          sheet,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        });
        if (isErr(preset.expect)) {
          if (!outcome.ok) {
            // eslint-disable-next-line no-console
            console.log(`[${id}] ${preset.label} => ${outcome.value.error}`);
          }
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) expect(outcome.value.error).toBe(preset.expect);
        } else {
          if (outcome.ok) {
            // eslint-disable-next-line no-console
            console.log(`[${id}] ${preset.label} => "${outcome.display}" (expect "${preset.expect}")`);
          } else {
            // eslint-disable-next-line no-console
            console.log(`[${id}] ${preset.label} => FAIL: ${outcome.value.error}`);
          }
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) expect(outcome.display).toBe(preset.expect);
        }
      });
    }
  });
});
