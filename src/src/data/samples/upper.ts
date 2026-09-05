import type { FunctionEntry } from '@/types';

/** UPPER · 转大写（text 类 B5 批次） */

const TSV = 'SKU\nab-01\nab-02\ncd-100';

const upperEntry: FunctionEntry = {
  id: 'upper',
  enName: 'UPPER',
  zhName: '转大写',
  zhCommon: ['转大写', 'UPPER', '大写化'],
  alias: ['全部变大写', '字母大写', '统一大写'],
  category: 'text',
  abbr: 'zdx',
  pinyin: 'zhuandaxie',
  keywords: ['UPPER', '转大写', '大写化', 'SKU', '统一大小写'],
  difficulty: 1,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把一段文字里的所有英文字母变成大写',
  summary:
    'UPPER 与 LOWER 完全对称，只影响英文字母。业务上常用于**规范化编码**（SKU、订单号、车牌号统一大写），或为了视觉突出把标题转成大写。同样要注意：它不去空格、不改数字与中文，也不会改变原单元格内容。',
  syntax: {
    patternCn: '=UPPER(文本)',
    patternEn: '=UPPER(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要转换成大写的文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '只转换英文字母；数字与中文不受影响。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回全部字母转为大写后的文本。',
  examples: [
    {
      title: '示例 1：SKU 编码统一大写',
      scene: '导出的 SKU 大小写不一，要统一成大写规范。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=UPPER(A2)',
      result: 'AB-01；下拉得 AB-02、CD-100',
      explanation: '统一大写后编码表达唯一，便于匹配、去重与打印标签。',
    },
    {
      title: '示例 2：中英混排只影响英文',
      scene: '确认中文内容不会被破坏。',
      dataTsv: '内容\n订单order-2024\n客户customerA',
      dataAnchor: 'A1',
      formula: '=UPPER(A2)',
      result: '订单ORDER-2024（中文与数字不变）',
      explanation: '与 LOWER 一样，只处理英文字母，对中文数据安全。',
    },
    {
      title: '示例 3：与 LOWER 对比（选错方向）',
      scene: '同一份数据两种结果。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LOWER(A2)',
      result: 'ab-01（与 UPPER 的 AB-01 相反）',
      explanation: '规范化方向要全公司统一，否则跨表核对仍会失败。',
    },
  ],
  pitfalls: [
    {
      title: '规范化方向不统一（有的大写有的小写）',
      reason: '一边用 UPPER、一边用 LOWER，跨表核对照样匹配不上。',
      fix: '团队内约定一个方向并全量执行，最好在数据源头就规范化。',
      level: 'high',
    },
    {
      title: '以为它会去掉空格或改中文',
      reason: 'UPPER 只改英文字母大小写。',
      fix: '去空格用 TRIM；中文不受影响无需担心。',
      level: 'mid',
    },
    {
      title: '对含公式的单元格直接套用后结果变化',
      reason: 'UPPER 会转换公式的**显示结果**，可能掩盖上游逻辑。',
      fix: '确认是否需要在源头处理；必要时「粘贴为值」固化结果。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'lower',
      kind: 'confusable',
      why: 'LOWER 转小写、UPPER 转大写，方向相反，规范化时必须统一选择。',
    },
    {
      id: 'proper',
      kind: 'alternative',
      why: '需要「每个单词首字母大写」（如姓名、标题）时用 PROPER。',
    },
    {
      id: 'trim',
      kind: 'companion',
      why: '规范化时通常要一起去掉多余空格：=UPPER(TRIM(A2))。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"hello world"' },
    ],
    template: '=UPPER({text})',
    cases: [
      { label: '默认：转大写', type: 'ok', values: {}, expect: 'HELLO WORLD', note: '所有英文字母转大写' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'hello' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { text: 'Excel' }, expect: '#NAME?', note: '文本必须带引号' },
      { label: '第三处未加引号 → #NAME?', type: 'error', values: { text: 'abc def' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default upperEntry;
