import { describe, expect, it } from 'vitest';
import type { FunctionEntry, CalcHandler } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  accrintCalc, accrintmCalc, amordegrcCalc, amorlincCalc,
  coupdaybsCalc, coupdaysCalc, coupdaysncCalc, coupncdCalc, coupnumCalc, couppcdCalc,
  cumipmtCalc, cumprincCalc, dbCalc, ddbCalc, discCalc, dollardeCalc, dollarfrCalc,
  durationCalc, effectCalc, euroconvertCalc, fvscheduleCalc, intrateCalc, ipmtCalc,
  irrCalc, ispmtCalc,
} from './financial-b';

const handlers: Record<string, CalcHandler> = {
  accrint: accrintCalc, accrintm: accrintmCalc, amordegrc: amordegrcCalc, amorlinc: amorlincCalc,
  coupdaybs: coupdaybsCalc, coupdays: coupdaysCalc, coupdaysnc: coupdaysncCalc, coupncd: coupncdCalc,
  coupnum: coupnumCalc, couppcd: couppcdCalc, cumipmt: cumipmtCalc, cumprinc: cumprincCalc,
  db: dbCalc, ddb: ddbCalc, disc: discCalc, dollarde: dollardeCalc, dollarfr: dollarfrCalc,
  duration: durationCalc, effect: effectCalc, euroconvert: euroconvertCalc, fvschedule: fvscheduleCalc,
  intrate: intrateCalc, ipmt: ipmtCalc, irr: irrCalc, ispmt: ispmtCalc,
};

const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string) => ERROR_CODES.includes(s);

describe('financial-b 本分类试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = await loadFunction(id) as FunctionEntry | null;
      if (!entry || !entry.calc.enabled) continue;
      const sheet = buildCalcSheet(entry, (i) => SAMPLE_TABLES[i])!;
      entry.calc.cases.forEach((preset) => {
        const outcome = handlers[id]({ sheet, args: mergeArgs(entry.calc.fields, preset.values), spec: entry.calc });
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
