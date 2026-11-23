import type { FunctionEntry } from '@/types';

/** SWITCH · 多路匹配（logical 类 B8 批次） */

const switchEntry: FunctionEntry = {
  id: 'switch',
  enName: 'SWITCH',
  zhName: '多路匹配',
  zhCommon: [
    'SWITCH',
    '多分支',
    '等值匹配'
  ],
  alias: [
    '多路',
    '分支选择',
    '等值匹配'
  ],
  category: 'logical',
  abbr: 'dlpp',
  pinyin: 'duolupipei',
  keywords: [
    'SWITCH',
    '多分支',
    '分支',
    '匹配'
  ],
  difficulty: 3,
  usageLevel: 18,
  version: {
    min: '2016',
    label: 'Excel 2016（Office 365）起可用',
    notes: 'SWITCH 按表达式与一组值逐一比较，命中即返回对应结果；末尾可放一个默认结果兜底。'
  },
  oneLiner: '按表达式等值匹配返回对应结果',
  summary: 'SWITCH 是「多层 IF 的清爽版」：给一个表达式，然后列出「值1→结果1，值2→结果2…」，命中哪个返回哪个；最后还能放一个默认结果。比嵌套 IF(A1=1,...,A1=2,...) 好读得多。',
  syntax: {
    patternCn: '=SWITCH(表达式,值1,结果1,[值2,结果2,...],[默认结果])',
    patternEn: '=SWITCH(expression,value1,result1,[value2,result2,...],[default])',
    args: [
      {
        key: 'expression',
        zh: '表达式',
        en: 'expression',
        required: true,
        desc: '要判断的值/单元格。',
        accepts: '单元格、公式结果。',
        ifOmitted: '必填。',
        example: 'A2'
      },
      {
        key: 'value',
        zh: '值',
        en: 'value',
        required: true,
        desc: '要匹配的目标值（可与结果成对重复）。',
        accepts: '文本、数字等。',
        ifOmitted: '至少一对值/结果。',
        example: '"优"'
      },
      {
        key: 'result',
        zh: '结果',
        en: 'result',
        required: true,
        desc: '命中该值时返回的内容。',
        accepts: '任意值、公式。',
        ifOmitted: '与值配对的返回。',
        example: '"A"'
      },
      {
        key: 'default',
        zh: '默认结果',
        en: 'default',
        required: false,
        desc: '都不匹配时返回（放在最后，不跟值）。',
        accepts: '任意值。',
        ifOmitted: '省略则无匹配会 #N/A。',
        example: '"其他"'
      }
    ]
  },
  returnValue: '命中值对应的结果；无匹配且无默认则 #N/A。',
  examples: [
    {
      title: '示例 1：等级转字母',
      scene: '把评分档位转成 A/B/C。',
      dataTsv: '等级\n优',
      dataAnchor: 'A1',
      formula: '=SWITCH(A2,"优","A","良","B","中","C","其他")',
      result: 'A',
      explanation: 'A2=优命中第一对，返回 A。'
    },
    {
      title: '示例 2：无默认报错',
      scene: '漏匹配且没默认。',
      dataTsv: '等级\n差',
      dataAnchor: 'A1',
      formula: '=SWITCH(A2,"优","A","良","B")',
      result: '#N/A',
      explanation: '没有「差」的分支也无默认，返回 #N/A。'
    }
  ],
  pitfalls: [
    {
      title: '只能等值匹配',
      reason: 'SWITCH 只做 = 比较，不能写 >60 这种范围。',
      fix: '范围判断用 IFS 或嵌套 IF。',
      level: 'high'
    },
    {
      title: '忘了默认兜底',
      reason: '无默认且未命中就 #N/A。',
      fix: '末尾加一个默认结果。',
      level: 'mid',
      errorCode: '#N/A'
    },
    {
      title: '旧版没这函数',
      reason: 'SWITCH 是 2016/Office 365 才有。',
      fix: '旧版改用 IFS 或 IF。',
      level: 'low',
      errorCode: '#NAME?'
    }
  ],
  related: [
    {
      id: 'if',
      kind: 'companion',
      why: 'SWITCH 是多层 IF 的简洁替代。'
    },
    {
      id: 'ifs',
      kind: 'companion',
      why: 'IFS 做区间判断，SWITCH 做等值判断。'
    },
    {
      id: 'choose',
      kind: 'companion',
      why: 'CHOOSE 按序号取，SWITCH 按值匹配。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      {
        key: 'expression',
        label: '表达式',
        type: 'text',
        default: 'A2',
        placeholder: '如 A2 或 "优"',
        hint: '要判断的值：单元格引用（如 A2）或加引号的文本（如 "优"）、数字。',
      },
      {
        key: 'value1',
        label: '值1',
        type: 'text',
        default: '"优"',
        hint: '与表达式等值匹配的目标值，文本需加引号。',
      },
      {
        key: 'result1',
        label: '结果1',
        type: 'text',
        default: '1',
        hint: '命中值1 时返回的内容。',
      },
      {
        key: 'value2',
        label: '值2',
        type: 'text',
        default: '"良"',
        hint: '第二对匹配值。',
      },
      {
        key: 'result2',
        label: '结果2',
        type: 'text',
        default: '2',
      },
      {
        key: 'value3',
        label: '值3',
        type: 'text',
        default: '"中"',
        hint: '第三对匹配值。',
      },
      {
        key: 'result3',
        label: '结果3',
        type: 'text',
        default: '3',
      },
      {
        key: 'default',
        label: '默认结果',
        type: 'text',
        default: '"其他"',
        hint: '都不匹配时返回；留空则无匹配会 #N/A。',
      },
    ],
    template: '=SWITCH({expression},{value1},{result1},{value2},{result2},{value3},{result3},{default})',
    cases: [
      {
        label: '命中第 1 对 → 1',
        type: 'ok',
        values: { expression: '"优"' },
        expect: '1',
        note: '表达式 "优" 命中 value1，返回 result1 = 1。',
      },
      {
        label: '命中第 2 对 → 2',
        type: 'ok',
        values: { expression: '"良"' },
        expect: '2',
        note: '表达式 "良" 命中 value2，返回 result2 = 2。',
      },
      {
        label: '无匹配走默认 → 其他',
        type: 'ok',
        values: { expression: '"差"' },
        expect: '其他',
        note: '表达式 "差" 未命中任何值，但提供了 default，返回 "其他"。',
      },
      {
        label: '❌ 无匹配且无默认 → #N/A',
        type: 'error',
        values: { expression: '"差"', default: '' },
        expect: '#N/A',
        note: '表达式 "差" 未命中，且 default 留空，SWITCH 报 #N/A。',
      },
      {
        label: '❌ 表达式为空 → #VALUE!',
        type: 'error',
        values: { expression: '' },
        expect: '#VALUE!',
        note: '表达式不能为空，SWITCH 缺少必填参数 → #VALUE!。',
      },
      {
        label: '❌ 表达式文本没加引号 → #NAME?',
        type: 'error',
        values: { expression: '优' },
        expect: '#NAME?',
        note: '优 未加半角双引号，Excel 当成名称查找失败 → #NAME?。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default switchEntry;
