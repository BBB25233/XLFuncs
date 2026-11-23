import type { FunctionEntry } from '@/types';

/** DOLLAR · 货币格式文本（text 类 B5 批次） */

const TSV = '金额\t说明\n1234.567\t正数\n-1234.567\t负数\n0.5\t小于1';

const dollarEntry: FunctionEntry = {
  id: 'dollar',
  enName: 'DOLLAR',
  zhName: '货币格式文本',
  zhCommon: ['DOLLAR', '货币格式', '金额转文本'],
  alias: ['货币文本', '金额格式化', '转货币'],
  category: 'text',
  abbr: 'hbgswb',
  pinyin: 'huobigeshiwenben',
  keywords: ['DOLLAR', '货币', '金额', '格式化', '千分位', '转文本'],
  difficulty: 2,
  usageLevel: 20,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '货币符号取自系统区域设置，中文环境下通常显示 ¥。',
  },
  oneLiner: '把数字按货币格式转成文本（自动四舍五入并加千分位）',
  summary:
    'DOLLAR 把数字转成带货币符号的文本，按指定小数位四舍五入、加千分位分隔符，负数默认带负号。它相当于 TEXT(数值,"¥#,##0.00") 的快捷写法，但格式由系统区域设置决定，不能自定义。因为结果是文本，不能再直接参与计算——这是使用它最需要注意的一点。',
  syntax: {
    patternCn: '=DOLLAR(数值, [小数位数])',
    patternEn: '=DOLLAR(number, [decimals])',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '要转换成货币文本的数值。',
        accepts: '数字、含数字的单元格引用、结果为数字的公式。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 传文本型数字会被当文本处理，可能返回 #VALUE!。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'decimals',
        zh: '小数位数',
        en: 'decimals',
        required: false,
        desc: '保留的小数位数，按此位数四舍五入。',
        accepts: '非负整数。',
        ifOmitted: '默认 2 位小数。',
        tip: '⚠️ 负数表示向左舍入（如 -2 舍入到百位）。',
        example: '2',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回货币格式的文本字符串（含货币符号与千分位），不再是数字。',
  examples: [
    {
      title: '示例 1：把金额转成标准货币文本',
      scene: '想在报表标题里写「合计 ¥1,234.57」这种带格式的文字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DOLLAR(A2)',
      result: '¥1,234.57',
      explanation: '默认保留 2 位小数并四舍五入，自动加千分位和货币符号。',
    },
    {
      title: '示例 2：指定小数位数',
      scene: '金额只需要显示到元，不要角分。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DOLLAR(A2,0)',
      result: '¥1,235',
      explanation: '第 2 参数为 0 即不保留小数，同样会四舍五入。',
    },
    {
      title: '示例 3：拼接成完整句子',
      scene: '生成「本月合计：¥1,234.57」这样的说明文字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '="本月合计："&DOLLAR(A2)',
      result: '本月合计：¥1,234.57',
      explanation: 'DOLLAR 的输出本来就是文本，可以直接用 & 拼接。',
    },
  ],
  pitfalls: [
    {
      title: '转完之后不能再计算',
      reason: 'DOLLAR 返回文本，带 ¥ 和逗号的文本无法直接做加减或求和。',
      fix: '保留原始数字列用于计算，只在展示层用 DOLLAR；或用「设置单元格格式」而不是转文本。',
      level: 'high',
    },
    {
      title: '指望它换个货币符号',
      reason: '符号取自系统区域设置，DOLLAR 没有提供指定币种的参数。',
      fix: '要自定义符号请用 TEXT：=TEXT(A2,"$#,##0.00")。',
      level: 'mid',
    },
    {
      title: '小数位数是四舍五入不是截断',
      reason: 'DOLLAR 按标准四舍五入处理，不会直接砍掉多余位数。',
      fix: '要截断请先用 ROUNDDOWN/TRUNC 处理，再套 DOLLAR。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'fixed',
      kind: 'confusable',
      why: 'FIXED 同样把数字转文本并可控制千分位，但不带货币符号。',
    },
    {
      id: 'text',
      kind: 'alternative',
      why: 'TEXT 可以自定义任意数字格式，比 DOLLAR 灵活得多。',
    },
    {
      id: 'value',
      kind: 'companion',
      why: 'VALUE 可以把货币文本（不含符号时）转回数字，是反向操作。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '1234.567' },
      { key: 'decimals', label: '小数位', type: 'number', default: '2' },
    ],
    template: '=DOLLAR({number},{decimals})',
    cases: [
      { label: '默认：货币格式（2 位小数）', type: 'ok', values: {}, expect: '$1,234.57', note: 'DOLLAR 加 $ 与千分位、四舍五入到 2 位' },
      { label: '数字非数字 → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '数字参数必须可解析为数字' },
      { label: '小数位非数字 → #VALUE!', type: 'error', values: { decimals: 'xyz' }, expect: '#VALUE!', note: '小数位必须是整数' },
      { label: '数字带引号文本 → #VALUE!', type: 'error', values: { number: '"xx"' }, expect: '#VALUE!', note: '文本不能当数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default dollarEntry;
