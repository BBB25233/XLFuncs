import { describe, expect, it } from 'vitest';
import type { CalcContext, CalcHandler, FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  bin2decCalc, bin2hexCalc, bin2octCalc, dec2binCalc, dec2hexCalc, dec2octCalc,
  hex2binCalc, hex2decCalc, hex2octCalc, oct2binCalc, oct2decCalc, oct2hexCalc,
  bitandCalc, bitorCalc, bitxorCalc, bitlshiftCalc, bitrshiftCalc,
  deltaCalc, gestepCalc, erfCalc, erfcCalc, erfPreciseCalc, erfcPreciseCalc,
} from './engineering-b';

const handlers: Record<string, CalcHandler> = {
  bin2dec: bin2decCalc, bin2hex: bin2hexCalc, bin2oct: bin2octCalc,
  dec2bin: dec2binCalc, dec2hex: dec2hexCalc, dec2oct: dec2octCalc,
  hex2bin: hex2binCalc, hex2dec: hex2decCalc, hex2oct: hex2octCalc,
  oct2bin: oct2binCalc, oct2dec: oct2decCalc, oct2hex: oct2hexCalc,
  bitand: bitandCalc, bitor: bitorCalc, bitxor: bitxorCalc,
  bitlshift: bitlshiftCalc, bitrshift: bitrshiftCalc,
  delta: deltaCalc, gestep: gestepCalc, erf: erfCalc, erfc: erfcCalc,
  'erf.precise': erfPreciseCalc, 'erfc.precise': erfcPreciseCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('Engineering B11 试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
      if (entry === null || !entry.calc.enabled) {
        throw new Error(`条目 ${id} 未找到或未启用 calc`);
      }
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i]);
      if (sheet === null) {
        throw new Error(`条目 ${id} 无法构建试算表（sampleTableId 可能无效）`);
      }
      entry.calc.cases.forEach((preset) => {
        const ctx: CalcContext = {
          sheet,
          args: mergeArgs(entry.calc.fields, preset.values),
          spec: entry.calc,
        };
        const outcome = handlers[id](ctx);
        if (isErr(preset.expect)) {
          expect(outcome.ok, `${id} · ${preset.label} 应失败`).toBe(false);
          if (!outcome.ok) expect(outcome.value.error, `${id} · ${preset.label}`).toBe(preset.expect);
        } else {
          expect(outcome.ok, `${id} · ${preset.label} 应成功`).toBe(true);
          if (outcome.ok) expect(outcome.display, `${id} · ${preset.label}`).toBe(preset.expect);
        }
      });
    }
  });
});
