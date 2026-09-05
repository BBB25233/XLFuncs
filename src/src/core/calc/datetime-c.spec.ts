import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  weekdayCalc,
  weeknumCalc,
  isoweeknumCalc,
  eomonthCalc,
  workdayCalc,
  workdayIntlCalc,
  networkdaysCalc,
  networkdaysIntlCalc,
  yearfracCalc,
} from './datetime-c';
import type { CalcHandler } from '@/types';

const handlers: Record<string, CalcHandler> = {
  weekday: weekdayCalc,
  weeknum: weeknumCalc,
  isoweeknum: isoweeknumCalc,
  eomonth: eomonthCalc,
  workday: workdayCalc,
  'workday-intl': workdayIntlCalc,
  networkdays: networkdaysCalc,
  'networkdays-intl': networkdaysIntlCalc,
  yearfrac: yearfracCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('datetime-c 试算自测（B7 批次 9 函数）', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (!entry || !entry.calc.enabled) {
        throw new Error(`未找到 ${id} 的已启用 calc 配置`);
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      expect(sheet, `${id} 试算 Sheet 应构造成功`).not.toBeNull();
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
