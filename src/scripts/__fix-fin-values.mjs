// 校正财务示例的 Excel 真值（依据 __fin-check2.ps1 / 审计结果）
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'data', 'samples');
const edits = {
  'fvschedule.ts': [["dataTsv: '0.05\\n0.04\\n0.03'", "dataTsv: '利率\\n0.05\\n0.04\\n0.03'"]],
  'irr.ts': [["dataTsv: '-10000\\n4000\\n5000\\n6000'", "dataTsv: '现金流\\n-10000\\n4000\\n5000\\n6000'"]],
  'mirr.ts': [["dataTsv: '-10000\\n3000\\n4200\\n6800'", "dataTsv: '现金流\\n-10000\\n3000\\n4200\\n6800'"]],
  'xnpv.ts': [
    ["dataTsv: '现金流\\t日期序列\\n-10000\\t45292\\n3000\\t45383\\n4200\\t45658'", "dataTsv: '现金流\\t日期序列\\n-10000\\t45292\\n3000\\t45444\\n4200\\t45658'"],
    ["dataTsv: '现金流\\t日期序列\\n-5000\\t45292\\n2600\\t45566\\n2800\\t45823'", "dataTsv: '现金流\\t日期序列\\n-5000\\t45292\\n2600\\t45536\\n2800\\t45778'"],
    ["result: '约 -92.80'", "result: '约 -49.09'"],
  ],
  'xirr.ts': [["result: '约 0.3463'", "result: '约 0.3701'"]],
  'vdb.ts': [["result: '64000'", "result: '24000'"]],
  'disc.ts': [["result: '约 0.0256'", "result: '0.04'"]],
  'pricedisc.ts': [
    ["result: '约 95.2'", "result: '98'"],
    ['=PRICEDISC(DATE(2024,1,1),DATE(2024,7,1),0,100,0)', '=PRICEDISC(DATE(2024,1,1),DATE(2024,7,1),0.02,100,0)'],
    ["result: '100'", "result: '99'"],
  ],
  'received.ts': [["result: '约 98.08'", "result: '约 97.96'"]],
  'tbilleq.ts': [["result: '约 0.0408'", "result: '约 0.0410'"]],
  'yieldmat.ts': [["result: '约 0.08'", "result: '约 0.1194'"]],
  'coupdaybs.ts': [["result: '44'", "result: '0'"]],
  'coupdaysnc.ts': [["result: '136'", "result: '180'"]],
  'dollarde.ts': [
    ["result: '约 1.125'", "result: '1.25'"],
    ['=DOLLARDE(1.04,8)', '=DOLLARDE(1.04,32)'],
    ["result: '约 1.5'", "result: '1.125'"],
    ["explanation: '分母参数决定分数进制。'", "explanation: '4/32 折算为 0.125，故为 1.125。'"],
  ],
  'dollarfr.ts': [
    ['=DOLLARFR(1.02,32)', '=DOLLARFR(1.25,32)'],
    ["result: '约 1.0625'", "result: '1.08'"],
    ['=DOLLARFR(1.25,8)', '=DOLLARFR(1.5,32)'],
    ["result: '约 1.2'", "result: '1.16'"],
    ["explanation: '分母为 8 时，0.25 记作 2/8。'", "explanation: '0.5 按 16/32 记作 1.16。'"],
  ],
  'ispmt.ts': [["result: '约 -491.67'", "result: '约 -409.72'"]],
};

for (const [file, pairs] of Object.entries(edits)) {
  let src = readFileSync(join(dir, file), 'utf8');
  for (const [from, to] of pairs) {
    if (src.includes(to)) continue;
    if (!src.includes(from)) throw new Error(`${file}: not found -> ${from}`);
    src = src.replace(from, to);
  }
  writeFileSync(join(dir, file), src);
}
console.log('patched', Object.keys(edits).length);

