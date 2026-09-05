import { describe, expect, it } from 'vitest';
import type { CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import { isblankCalc, iserrorCalc, isnumberCalc } from './information';

const handlers: Record<string, CalcHandler> = {
  isnumber: isnumberCalc,
  isblank: isblankCalc,
  iserror: iserrorCalc,
};
const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string): boolean => ERROR_CODES.includes(s);

describe('信息类试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (entry === null || !entry.calc.enabled) {
        continue;
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i]);
      expect(sheet, `${id} 应成功构建试算 Sheet`).not.toBeNull();
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({
          sheet: sheet!,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        });
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) {
            expect(outcome.value.error, `${id} ${preset.label} 错误码`).toBe(preset.expect);
          }
        } else {
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) {
            expect(outcome.display, `${id} ${preset.label} 展示值`).toBe(preset.expect);
          }
        }
      });
    }
  });
});
