import type { FunctionEntry } from '@/types';

/** ARRAYTOTEXT · 区域/数组转文本（text 类 B5 批次，Microsoft 365） */

const TSV = 'A\tB\n1\t2\n3\t4';

const arraytotextEntry: FunctionEntry = {
  id: 'arraytotext',
  enName: 'ARRAYTOTEXT',
  zhName: '区域转文本串',
  zhCommon: ['ARRAYTOTEXT', '数组转文本', '区域转文本'],
  alias: ['数组转字符串', '二维转文本', 'ARRAYTOTEXT'],
  category: 'text',
  abbr: 'qyzwbc',
  pinyin: 'quyuzhuanwenbenchuan',
  keywords: ['ARRAYTOTEXT', '数组', '区域', '转文本', '365', '二维'],
  difficulty: 4,
  usageLevel: 5,
  version: {
    min: '365',
    label: 'Microsoft 365 / Excel 2021 起可用',
    notes: '与 VALUETOTEXT 同属 365 的「值→文本」函数族，按 format 决定紧凑或严格输出。',
  },
  oneLiner: '把一片区域或数组转成一个文本字符串（紧凑或严格两种格式）',
  summary:
    'ARRAYTOTEXT 把整个区域/数组压成一个文本字符串，便于快照、记录或导出。format=0 是紧凑模式（行内逗号、行间分号，如 "1,2;3,4"）；format=1 是严格模式（加引号、转义，数组结构一目了然）。常配合 TEXTJOIN/LET 做数据导出。',
  syntax: {
    patternCn: '=ARRAYTOTEXT(数组, [格式])',
    patternEn: '=ARRAYTOTEXT(array, [format])',
    args: [
      {
        key: 'array',
        zh: '数组',
        en: 'array',
        required: true,
        desc: '要转换的区域或数组。',
        accepts: '单元格区域、数组常量。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 结果是单个文本，原区域并不会被替换。',
        example: 'A2:B3',
        pitfallRank: 1,
      },
      {
        key: 'format',
        zh: '格式',
        en: 'format',
        required: false,
        desc: '0=紧凑（默认），1=严格（带引号与转义）。',
        accepts: '0 或 1。',
        ifOmitted: '默认 0（紧凑）。',
        example: '1',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回代表该数组的文本字符串。',
  examples: [
    {
      title: '示例 1：紧凑模式（默认）',
      scene: '想把 A2:B3 的 2×2 数组记成一串文字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ARRAYTOTEXT(A2:B3)',
      result: '1,2;3,4',
      explanation: '行内用逗号、行间用分号，紧凑无多余字符。',
    },
    {
      title: '示例 2：严格模式（带引号）',
      scene: '想保留文本与结构，便于程序解析。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=ARRAYTOTEXT(A2:B3,1)',
      result: '{1,2;3,4}（严格模式，文本值会加引号）',
      explanation: 'format=1 输出带花括号、文本加引号，结构更明确。',
    },
  ],
  pitfalls: [
    {
      title: '在旧版 Excel 不可用',
      reason: 'ARRAYTOTEXT 是 365/2021 动态数组函数。',
      fix: '旧版用 TEXTJOIN 逐行拼接近似实现。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '混淆 format 0/1 的输出',
      reason: '紧凑模式不含引号，文本和数字的边界不直观。',
      fix: '需要程序解析时一律用 format=1（严格模式）。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'valuetotext',
      kind: 'companion',
      why: 'VALUETOTEXT 转单值，ARRAYTOTEXT 转整片区域，同属 365「值→文本」族。',
    },
    {
      id: 'textjoin',
      kind: 'confusable',
      why: 'TEXTJOIN 可自定义分隔符合并，ARRAYTOTEXT 是固定格式快照。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'value1', label: '值1', type: 'text', default: '"a"' },
      { key: 'value2', label: '值2', type: 'text', default: '"b"' },
      { key: 'value3', label: '值3', type: 'text', default: '"c"' },
    ],
    template: '=ARRAYTOTEXT({value1},{value2},{value3})',
    cases: [
      { label: '默认：三个值转文本', type: 'ok', values: {}, expect: 'a,b,c', note: 'ARRAYTOTEXT（简化）把数组以逗号拼成文本' },
      { label: '值1 未加引号 → #NAME?', type: 'error', values: { value1: 'a' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '值2 未加引号 → #NAME?', type: 'error', values: { value2: 'b' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '值3 未加引号 → #NAME?', type: 'error', values: { value3: 'c' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default arraytotextEntry;
