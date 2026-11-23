import type { FunctionEntry } from '@/types';

/** REPT · 重复文本（text 类 B5 批次） */

const TSV = '产品\t评分\nA\t4\nB\t2\nC\t5';

const reptEntry: FunctionEntry = {
  id: 'rept',
  enName: 'REPT',
  zhName: '重复文本',
  zhCommon: ['重复文本', 'REPT', '重复几次'],
  alias: ['复制N次', '填充符号', '星级图'],
  category: 'text',
  abbr: 'cfwb',
  pinyin: 'chongfuwenben',
  keywords: ['REPT', '重复文本', '重复次数', '星级图', '简易图表', '补位'],
  difficulty: 1,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把一段文字重复指定的次数',
  summary:
    'REPT 把文本重复 N 次拼接起来。它最有趣的用法是**在单元格里画简易条形图/星级图**：=REPT("★",B2) 就能把评分变成星星，比插入图表轻量得多。也常用于补位（把编号补到固定长度）。注意重复次数会被截断为整数，且结果总长度不能超过 32767 个字符。',
  syntax: {
    patternCn: '=REPT(文本, 重复次数)',
    patternEn: '=REPT(text, number_times)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要重复的文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '写 "" 会得到空文本（长度为 0）。',
        example: '"★"',
        pitfallRank: 2,
      },
      {
        key: 'number_times',
        zh: '重复次数',
        en: 'number_times',
        required: true,
        desc: '重复多少次；0 到 32767 之间。',
        accepts: '非负整数，或返回整数的公式（常引用单元格）。',
        ifOmitted: '两个参数都必填，省略公式无法成立。',
        tip: '⚠️ 小数会被截尾取整；负数或结果超长会报 #VALUE!。',
        example: 'B2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回重复拼接后的文本；次数为负或结果超过 32767 字符返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：把评分变成星级图',
      scene: '想在表格里直观展示评分，不想插入图表。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=REPT("★",B2)',
      result: '★★★★；★★；★★★★★',
      explanation: '把评分数字变成星星，一眼看出高低。这是 REPT 最实用的技巧。',
    },
    {
      title: '示例 2：做成「满星+空星」的对照',
      scene: '想同时展示得分与总分（如 4/5）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=REPT("★",B2)&REPT("☆",5-B2)',
      result: '★★★★☆；★★☆☆☆；★★★★★',
      explanation: '实心星表示得分、空心星补足到 5 星，用 & 把两段拼起来。',
    },
    {
      title: '示例 3：把编号补成固定长度',
      scene: '编号需要统一成 8 位，不足的前面补 0。',
      dataTsv: '编号\n42\n7\n1234',
      dataAnchor: 'A1',
      formula: '=REPT("0",4-LEN(A2))&A2',
      result: '0042；0007；1234',
      explanation:
        '先算出要补几个 0（4 减去当前长度），重复出来再拼上原编号。补位是 REPT 的另一大用途。',
    },
  ],
  pitfalls: [
    {
      title: '重复次数为负数或结果超长',
      reason: '次数必须 ≥ 0，且结果总长度不得超过 32767 个字符。',
      fix: '用 MAX(0,次数) 兜底；超长场景改用其他方式（如真正的图表）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '传小数次数被静默截断',
      reason: 'REPT 会把次数截尾取整，3.9 次只重复 3 次，不四舍五入。',
      fix: '需要四舍五入时先套 ROUND：=REPT("★",ROUND(B2,0))。',
      level: 'mid',
    },
    {
      title: '把 REPT 的结果当数字用',
      reason: '结果是文本，即使是重复数字（如 "111"）也不能直接参与计算。',
      fix: '需要数值时套 VALUE 或 -- 转换。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'len',
      kind: 'companion',
      why: '补位场景需先用 LEN 计算当前长度，两者常一起出现。',
    },
    {
      id: 'text',
      kind: 'alternative',
      why: '补前导零也可直接用 =TEXT(A2,"0000")，写法更短。',
    },
    {
      id: 'concat',
      kind: 'companion',
      why: '常用 & 或 CONCAT 把 REPT 的结果拼成完整显示串。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"ab"' },
      { key: 'number', label: '次数', type: 'number', default: '3' },
    ],
    template: '=REPT({text},{number})',
    cases: [
      { label: '默认：ab 重复 3 次', type: 'ok', values: {}, expect: 'ababab', note: 'REPT("ab",3) = ababab' },
      { label: '次数非数字 → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '次数必须是数字' },
      { label: '次数为负 → #VALUE!', type: 'error', values: { number: '-2' }, expect: '#VALUE!', note: '次数不能为负' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'ab' }, expect: '#NAME?', note: '忘了加引号' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default reptEntry;
