import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  dateCalc,
  dayCalc,
  edateCalc,
  monthCalc,
  nowCalc,
  datedifCalc,
  todayCalc,
  yearCalc,
} from './datetime';

const handlers: Record<string, import('@/types').CalcHandler> = {
  today: todayCalc,
  now: nowCalc,
  date: dateCalc,
  year: yearCalc,
  month: monthCalc,
  day: dayCalc,
  datedif: datedifCalc,
  edate: edateCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

// TODAY / NOW 是易失函数：交付总监会从自动断言里排除，这里只校验「成功 + 格式正确」
const VOLATILE = new Set(['today', 'now']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

describe('日期时间类试算自测', () => {
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

        if (VOLATILE.has(id)) {
          // 易失函数：只验证成功 + 展示格式，不校验具体日期
          expect(outcome.ok, `${id} ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) {
            if (id === 'today') {
              expect(DATE_RE.test(outcome.display), `${id} 格式应为 YYYY-MM-DD`).toBe(true);
            } else {
              expect(DATETIME_RE.test(outcome.display), `${id} 格式应为 YYYY-MM-DD HH:mm:ss`).toBe(true);
            }
          }
          return;
        }

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
