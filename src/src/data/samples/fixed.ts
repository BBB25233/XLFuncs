import type { FunctionEntry } from '@/types';

/** FIXED · 按指定小数位转文本（text 类 B5 批次） */

const TSV = '数值\t说明\n1234.567\t正数\n-1234.567\t负数\n12345.6\t含千分位';

const fixedEntry: FunctionEntry = {
  id: 'fixed',
  enName: 'FIXED',
  zhName: '固定小数位文本',
  zhCommon: ['FIXED', '固定小数', '四舍五入文本'],
  alias: ['小数格式化', '转文本带千分位', 'FIXED函数'],
  category: 'text',
  abbr: 'gdxswwb',
  pinyin: 'gudingxiaoshuweiwenben',
  keywords: ['FIXED', '小数', '四舍五入', '千分位', '格式化', '转文本'],
  difficulty: 2,
  usageLevel: 22,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '与 DOLLAR 不同，FIXED 不带货币符号，且可关闭千分位。',
  },
  oneLiner: '把数字按指定小数位四舍五入并转成文本，可控制千分位',
  summary:
    'FIXED 把数字转成文本，按指定位数四舍五入，默认带千分位分隔符；第三个参数 no_commas 设为 TRUE 可去掉千分位。它和 DOLLAR 的最大区别是：FIXED 不带货币符号、且能关千分位，更通用。结果仍是文本，不能直接参与计算。',
  syntax: {
    patternCn: '=FIXED(数值, [小数位数], [不显示千分位])',
    patternEn: '=FIXED(number, [decimals], [no_commas])',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '要转换的数值。',
        accepts: '数字、含数字的单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 结果是文本，不能直接再拿来做加减。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'decimals',
        zh: '小数位数',
        en: 'decimals',
        required: false,
        desc: '保留的小数位数，四舍五入处理。',
        accepts: '整数。',
        ifOmitted: '默认 2 位。',
        example: '1',
        pitfallRank: 2,
      },
      {
        key: 'no_commas',
        zh: '不显示千分位',
        en: 'no_commas',
        required: false,
        desc: 'TRUE 时不显示千分位；FALSE 或省略则显示。',
        accepts: 'TRUE / FALSE、逻辑值。',
        ifOmitted: '默认 FALSE（显示千分位）。',
        example: 'TRUE',
        pitfallRank: 3,
      },
    ],
  },
  returnValue: '返回格式化后的文本字符串，不再是数字。',
  examples: [
    {
      title: '示例 1：保留 1 位小数并带千分位',
      scene: '想在文字里写「1,234.6」。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FIXED(A2,1)',
      result: '1,234.6',
      explanation: '默认显示千分位，按 1 位小数四舍五入。',
    },
    {
      title: '示例 2：关闭千分位',
      scene: '不需要逗号分隔时（如生成编号）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FIXED(A3,2,TRUE)',
      result: '12345.60',
      explanation: '第 3 个参数 TRUE 去掉千分位，12345.6 补零成 12345.60。',
    },
    {
      title: '示例 3：负数与 DOLLAR 的区别',
      scene: '想格式化数字但不带 ¥ 符号。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=FIXED(A3)',
      result: '-1,234.57',
      explanation: 'FIXED 只负责数字格式，不加货币符号，比 DOLLAR 更通用。',
    },
  ],
  pitfalls: [
    {
      title: '转完不能再计算',
      reason: 'FIXED 返回文本，带逗号/小数点的文本无法参与运算。',
      fix: '保留原数字列做计算，只在展示层用 FIXED；或用「设置单元格格式」。',
      level: 'high',
    },
    {
      title: '第 3 参数传了数字 1 当 TRUE',
      reason: 'no_commas 要的是逻辑值；传非 0 数字虽常为 TRUE，但语义混乱易错。',
      fix: '明确写 TRUE / FALSE，不要用 1 / 0 代替。',
      level: 'low',
    },
    {
      title: '小数位四舍五入而非截断',
      reason: 'FIXED 按标准四舍五入，不会直接砍尾。',
      fix: '要截断先 ROUNDDOWN/TRUNC 再套 FIXED。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'dollar',
      kind: 'confusable',
      why: 'DOLLAR 带货币符号，FIXED 不带且能关千分位。',
    },
    {
      id: 'text',
      kind: 'alternative',
      why: 'TEXT 可自定义任意格式，比 FIXED 灵活。',
    },
    {
      id: 'value',
      kind: 'companion',
      why: 'VALUE 可把纯数字文本（无符号）转回数值。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '1234.567' },
      { key: 'decimals', label: '小数位', type: 'number', default: '2' },
      { key: 'no_commas', label: '无千分位', type: 'select', default: 'FALSE', options: [{ label: 'TRUE', value: 'TRUE' }, { label: 'FALSE', value: 'FALSE' }] },
    ],
    template: '=FIXED({number},{decimals},{no_commas})',
    cases: [
      { label: '默认：保留2位并带千分位', type: 'ok', values: {}, expect: '1,234.57', note: 'FIXED 按小数位四舍五入' },
      { label: '数字非数字 → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '数字参数必须可解析为数字' },
      { label: '小数位超范围 → #VALUE!', type: 'error', values: { decimals: '200' }, expect: '#VALUE!', note: '小数位须在 -10..127' },
      { label: '小数位非数字 → #VALUE!', type: 'error', values: { decimals: 'xyz' }, expect: '#VALUE!', note: '小数位必须是整数' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default fixedEntry;
