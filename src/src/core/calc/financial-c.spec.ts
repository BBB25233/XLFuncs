import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import { buildCalcSheet } from '@/core/ref';
import { mergeArgs } from '@/core/formula';
import { loadFunction } from '@/data/loadFunction';
import {
  mdurationCalc, mirrCalc, nominalCalc, npvCalc, oddfpriceCalc, oddfyieldCalc,
  oddlpriceCalc, oddlyieldCalc, pdurationCalc, ppmtCalc, priceCalc, pricediscCalc,
  pricematCalc, receivedCalc, rriCalc, slnCalc, sydCalc, tbilleqCalc, tbillpriceCalc,
  tbillyieldCalc, vdbCalc, xirrCalc, xnpvCalc, yieldCalc, yielddiscCalc, yieldmatCalc,
} from './financial-c';

const handlers: Record<string, any> = {
  mduration: mdurationCalc, mirr: mirrCalc, nominal: nominalCalc, npv: npvCalc,
  oddfprice: oddfpriceCalc, oddfyield: oddfyieldCalc, oddlprice: oddlpriceCalc, oddlyield: oddlyieldCalc,
  pduration: pdurationCalc, ppmt: ppmtCalc, price: priceCalc, pricedisc: pricediscCalc,
  pricemat: pricematCalc, received: receivedCalc, rri: rriCalc, sln: slnCalc, syd: sydCalc,
  tbilleq: tbilleqCalc, tbillprice: tbillpriceCalc, tbillyield: tbillyieldCalc, vdb: vdbCalc,
  xirr: xirrCalc, xnpv: xnpvCalc, yield: yieldCalc, yielddisc: yielddiscCalc, yieldmat: yieldmatCalc,
};
const ERROR_CODES = ['#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#DIV/0!', '#SPILL!'];
const isErr = (s: string): boolean => ERROR_CODES.includes(s);

describe('财务类 C 批（B14）试算自测', () => {
  it('每一条 calc.cases 结果与 expect 一致', async () => {
    for (const id of Object.keys(handlers)) {
      const entry = (await loadFunction(id)) as FunctionEntry | null;
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
