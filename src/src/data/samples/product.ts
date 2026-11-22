import type { FunctionEntry } from '@/types';

/**
 * PRODUCT · 乘积（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 连乘小表 */
const MULT_TSV = '因数1\t因数2\t因数3\n2\t3\t4';

const productEntry: FunctionEntry = {
  id: 'product',
  enName: 'PRODUCT',
  zhName: '乘积',
  zhCommon: ['乘积', '连乘', '相乘'],
  alias: ['连乘', '全部相乘', '数字相乘积'],
  category: 'math',
  abbr: 'cj',
  pinyin: 'chengji',
  keywords: ['乘积', '连乘', '相乘', '全部相乘', '多因数', '阶乘前处理'],
  difficulty: 1,
  usageLevel: 45,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把一堆数字全部乘起来',
  summary:
    'PRODUCT 就是「乘法版 SUM」：把给到的所有数字、区域全部相乘。2、3、4 相乘得 24。它会自动跳过空格和文本，只乘数字——这点比自己写 =A1*A2*A3 智能（后者遇到文本会报 #VALUE!）。常用于概率连乘、多折扣叠加、阶乘等场景。',
  syntax: {
    patternCn: '=PRODUCT(数字1, [数字2], …)',
    patternEn: '=PRODUCT(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个要乘的数字或区域。',
        accepts: '数字、单元格、区域，如 A2:A10、2、B2。',
        ifOmitted: '必填，至少给一个。',
        tip: '区域和单个数字可混写：=PRODUCT(A2:A5, B2)。',
        example: 'A2:A5',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '第二个及以后的数字/区域，逗号继续追加。',
        accepts: '同「数字1」。',
        ifOmitted: '不写就只乘第一个参数。',
        tip: '可一直追加，没有数量上限。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回所有参数里数字的乘积；空格与文本被自动忽略，不参与相乘。',
  examples: [
    {
      title: '示例 1：把一整列因数连乘',
      scene: '一串转化率要连乘得到总转化率，或一串折扣要叠加。',
      dataTsv: MULT_TSV,
      dataAnchor: 'A1',
      formula: '=PRODUCT(A2:C2)',
      result: '2×3×4 = 24',
      explanation: 'PRODUCT 把 A2:C2 里的数字一股脑相乘，比写 =A2*B2*C2 更简洁也更易扩展。',
    },
    {
      title: '示例 2：多折扣叠加（连乘系数）',
      scene: '商品先打 9 折、再打 95 折、再满减系数 0.98，算最终到手价。',
      dataTsv: '原价\t折1\t折2\t折3\n1000\t0.9\t0.95\t0.98',
      dataAnchor: 'A1',
      formula: '=A2*PRODUCT(B2:D2)',
      result: '1000×0.9×0.95×0.98 ≈ 837.9',
      explanation: '把各折扣系数用 PRODUCT 连乘成一个总系数，再乘原价即可。',
    },
    {
      title: '示例 3：区域里混了文本也不报错',
      scene: '从系统导出的表里某个系数格是文本（如"暂无"），手写成乘法会崩，PRODUCT 不会。',
      dataTsv: '系数1\t系数2\t系数3\n2\t暂无\t4',
      dataAnchor: 'A1',
      formula: '=PRODUCT(A2:C2)',
      result: '2×4 = 8（文本"暂无"被自动跳过）',
      explanation: 'PRODUCT 忽略文本和空格，只乘真正的数字，公式不报错（但记得核对被跳过的格子是否符合预期）。',
    },
  ],
  pitfalls: [
    {
      title: '把 PRODUCT 和 POWER 搞混',
      reason: 'PRODUCT(2,3) = 6（两个数相乘）；POWER(2,3) = 8（2 自乘 3 次）。一字之差结果完全不同。',
      fix: '不同数相乘用 PRODUCT；同一数多次方用 POWER。',
      level: 'mid',
    },
    {
      title: '区域里有一个 0，结果悄悄变成 0',
      reason: '任何数乘以 0 都是 0。PRODUCT 不会报错，但整列乘积瞬间归零，常被误以为是算错。',
      fix: '先用筛选/IFERROR 排查 0 值；确认是真实 0 还是「空值被当成 0」。',
      level: 'high',
    },
    {
      title: '区域里混了错误值会传染',
      reason: '和 SUM 一样，PRODUCT 不跳过 #N/A、#DIV/0! 等错误值，会整条返回同一个错误。',
      fix: '先用 IFERROR 把错误清成 1（乘 1 不影响结果）：=PRODUCT(IFERROR(A2:A10,1))。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sum',
      kind: 'companion',
      why: 'SUM 是加法版、PRODUCT 是乘法版，都是「把一堆数合并成一个结果」。',
    },
    {
      id: 'power',
      kind: 'confusable',
      why: 'PRODUCT 连乘不同数、POWER 自乘同数，概念易混，按需选取。',
    },
    {
      id: 'sumproduct',
      kind: 'companion',
      why: '要「先对应相乘、再求和」用 SUMPRODUCT；纯连乘汇总用 PRODUCT。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number1', label: '数字1', type: 'number', default: '2' },
      { key: 'number2', label: '数字2', type: 'number', default: '3' },
      { key: 'number3', label: '数字3', type: 'number', default: '4' },
      { key: 'number4', label: '数字4（可选）', type: 'number', default: '' },
      { key: 'number5', label: '数字5（可选）', type: 'number', default: '' },
    ],
    template: '=PRODUCT({number1},{number2},{number3})',
    cases: [
      { label: 'PRODUCT(2,3,4) → 24', type: 'ok', values: { number1: '2', number2: '3', number3: '4' }, expect: '24', note: '2×3×4 = 24。' },
      { label: 'PRODUCT(0,5) → 0', type: 'ok', values: { number1: '0', number2: '5' }, expect: '0', note: '只要有一个 0，乘积就是 0。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '3', number3: '4' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default productEntry;
