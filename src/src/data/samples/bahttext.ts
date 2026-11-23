import type { FunctionEntry } from '@/types';

/** BAHTTEXT · 泰铢金额转泰文（text 类 B5 批次） */

const TSV = '金额\t说明\n1234.5\t正数\n1\t整数\n25.75\t带小数';

const bahttextEntry: FunctionEntry = {
  id: 'bahttext',
  enName: 'BAHTTEXT',
  zhName: '泰铢金额转泰文',
  zhCommon: ['BAHTTEXT', '泰铢大写', '泰文金额'],
  alias: ['泰文金额', '泰铢文本', 'baht'],
  category: 'text',
  abbr: 'tzjeztw',
  pinyin: 'taizhujinezhuantaiwen',
  keywords: ['BAHTTEXT', '泰铢', '泰文', '金额大写', '泰语'],
  difficulty: 3,
  usageLevel: 3,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: '这是 Excel 内置的泰语本地化函数，输出为泰文读音（如 หนึ่งพันสองร้อยสามสิบสี่บาทห้าสตางค์）。',
  },
  oneLiner: '把数字金额按泰铢（baht）写成泰文大写金额文本',
  summary:
    'BAHTTEXT 是 Excel 的泰语本地化函数：给定数字，返回对应的泰文金额读法（baht 铢 / satang 萨当）。它专用于泰语场景，中文用户几乎用不到，但属于「文本」类且无遗漏收录。结果纯文本，不参与计算。',
  syntax: {
    patternCn: '=BAHTTEXT(数值)',
    patternEn: '=BAHTTEXT(number)',
    args: [
      {
        key: 'number',
        zh: '数值',
        en: 'number',
        required: true,
        desc: '要转换成泰文金额的数字（代表泰铢）。',
        accepts: '数字、含数字的单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 输出是泰文，且按泰铢/萨当单位朗读。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回泰文金额读法的文本字符串（如「หนึ่งพันสองร้อยสามสิบสี่บาทห้าสตางค์」）。',
  examples: [
    {
      title: '示例 1：整数金额',
      scene: '把 1 铢写成泰文。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=BAHTTEXT(A3)',
      result: 'หนึ่งบาทถ้วน（泰文：一铢整）',
      explanation: '整数只读出铢，不出现萨当。',
    },
    {
      title: '示例 2：带小数的金额',
      scene: '1,234.5 铢的泰文读法。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=BAHTTEXT(A2)',
      result: 'หนึ่งพันสองร้อยสามสิบสี่บาทห้าสตางค์',
      explanation: '小数点后两位对应萨当（satang），自动按泰语读数规则拼读。',
    },
  ],
  pitfalls: [
    {
      title: '在中文环境看不懂输出',
      reason: 'BAHTTEXT 是泰语本地化函数，输出为泰文而非中文。',
      fix: '中文金额大写请用自定义格式或 TEXT，不要指望 BAHTTEXT 出中文。',
      level: 'high',
    },
    {
      title: '结果是文本不能计算',
      reason: '泰文金额是文本，无法再参与数学运算。',
      fix: '计算用原始数字列，展示才用 BAHTTEXT。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'dollar',
      kind: 'confusable',
      why: 'DOLLAR 是货币格式化文本（带符号），BAHTTEXT 是本地化金额读数。',
    },
    {
      id: 'numbervalue',
      kind: 'companion',
      why: 'NUMBERVALUE 是把本地化文本转回数字的方向操作之一。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '1234.5' },
    ],
    template: '=BAHTTEXT({number})',
    cases: [
      { label: '默认：1234.5 泰铢转写', type: 'ok', values: {}, expect: 'หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์', note: 'BAHTTEXT 把金额写成泰语（基础实现）' },
      { label: '数字带引号文本 → #VALUE!', type: 'error', values: { number: '"abc"' }, expect: '#VALUE!', note: '文本不能当数字' },
      { label: '数字非数字 → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '数字参数必须可解析为数字' },
      { label: '空数字 → #VALUE!', type: 'error', values: { number: '' }, expect: '#VALUE!', note: '缺少数字参数' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default bahttextEntry;
