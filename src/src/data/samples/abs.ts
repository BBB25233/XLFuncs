import type { FunctionEntry } from '@/types';

/**
 * ABS · 绝对值（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 偏差小表：4 行数据，表头占第 1 行，数据在第 2–5 行 */
const DIFF_TSV = '实测\t标准\t偏差\n103\t100\t3\n97\t100\t-3\n100\t100\t0\n106\t100\t6';

const absEntry: FunctionEntry = {
  id: 'abs',
  enName: 'ABS',
  zhName: '绝对值',
  zhCommon: ['绝对值', '取正数', '去符号'],
  alias: ['取绝对值', '正数化', '去掉负号'],
  category: 'math',
  abbr: 'jdz',
  pinyin: 'jueduizhi',
  keywords: ['绝对值', '取正数', '去掉负号', '偏差大小', '距离', '差值取正'],
  difficulty: 1,
  usageLevel: 55,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把负数变成正数，正数不变',
  summary:
    'ABS 就是「去掉符号」：正多少还是正多少，负多少变成正多少，0 还是 0。最常用来算「误差有多大」「差了多少」，因为误差往往只看大小不看方向。比如实测 97、标准 100，直接相减得 -3，套个 ABS 就变成 3，一眼看出差了 3 个单位。',
  syntax: {
    patternCn: '=ABS(数字)',
    patternEn: '=ABS(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要取绝对值的那个数，可正可负可为 0。',
        accepts: '具体数字、单元格引用，如 A2、-7、B2-C2（相减结果）。',
        ifOmitted: '这是唯一必填参数，省略会报 #VALUE!。',
        tip: 'ABS 只作用于「数」，不会改变它在公式里的位置；想保留符号就用 SIGN。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该数的绝对值：正数不变，负数变正，0 仍为 0。',
  examples: [
    {
      title: '示例 1：把偏差变成「只关心大小」',
      scene: '实测值和标准值相减，得到正负不一的误差，领导只想知道「差了多少」。',
      dataTsv: DIFF_TSV,
      dataAnchor: 'A1',
      formula: '=ABS(C2)',
      result: '103→3；97→3；100→0；106→6（只看绝对值，不区分超/欠）',
      explanation:
        'C 列是「实测-标准」的偏差，有正有负。ABS 把负号摘掉，只留下差了多少，方便后面统一比较或求和。',
    },
    {
      title: '示例 2：配合 SUM 算总偏差（误差绝对值之和）',
      scene: '多笔数据，要算「累计误差有多大」，不能正负抵消。',
      dataTsv: DIFF_TSV,
      dataAnchor: 'A1',
      formula: '=SUM(ABS(C2),ABS(C3),ABS(C4),ABS(C5))',
      result: '3+3+0+6 = 12',
      explanation:
        '先把每个偏差取绝对值，再相加。注意 ABS 要套在每一个 C 上，不能写成 ABS(C2:C5)——ABS 一次只接受一个数字。',
    },
    {
      title: '示例 3：算两点间「距离」',
      scene: '坐标轴上有几个点，要算它们离原点有多远。',
      dataTsv: '点\t坐标\nA\t-5\nB\t3\nC\t0',
      dataAnchor: 'A1',
      formula: '=ABS(B2)',
      result: 'A→5；B→3；C→0',
      explanation: '距离没有负数，ABS 正好把负坐标翻成正的距离。',
    },
  ],
  pitfalls: [
    {
      title: '想一次性给一整列取绝对值，写成 =ABS(C2:C5)',
      reason:
        'ABS 只接受一个数字，不能直接框一整列。框区域会触发数组运算（旧版 Excel 要按 Ctrl+Shift+Enter，新版 365 能溢出），新手很容易拿不到想要的结果。',
      fix: '老老实实一行行写 =ABS(C2)、=ABS(C3)…下拉填充；或者用 SUMPRODUCT(ABS(区域)) 这类数组写法。',
      level: 'mid',
    },
    {
      title: '把 ABS 当「四舍五入」或「取整」用',
      reason: 'ABS 只去符号，不动小数位。ABS(-3.9) 还是 3.9，不会变成 4 或 3。',
      fix: '要取整/保留小数请用 ROUND、ROUNDDOWN、INT 等；ABS 只管符号。',
      level: 'low',
    },
    {
      title: '参数里混入文本或空单元格',
      reason: 'ABS("abc") 或 ABS(空文本) 会报 #VALUE!——它只认数字。',
      fix: '先用 VALUE() 转数字，或确保传入的是纯数值单元格。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'sign',
      kind: 'companion',
      why: 'ABS 去掉符号、SIGN 只留符号（正1负1零0），两者常常一起用。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '算「误差绝对值之和」时，ABS 负责取正、SUM 负责加总，是经典搭配。',
    },
    {
      id: 'sqrt',
      kind: 'confusable',
      why: 'ABS 是「去符号」，SQRT 是「开平方」，别把距离的平方误当成绝对值。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '-7', hint: '要取绝对值的数，可正可负' },
    ],
    template: '=ABS({number})',
    cases: [
      { label: '正数 7 → 7', type: 'ok', values: { number: '7' }, expect: '7', note: '正数绝对值还是本身。' },
      { label: '负数 -7 → 7', type: 'ok', values: { number: '-7' }, expect: '7', note: '负数去掉符号变成正数。' },
      { label: '小数 3.5 → 3.5', type: 'ok', values: { number: '3.5' }, expect: '3.5', note: 'ABS 只去符号，不动小数位。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: 'ABS 只认数字，文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default absEntry;
