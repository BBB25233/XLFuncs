import type { FunctionEntry } from '@/types';

/**
 * MOD · 取余（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 分组小表 */
const GRP_TSV = '序号\t每列人数\n1\t3\n2\t3\n3\t3\n4\t3\n5\t3';

const modEntry: FunctionEntry = {
  id: 'mod',
  enName: 'MOD',
  zhName: '取余',
  zhCommon: ['取余', '求余数', '取模'],
  alias: ['求余数', '取模', '周期分组'],
  category: 'math',
  abbr: 'qy',
  pinyin: 'quyu',
  keywords: ['取余', '求余数', '取模', '周期分组', '奇偶判断', '按列循环'],
  difficulty: 2,
  usageLevel: 50,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'MOD 的结果符号和「除数」一致：除数为正，余数恒为非负；除数为负，余数可能为负。',
  },
  oneLiner: '算出除法之后剩下的余数',
  summary:
    'MOD 做整除之后把「剩下的零头」还给你：MOD(10,3)=1（10 除以 3 商 3 余 1）。它最擅长两件事——判断奇偶（MOD(数,2) 得 0 是偶、得 1 是奇），以及做周期循环分组（按行号取余来轮流分到不同列）。注意余数符号跟除数走。',
  syntax: {
    patternCn: '=MOD(被除数, 除数)',
    patternEn: '=MOD(number, divisor)',
    args: [
      {
        key: 'number',
        zh: '被除数',
        en: 'number',
        required: true,
        desc: '要被除的那个数（你要看余数的对象）。',
        accepts: '数字或单元格，如 A2、10。',
        ifOmitted: '必填。',
        tip: '想判断奇偶就填行号，如 MOD(ROW(),2)。',
        example: '10',
        pitfallRank: 2,
      },
      {
        key: 'divisor',
        zh: '除数',
        en: 'divisor',
        required: true,
        desc: '用来除的数，余数范围在 0 到（除数绝对值-1）之间。',
        accepts: '非零数字，如 3、2（判奇偶）、A2。',
        ifOmitted: '必填，且不能为 0。',
        tip: '余数符号与除数一致：除数为正时余数恒 ≥0。',
        example: '3',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回 number 除以 divisor 的余数；符号与 divisor 相同。divisor 为 0 时返回 #DIV/0!。',
  examples: [
    {
      title: '示例 1：判断奇偶（隔行上色/隔行取数）',
      scene: '表格要隔一行标一次色，或只取偶数行。',
      dataTsv: GRP_TSV,
      dataAnchor: 'A1',
      formula: '=MOD(A2,2)',
      result: '1→1（奇）；2→0（偶）；3→1（奇）；4→0（偶）；5→1（奇）',
      explanation: 'MOD(行号,2) 周期性地返回 1、0、1、0…，配合条件格式或 IF 就能隔行处理。',
    },
    {
      title: '示例 2：把数据轮流分到 3 列',
      scene: '一列长数据，要按 1、2、3 循环分配到三列里。',
      dataTsv: GRP_TSV,
      dataAnchor: 'A1',
      formula: '=MOD(A2-1,3)+1',
      result: '1→1；2→2；3→3；4→1；5→2（在 1/2/3 间循环）',
      explanation: '先减 1 把起点对齐到 0，取余 3 得 0/1/2，再加 1 变回 1/2/3，实现循环分组。',
    },
    {
      title: '示例 3：算「还剩多少不满一周」',
      scene: '总天数除以 7，想知道余下几天不足一周。',
      dataTsv: '总天数\n23',
      dataAnchor: 'A1',
      formula: '=MOD(A2,7)',
      result: 'MOD(23,7)=2（23 天 = 3 周零 2 天）',
      explanation: '整除的商（3 周）被扔掉，MOD 只把余下的 2 天交还给你。',
    },
  ],
  pitfalls: [
    {
      title: '除数为 0 报 #DIV/0!',
      reason: 'MOD(数, 0) 在数学上无意义，Excel 直接报除零错误，而且会像病毒一样传染整条公式。',
      fix: '确保除数不为 0；来源是引用时先 IFERROR 或 IF(除数=0, …,"") 兜住。',
      level: 'high',
      errorCode: '#DIV/0!',
    },
    {
      title: '忘记余数符号跟着除数走',
      reason: 'MOD(-10,3) 在 Excel 里等于 2（不是 -1），因为余数符号和除数 3 一致。很多人按数学「负余数」的直觉会算错。',
      fix: '要恒为非负的余数就用正除数；要正向循环分组也用正除数 MOD(数, n)。',
      level: 'high',
    },
    {
      title: '把 MOD 当成「整除商」',
      reason: 'MOD 返回的是余数，不是商。要商的整数部分请用 QUOTIENT 或 INT(数/除数)。',
      fix: '要商用 QUOTIENT(数,除数)；要余数用 MOD(数,除数)。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'quotient',
      kind: 'companion',
      why: 'QUOTIENT 给整除的商、MOD 给除法剩下的余数，一个管商一个管余，常一起用。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: 'INT(数/除数) 也能得到整除部分，但 INT 是向下取整（负数时方向不同），MOD 才是真余数。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: 'ROUNDDOWN(数/除数,0) 也可取整除部分；和 MOD 配不出余数，需配合 QUOTIENT。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number1', label: '被除数', type: 'number', default: '3' },
      { key: 'number2', label: '除数', type: 'number', default: '2' },
    ],
    template: '=MOD({number1},{number2})',
    cases: [
      { label: 'MOD(3,2) → 1', type: 'ok', values: { number1: '3', number2: '2' }, expect: '1', note: '3 除以 2 余 1。' },
      { label: 'MOD(-3,2) → 1', type: 'ok', values: { number1: '-3', number2: '2' }, expect: '1', note: '余数符号跟随除数（正），所以是 1。' },
      { label: '除数为 0 → #DIV/0!', type: 'error', values: { number1: '3', number2: '0' }, expect: '#DIV/0!', note: '除数为 0 报 #DIV/0!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number1: 'abc', number2: '2' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default modEntry;
