import type { FunctionEntry } from '@/types';

/** T · 返回文本值（text 类 B5 批次） */

const TSV = '项目\t说明\n"2026"\t文本型数字\n2026\t真数字\nExcel\t普通文本';

const tEntry: FunctionEntry = {
  id: 't',
  enName: 'T',
  zhName: '返回文本值',
  zhCommon: ['T', '文本值', '只保留文本'],
  alias: ['取文本', '文本过滤', 'T函数'],
  category: 'text',
  abbr: 'fhwbz',
  pinyin: 'fanhuiwenbenzhi',
  keywords: ['T', '文本值', '只保留文本', '过滤非文本', '表头'],
  difficulty: 4,
  usageLevel: 6,
  version: {
    min: 'all',
    label: '所有版本可用',
    notes: 'T 是早期遗留的兼容性函数，现代 Excel 里几乎总能用更好的写法替代。',
  },
  oneLiner: '参数是文本就原样返回，不是文本（数字/逻辑值/错误值）就返回空文本',
  summary:
    'T 的作用很窄：给它文本，它原样返回；给它任何其他类型（数字、日期、逻辑值、错误值），它返回空字符串 ""。它常被用来「保护」文本不被意外转换，或在旧式数组公式中取表头。注意它不会把数字转成文本——这是很多人对它的最大误解，想要「转成文本」应该用 TEXT 或 VALUETOTEXT。',
  syntax: {
    patternCn: '=T(值)',
    patternEn: '=T(value)',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要检测的值，可以是单元格引用或直接写入的值。',
        accepts: '任意类型：文本、数字、逻辑值、错误值、单元格引用。',
        ifOmitted: '省略参数时行为未定义，请始终传入。',
        tip: '⚠️ 引用区域（如 A1:A10）时，只取该区域左上角第一个单元格。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '参数是文本 → 返回该文本；否则返回空文本 ""。',
  examples: [
    {
      title: '示例 1：区分文本型数字与真数字',
      scene: '想判断 A 列哪些是文本、哪些是数字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=T(A2)',
      result: '2026（A2 是文本）；（空）（A3 是真数字）；Excel（A4 是文本）',
      explanation: '文本原样返回，非文本统一变成空文本 —— 这正是 T 唯一的判定能力。',
    },
    {
      title: '示例 2：拼接时过滤掉数字',
      scene: '想把一行的文本单元格拼起来，同时跳过数字。',
      dataTsv: '姓名\t年龄\t城市\n张三\t28\t北京',
      dataAnchor: 'A1',
      formula: '=T(A2)&T(C2)',
      result: '张三北京',
      explanation: '年龄 28 是数字，T 把它变成空文本，拼接时被自然跳过。',
    },
    {
      title: '示例 3：它不会做类型转换（常见误解）',
      scene: '想把数字 2026 变成文本 "2026"。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=T(A3)',
      result: '（空文本，而不是 "2026"）',
      explanation: 'T 只做「过滤」不做「转换」。要转换请用 =TEXT(A3,"0") 或 =A3&""。',
    },
  ],
  pitfalls: [
    {
      title: '以为 T 能把数字转成文本',
      reason: 'T 的语义是「是文本就返回，否则返回空」，不是类型转换。',
      fix: '要转成文本请用 TEXT(值,"0")，或最简单的 =值&""。',
      level: 'high',
    },
    {
      title: '把 T 当成 ISTEXT 用',
      reason: 'T 返回的是值，不是 TRUE/FALSE；空文本在 IF 里会被当成 FALSE，容易误判。',
      fix: '要判断类型请直接用 ISTEXT(值)，语义清晰且返回逻辑值。',
      level: 'high',
    },
    {
      title: '传入区域时只取左上角',
      reason: 'T 不支持数组/区域运算，只处理引用区域的第一个单元格。',
      fix: '逐单元格引用，或改用 TEXTJOIN/FILTER 等支持区域的现代函数。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'isnumber',
      kind: 'alternative',
      why: 'ISTEXT 直接返回 TRUE/FALSE，做类型判断比 T 清晰得多。',
    },
    {
      id: 'valuetotext',
      kind: 'alternative',
      why: 'VALUETOTEXT 才是真正把任意值转成文本的函数（Microsoft 365）。',
    },
    {
      id: 'text',
      kind: 'companion',
      why: 'TEXT 可以在转文本的同时指定数字格式，实用性远高于 T。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'value', label: '值', type: 'text', default: '"Hello"' },
    ],
    template: '=T({value})',
    cases: [
      { label: '默认：文本原样返回', type: 'ok', values: {}, expect: 'Hello', note: 'T 对文本返回文本本身' },
      { label: '另一文本', type: 'ok', values: { value: '"Excel 2024"' }, expect: 'Excel 2024', note: 'T 返回传入的文本' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { value: 'Hello' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { value: 'Test' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default tEntry;
