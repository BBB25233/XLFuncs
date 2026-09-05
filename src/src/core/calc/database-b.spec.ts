import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  daverageCalc,
  dcountCalc,
  dcountaCalc,
  dgetCalc,
  dmaxCalc,
  dminCalc,
  dproductCalc,
  dstdevCalc,
  dstdevpCalc,
  dvarCalc,
  dvarpCalc,
} from './database-b';

const handlers: Record<string, typeof daverageCalc> = {
  daverage: daverageCalc,
  dcount: dcountCalc,
  dcounta: dcountaCalc,
  dget: dgetCalc,
  dmax: dmaxCalc,
  dmin: dminCalc,
  dproduct: dproductCalc,
  dstdev: dstdevCalc,
  dstdevp: dstdevpCalc,
  dvar: dvarCalc,
  dvarp: dvarpCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('数据库类 B9 试算自测（database-b）', () => {
  it('每条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry;
      if (!entry || !entry.calc.enabled) {
        // eslint-disable-next-line no-console
        console.log(`[${id}] calc 未启用，跳过`);
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
