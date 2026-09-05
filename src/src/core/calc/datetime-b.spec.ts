import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  timeCalc,
  timevalueCalc,
  hourCalc,
  minuteCalc,
  secondCalc,
  datevalueCalc,
  daysCalc,
  days360Calc,
} from './datetime-b';

const handlers: Record<string, import('@/types').CalcHandler> = {
  time: timeCalc,
  timevalue: timevalueCalc,
  hour: hourCalc,
  minute: minuteCalc,
  second: secondCalc,
  datevalue: datevalueCalc,
  days: daysCalc,
  days360: days360Calc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('日期时间类核心时间/日期（B6）试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry;
      if (!entry || !entry.calc.enabled) {
        throw new Error(`函数 ${id} 的 calc 未启用，无法自测`);
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
