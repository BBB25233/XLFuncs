import type { FunctionEntry } from '@/types';

/** CONCAT · 合并文本（text 类 B5 批次） */

const TSV = '姓\t名\n张\t三\n李\t四\n王\t五';

const concatEntry: FunctionEntry = {
  id: 'concat',
  enName: 'CONCAT',
  zhName: '合并文本',
  zhCommon: ['合并文本', 'CONCAT', '拼接'],
  alias: ['字符串连接', '拼成一串', 'CONCATENATE新版'],
  category: 'text',
  abbr: 'hbwb',
  pinyin: 'hebingwenben',
  keywords: ['CONCAT', '合并文本', '拼接', '连接', '字符串合并', '&'],
  difficulty: 1,
  usageLevel: 45,
  version: {
    min: '2019',
    label: 'Excel 2019 / 2021 / Microsoft 365 起可用',
    notes: '它是 CONCATENATE 的替代品；旧版 Excel 请用 CONCATENATE 或 & 运算符。',
  },
  oneLiner: '把多个单元格或文字直接拼成一串（不能加分隔符）',
  summary:
    'CONCAT 就是「把几段文字接在一起」：=CONCAT(A2,B2) 得到「张三」。它比老函数 CONCATENATE 强在**支持整块区域**——=CONCAT(A2:B2) 就能把一整行的各列拼起来，不用一格格点。但它**不能加分隔符**（想用逗号、顿号分隔请改用 TEXTJOIN）。日常最简单的写法其实是用 & 号：=A2&B2。',
  syntax: {
    patternCn: '=CONCAT(文本1, [文本2], …)',
    patternEn: '=CONCAT(text1, [text2], …)',
    args: [
      {
        key: 'text1',
        zh: '文本1',
        en: 'text1',
        required: true,
        desc: '第一段要拼接的内容。',
        accepts: '文字、数字、单元格，或一整块区域（如 A2:B2）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '支持直接给区域，这是它相对 CONCATENATE 的最大改进。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'text2',
        zh: '文本2',
        en: 'text2',
        required: false,
        desc: '后续要拼接的内容，可继续追加。',
        accepts: '同「文本1」。',
        ifOmitted: '不写就只有第一段。',
        tip: '可一直追加，也可直接给一个区域。',
        example: 'B2',
      },
    ],
  },
  returnValue: '返回拼接后的文本；若参数是区域，会按从左到右、从上到下的顺序依次连接。',
  examples: [
    {
      title: '示例 1：把姓和名拼成姓名',
      scene: '姓名被拆成了「姓」「名」两列，要合成一列。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CONCAT(A2,B2)',
      result: '张三；下拉得 李四、王五',
      explanation: '按顺序把两段文字直接接起来，中间不会自动加空格——需要空格要自己写 =CONCAT(A2," ",B2)。',
    },
    {
      title: '示例 2：直接给一整块区域（CONCATENATE 做不到）',
      scene: '一行的多列内容要一次性拼起来。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CONCAT(A2:B2)',
      result: '张三（把 A2、B2 两格按顺序拼起来）',
      explanation: '直接框选区域即可，不必逐格列出。区域较大时这个写法省事很多。',
    },
    {
      title: '示例 3：需要分隔符时改用 TEXTJOIN',
      scene: '想拼成「张-三」这种带分隔符的形式。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TEXTJOIN("-",TRUE,A2,B2)',
      result: '张-三',
      explanation: 'CONCAT 没有分隔符参数，硬要加分隔符就得手动写 =CONCAT(A2,"-",B2)。分隔符场景一律用 TEXTJOIN 更清晰。',
    },
  ],
  pitfalls: [
    {
      title: '以为它会自动加空格或分隔符',
      reason: 'CONCAT 是纯粹的「无缝拼接」，不会在中间补任何字符。',
      fix: '需要分隔符用 TEXTJOIN，或手动插入 =CONCAT(A2,"、",B2)。',
      level: 'high',
    },
    {
      title: '在 Excel 2016 及更早版本中使用',
      reason: 'CONCAT 是 Excel 2019 才加入的函数，旧版返回 #NAME?。',
      fix: '改用 CONCATENATE，或直接用 & 运算符（=A2&B2，全版本可用）。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '拼接数字后丢失格式（如日期变序列号）',
      reason: '直接拼接会把日期/数字按原始值处理，日期会变成 45000 这样的序列号。',
      fix: '先用 TEXT 格式化：=CONCAT(A2,TEXT(B2,"yyyy-mm-dd"))。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'concatenate',
      kind: 'confusable',
      why: 'CONCATENATE 是老版本，不支持区域；CONCAT 是它的替代品，用法几乎相同但更强。',
    },
    {
      id: 'textjoin',
      kind: 'alternative',
      why: '需要分隔符、或想跳过空单元格时用 TEXTJOIN，功能比 CONCAT 完整。',
    },
    {
      id: 'text',
      kind: 'companion',
      why: '拼接数字/日期前先用 TEXT 格式化，避免出现序列号或多余小数。',
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
    template: '=CONCAT({text1},{text2},{text3})',
    cases: [
      { label: '默认：三段拼接', type: 'ok', values: {}, expect: 'Hello World', note: 'CONCAT（简化 3 参数）拼接文本' },
      { label: '文本1 未加引号 → #NAME?', type: 'error', values: { text1: 'Hello' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '文本2 未加引号 → #NAME?', type: 'error', values: { text2: 'x' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '文本3 未加引号 → #NAME?', type: 'error', values: { text3: 'World' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default concatEntry;
