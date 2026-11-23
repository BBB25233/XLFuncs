import type { FunctionEntry } from '@/types';

/** LOWER · 转小写（text 类 B5 批次） */

const TSV = '邮箱\nZhangSan@Example.COM\nLI.SI@Example.com\nWangWu@EXAMPLE.COM';

const lowerEntry: FunctionEntry = {
  id: 'lower',
  enName: 'LOWER',
  zhName: '转小写',
  zhCommon: ['转小写', 'LOWER', '小写化'],
  alias: ['全部变小写', '字母小写', '统一大小写'],
  category: 'text',
  abbr: 'zxx',
  pinyin: 'zhuanxiaoxie',
  keywords: ['LOWER', '转小写', '小写化', '统一大小写', '邮箱规范化'],
  difficulty: 1,
  usageLevel: 35,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把一段文字里的所有英文字母变成小写',
  summary:
    'LOWER 只影响英文字母，数字、中文、标点都不变。它最常见的用途是**统一大小写后再做匹配**——比如两列邮箱因为大小写不同导致 VLOOKUP 匹配不上，统一转小写就能解决。注意它不会去掉空格（那是 TRIM 的事），也不会改变原单元格（要配合「粘贴为值」才能固化）。',
  syntax: {
    patternCn: '=LOWER(文本)',
    patternEn: '=LOWER(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要转换成小写的文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '只转换英文字母；数字与中文不受影响。',
        example: 'A2',
      },
    ],
  },
  returnValue: '返回全部字母转为小写后的文本。',
  examples: [
    {
      title: '示例 1：统一邮箱大小写',
      scene: '导出的邮箱大小写混乱，要先规范化再比对。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=LOWER(A2)',
      result: 'zhangsan@example.com；下拉得 li.si@example.com、wangwu@example.com',
      explanation: '全部转成小写后，同一邮箱的表达就唯一了，后续匹配/去重才可靠。',
    },
    {
      title: '示例 2：配合 VLOOKUP 解决匹配不上',
      scene: '两表因为大小写不一致导致匹配失败。',
      dataTsv: '编码\t名称\nAB-01\t螺丝\nAB-02\t螺母',
      dataAnchor: 'A1',
      formula: '=VLOOKUP(LOWER(E2),A:B,2,FALSE)',
      result: '把查找值统一转小写后再查，命中率大幅提升',
      explanation:
        '注意：若被查表的编码列大小写也不统一，最好两边都转换（可用辅助列），否则仍会漏。',
    },
    {
      title: '示例 3：中英文混排时只影响英文',
      scene: '确认中文不会受影响。',
      dataTsv: '内容\n订单Order-2024\n客户CustomerA',
      dataAnchor: 'A1',
      formula: '=LOWER(A2)',
      result: '订单order-2024（中文与数字保持不变）',
      explanation: 'LOWER 只处理英文字母，这是它对中文数据安全的的原因。',
    },
  ],
  pitfalls: [
    {
      title: '以为它会去掉空格',
      reason: 'LOWER 只改大小写，不动空格。',
      fix: '要先去空格请用 TRIM，或组合使用 =LOWER(TRIM(A2))。',
      level: 'mid',
    },
    {
      title: '用它来“美化”首字母大写的姓名',
      reason: 'LOWER 会把所有字母变小写，不能实现「首字母大写」。',
      fix: '首字母大写用 PROPER。',
      level: 'mid',
    },
    {
      title: '只转了查找值、没转被查表的列',
      reason: '单边转换解决不了大小写不一致问题，仍会匹配失败。',
      fix: '两边都做规范化（辅助列或统一数据源），确保口径一致。',
      level: 'high',
    },
  ],
  related: [
    {
      id: 'upper',
      kind: 'confusable',
      why: 'UPPER 转大写、LOWER 转小写，方向相反，用错会得到相反的规范化结果。',
    },
    {
      id: 'proper',
      kind: 'alternative',
      why: '需要「每个单词首字母大写」时用 PROPER，而不是 LOWER。',
    },
    {
      id: 'exact',
      kind: 'companion',
      why: '若必须保留大小写信息来核对，用 EXACT 严格比较。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"Hello WORLD 123"' },
    ],
    template: '=LOWER({text})',
    cases: [
      { label: '默认：混合大小写转小写', type: 'ok', values: {}, expect: 'hello world 123', note: '所有英文字母转小写，数字与中文不变' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'Hello WORLD' }, expect: '#NAME?', note: '忘了加引号，Excel 把 Hello 当成名称' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { text: 'Excel' }, expect: '#NAME?', note: '文本型参数必须带半角双引号' },
      { label: '第三处未加引号 → #NAME?', type: 'error', values: { text: 'ABC 123' }, expect: '#NAME?', note: '未加引号的裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default lowerEntry;
