import type { FunctionEntry } from '@/types';

/**
 * SIGN · 符号（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 盈亏小表 */
const PNL_TSV = '月份\t盈亏\n1月\t1200\n2月\t-800\n3月\t0\n4月\t-300';

const signEntry: FunctionEntry = {
  id: 'sign',
  enName: 'SIGN',
  zhName: '符号',
  zhCommon: ['符号函数', '正负判断', '取正负号'],
  alias: ['判断正负', '符号位', '正1负1零0'],
  category: 'math',
  abbr: 'fh',
  pinyin: 'fuhao',
  keywords: ['符号函数', '判断正负', '正1负1零0', '正负标记', '条件分段', '盈亏标记'],
  difficulty: 1,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '正数返回1，负数返回-1，零返回0',
  summary:
    'SIGN 只回答一个问题：这个数是正、负、还是零？它把任何正数压成 1、负数压成 -1、零压成 0，把「大小」全扔掉只留「方向」。常用来给数据打「盈/亏/平」的标记，或者做分段公式的开关。',
  syntax: {
    patternCn: '=SIGN(数字)',
    patternEn: '=SIGN(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要判断正负零的那个数。',
        accepts: '具体数字、单元格引用，如 A2、B2-C2。',
        ifOmitted: '这是唯一必填参数，省略报 #VALUE!。',
        tip: 'SIGN 只留方向不留大小；想保留大小用 ABS。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '正数→1，负数→-1，零→0；非数字参数报 #VALUE!。',
  examples: [
    {
      title: '示例 1：给月度盈亏打「盈/亏/平」标记',
      scene: '财务表里有一列盈亏金额，要快速标出哪些月赚了、哪些亏了、哪些持平。',
      dataTsv: PNL_TSV,
      dataAnchor: 'A1',
      formula: '=SIGN(B2)',
      result: '1月→1（盈）；2月→-1（亏）；3月→0（平）；4月→-1（亏）',
      explanation: 'SIGN 把金额压成方向码，配合后面的 IF 就能转成「盈/亏/平」文字。',
    },
    {
      title: '示例 2：SIGN + IF 转成文字标签',
      scene: '光给 1/-1/0 不够直观，要变成「盈利 / 亏损 / 持平」。',
      dataTsv: PNL_TSV,
      dataAnchor: 'A1',
      formula: '=IF(SIGN(B2)=1,"盈利",IF(SIGN(B2)=-1,"亏损","持平"))',
      result: '1月→盈利；2月→亏损；3月→持平；4月→亏损',
      explanation: '先用 SIGN 拿到方向，再用 IF 把 1/-1/0 翻译成人话。',
    },
    {
      title: '示例 3：算正负个数（数组用法）',
      scene: '一列数据，想数一数有几个是正数、几个是负数。',
      dataTsv: '数值\n5\n-3\n0\n8\n-2',
      dataAnchor: 'A1',
      formula: '=SUMPRODUCT(--(SIGN(A2:A6)=1))',
      result: '正数有 2 个（5、8）',
      explanation: 'SIGN 对每个数返回 1/-1/0，=(...)=1 得到 TRUE/FALSE，-- 转成 1/0，SUMPRODUCT 加起来就是正数个数。',
    },
  ],
  pitfalls: [
    {
      title: '以为 SIGN 会保留两位小数或大小',
      reason: 'SIGN 只输出 1、-1、0 三种值，原数有多大（如 -800）都变成 -1，别指望它返回 -800。',
      fix: '要保留数值大小就用原值或 ABS；SIGN 只负责「方向码」。',
      level: 'mid',
    },
    {
      title: '参数为文本或空值报 #VALUE!',
      reason: 'SIGN 只接受数字，传入文字或空单元格会报错。',
      fix: '先用 IFERROR 或确保传数字：=IFERROR(SIGN(A2),0)。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '想「分正负数做不同计算」却只用 SIGN 丢了原值',
      reason: 'SIGN 把大小丢了，若后续还要用原数值相乘，直接套 SIGN 会算错。',
      fix: '需要原值时用原单元格：=IF(SIGN(A2)=1, A2*0.1, A2*0.2) 之类，不要拿 SIGN 当数字用。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'abs',
      kind: 'companion',
      why: 'ABS 去符号、SIGN 留符号，一个关心大小一个关心方向，常成对出现。',
    },
    {
      id: 'if',
      kind: 'companion',
      why: 'SIGN 返回的 1/-1/0 通常要再交给 IF 翻译成文字或分支计算。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: '都和数字的符号/取整有关；INT 是向下取整保留大小，SIGN 只给方向码。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '-7', hint: '任意数字' },
    ],
    template: '=SIGN({number})',
    cases: [
      { label: '负数 -7 → -1', type: 'ok', values: { number: '-7' }, expect: '-1', note: '负数返回 -1。' },
      { label: '正数 7 → 1', type: 'ok', values: { number: '7' }, expect: '1', note: '正数返回 1。' },
      { label: '零 0 → 0', type: 'ok', values: { number: '0' }, expect: '0', note: '零返回 0。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '非数字会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default signEntry;
