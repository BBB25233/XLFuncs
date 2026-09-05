import type { FunctionEntry } from '@/types';

/** VALUETOTEXT · 任意值转文本（text 类 B5 批次，Microsoft 365） */

const TSV = '值\t说明\n1234.5\t数字\nTRUE\t逻辑值\n2026-08-31\t日期';

const valuetotextEntry: FunctionEntry = {
  id: 'valuetotext',
  enName: 'VALUETOTEXT',
  zhName: '任意值转文本',
  zhCommon: ['VALUETOTEXT', '值转文本', '转文本'],
  alias: ['转文本', '值变文本', 'VALUETOTEXT'],
  category: 'text',
  abbr: 'ryzzwb',
  pinyin: 'renyizhizhuanwenben',
  keywords: ['VALUETOTEXT', '转文本', '值', '365', '日期转文本'],
  difficulty: 3,
  usageLevel: 9,
  version: {
    min: '365',
    label: 'Microsoft 365 / Excel 2021 起可用',
    notes: '相比老函数 TEXT，它无需指定格式、且能正确处理错误值/逻辑值/日期而不报错。',
  },
  oneLiner: '把数字、文本、逻辑值、日期甚至错误值统一转成一个可读文本',
  summary:
    'VALUETOTEXT 是 365 的通用「值→文本」函数：不再需要记 TEXT 的格式代码，直接把任何值变成文本。format=0 紧凑（数字不加引号）、format=1 严格（文本/错误加引号）。它比 TEXT 更省心——日期、逻辑值、#N/A 都能转而不崩。和 T 不同，T 只过滤、VALUETOTEXT 才真正转换。',
  syntax: {
    patternCn: '=VALUETOTEXT(值, [格式])',
    patternEn: '=VALUETOTEXT(value, [format])',
    args: [
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '任意要转换的值：数字、文本、逻辑值、日期、错误值。',
        accepts: '单元格引用或直接值。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 日期会被转成序列值或可读串，取决于 format。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'format',
        zh: '格式',
        en: 'format',
        required: false,
        desc: '0=紧凑（默认），1=严格（文本/错误加引号）。',
        accepts: '0 或 1。',
        ifOmitted: '默认 0（紧凑）。',
        example: '0',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回该值的文本表示；错误值也会被转成带引号的可读文本而非真的报错。',
  examples: [
    {
      title: '示例 1：数字与逻辑值转文本',
      scene: '想把各种类型统一变成文本串拼接。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=VALUETOTEXT(A2)',
      result: '1234.5（数字照样成文本）',
      explanation: '数字、逻辑值都被转成文本，便于后续拼接。',
    },
    {
      title: '示例 2：错误值也能转（不崩）',
      scene: '想把 #N/A 当作文字记录，而不是让公式连锁报错。',
      dataTsv: '值\n#N/A',
      dataAnchor: 'A1',
      formula: '=VALUETOTEXT(A2)',
      result: '"#N/A"（严格模式下带引号，公式仍正常返回文本）',
      explanation: 'VALUETOTEXT 把错误值转成可读文本，不会让整条公式失败。',
    },
    {
      title: '示例 3：与 T 的区别',
      scene: '把数字 1234.5 变成文本。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=T(A2)',
      result: '空文本（T 只对文本生效，不转换数字）',
      explanation: '要主动「转换」用 VALUETOTEXT；T 只做过滤，切勿混用。',
    },
  ],
  pitfalls: [
    {
      title: '和 T 搞混',
      reason: 'T 只保留文本、不转换数字；要转换必须用 VALUETOTEXT 或 TEXT。',
      fix: '需要「把值变成文本」用 VALUETOTEXT/TEXT，不要用 T。',
      level: 'high',
    },
    {
      title: '旧版没有该函数',
      reason: 'VALUETOTEXT 是 365/2021 才有。',
      fix: '旧版用 TEXT(值,"0") 或 值&"" 近似实现。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '日期转出的样子不合预期',
      reason: '默认 format=0 可能把日期转成序列号而非「年-月-日」。',
      fix: '要固定日期样子请用 TEXT(日期,"yyyy-mm-dd") 而非 VALUETOTEXT。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 't',
      kind: 'confusable',
      why: 'T 只过滤文本不转换；VALUETOTEXT 才真正把值转文本。',
    },
    {
      id: 'text',
      kind: 'alternative',
      why: 'TEXT 可指定格式（尤其日期），VALUETOTEXT 更省心但格式不可控。',
    },
    {
      id: 'arraytotext',
      kind: 'companion',
      why: 'ARRAYTOTEXT 转整片区域，VALUETOTEXT 转单值，同属 365 值→文本族。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'value', label: '值', type: 'text', default: '"123"' },
    ],
    template: '=VALUETOTEXT({value})',
    cases: [
      { label: '默认：数值文本化', type: 'ok', values: {}, expect: '123', note: 'VALUETOTEXT（简化）把值转成文本展示' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { value: 'abc' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { value: 'Hello' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
      { label: '第三处未加引号 → #NAME?', type: 'error', values: { value: 'test' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default valuetotextEntry;
