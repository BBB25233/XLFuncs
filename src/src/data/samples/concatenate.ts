import type { FunctionEntry } from '@/types';

/** CONCATENATE · 老式合并文本（text 类 B5 批次） */

const TSV = '省\t市\t区\n广东\t深圳\t南山\n江苏\t南京\t鼓楼';

const concatenateEntry: FunctionEntry = {
  id: 'concatenate',
  enName: 'CONCATENATE',
  zhName: '老式合并文本',
  zhCommon: ['CONCATENATE', '合并文本', '拼接'],
  alias: ['老版拼接', '字符串连接', '&函数版'],
  category: 'text',
  abbr: 'lshbwb',
  pinyin: 'laoshihebingwenben',
  keywords: ['CONCATENATE', '合并', '拼接', '连接', '旧版', '&运算符'],
  difficulty: 1,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '为兼容旧工作簿保留；新公式建议用 CONCAT 或 & 运算符。',
  },
  oneLiner: '把多个单元格或文字拼成一串（老版本，不支持区域）',
  summary:
    'CONCATENATE 是最经典的文本拼接函数，全版本可用。它和 CONCAT 的区别只有两点：① **不支持直接给区域**（必须一格一格列出来）；② 名字更长。除此之外行为一致、都没有分隔符。现在的建议是：新表直接用 `&` 运算符（=A2&B2，最短）或 CONCAT；只有在需要兼容很旧的 Excel、或维护老文件时才用它。',
  syntax: {
    patternCn: '=CONCATENATE(文本1, [文本2], …)',
    patternEn: '=CONCATENATE(text1, [text2], …)',
    args: [
      {
        key: 'text1',
        zh: '文本1',
        en: 'text1',
        required: true,
        desc: '第一段要拼接的内容。',
        accepts: '文字、数字、单元格引用（**不支持区域**）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 不支持 A2:C2 这种区域写法，必须逐个列出。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'text2',
        zh: '文本2',
        en: 'text2',
        required: false,
        desc: '后续要拼接的内容，可继续追加（最多 255 个参数）。',
        accepts: '同「文本1」。',
        ifOmitted: '不写就只有第一段。',
        tip: '参数多到一定程度，改用 & 或 CONCAT 更清爽。',
        example: 'B2',
      },
    ],
  },
  returnValue: '返回拼接后的文本。',
  examples: [
    {
      title: '示例 1：拼接省市区成完整地址',
      scene: '地址被拆成三列，要合成一列完整地址。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CONCATENATE(A2,B2,C2)',
      result: '广东深圳南山；下拉得 江苏南京鼓楼',
      explanation: '逐格列出要拼接的单元格。中间不会自动加分隔符，需要的话手动插入 =CONCATENATE(A2,"省",B2,"市",C2,"区")。',
    },
    {
      title: '示例 2：等价的 & 写法（更短）',
      scene: '同样的结果，用运算符写更简洁。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=A2&B2&C2',
      result: '广东深圳南山（与 CONCATENATE 完全一致）',
      explanation: '& 运算符全版本可用且写法最短，日常拼接首推它。',
    },
    {
      title: '示例 3：给区域会报错或结果异常',
      scene: '想偷懒框选 A2:C2 整块区域。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CONCATENATE(A2:C2)',
      result: '结果异常/报错（CONCATENATE 不接受区域参数）',
      explanation: '这是它相对 CONCAT 的主要劣势。需要拼区域请改用 CONCAT(A2:C2) 或 TEXTJOIN。',
    },
  ],
  pitfalls: [
    {
      title: '给它传区域参数',
      reason: 'CONCATENATE 只接受单个单元格或字面量，不支持 A2:C2 这种区域。',
      fix: '改成 CONCAT(A2:C2)、TEXTJOIN，或逐格列出。',
      level: 'high',
    },
    {
      title: '拼接日期变成序列号',
      reason: '日期在 Excel 里本质是数字，直接拼接会显示 45000 这类序列号。',
      fix: '先用 TEXT 格式化：=CONCATENATE(A2,TEXT(B2,"yyyy-mm-dd"))。',
      level: 'high',
    },
    {
      title: '参数过多导致公式难以维护',
      reason: '拼接十几段时公式会非常长，且没有分隔符支持。',
      fix: '改用 TEXTJOIN（支持分隔符与忽略空值），公式会短很多。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'concat',
      kind: 'confusable',
      why: 'CONCAT 是 CONCATENATE 的替代品，支持区域、写法更短，但仅 Excel 2019+ 可用。',
    },
    {
      id: 'textjoin',
      kind: 'alternative',
      why: '需要分隔符或要跳过空单元格时用 TEXTJOIN，是三者中功能最完整的。',
    },
    {
      id: 'text',
      kind: 'companion',
      why: '拼接数字/日期前用 TEXT 格式化，避免出现序列号。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text1', label: '文本1', type: 'text', default: '"Hello"' },
      { key: 'text2', label: '文本2', type: 'text', default: '" "' },
      { key: 'text3', label: '文本3', type: 'text', default: '"World"' },
    ],
    template: '=CONCATENATE({text1},{text2},{text3})',
    cases: [
      { label: '默认：三段拼接', type: 'ok', values: {}, expect: 'Hello World', note: 'CONCATENATE（简化 3 参数）拼接文本' },
      { label: '文本1 未加引号 → #NAME?', type: 'error', values: { text1: 'Hello' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '文本2 未加引号 → #NAME?', type: 'error', values: { text2: 'y' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '文本3 未加引号 → #NAME?', type: 'error', values: { text3: 'World' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default concatenateEntry;
