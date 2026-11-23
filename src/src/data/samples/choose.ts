import type { FunctionEntry } from '@/types';

/** CHOOSE · 按序号取值（lookup 类 B7 批次） */

const TSV = '序号\t结果\n1\t优\n2\t良\n3\t中\n4\t差';

const chooseEntry: FunctionEntry = {
  id: 'choose',
  enName: 'CHOOSE',
  zhName: '按序号取值',
  zhCommon: ['按序号选', '编号取值', '选择'],
  alias: ['序号选择', '选项取值', '索引取值'],
  category: 'lookup',
  abbr: 'axhqz',
  pinyin: 'anxuhaoquzhi',
  keywords: ['按编号返回', '第几个值', '配合MATCH', '评分映射', 'CHOOSE'],
  difficulty: 2,
  usageLevel: 45,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '中文版 Excel 不翻译这个函数名，输入「按序号取值」只会得到 #NAME?。CHOOSE 像个开关：给一个序号，它从后面一串值里返回第几个。常和 MATCH 搭档，把「匹配到的位置」直接当序号去选文字，比嵌套 IF 清爽。最多 254 个值。',
  },
  oneLiner: '给个序号，从一串选项里返回第几个',
  summary:
    'CHOOSE 的逻辑直白：第一个参数是序号（第几个），后面跟一串候选值，它就返回对应位置那个值。它最经典的用法是和 MATCH 组合——MATCH 算出某个分类排第几，CHOOSE 据此返回对应的中文标签，从而替代一长串嵌套 IF。注意序号必须在 1 到候选项总数之间，否则报 #VALUE!。',
  syntax: {
    patternCn: '=CHOOSE(序号, 值1, 值2, …)',
    patternEn: '=CHOOSE(index_num, value1, [value2], …)',
    args: [
      {
        key: 'index_num',
        zh: '序号',
        en: 'index_num',
        required: true,
        desc: '要返回第几个值，1 表示第一个。',
        accepts: '1~254 的整数；也可以是返回整数的公式（如 MATCH 的结果）。',
        ifOmitted: '必填。',
        tip: '常由 MATCH 算出来，例如 CHOOSE(MATCH(类别,列表,0), "甲","乙","丙")。',
        example: '2',
        pitfallRank: 1,
      },
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '序号为 1 时返回的值，可以是文字、数字、单元格或公式。',
        accepts: '任意值；也支持区域（此时返回整个区域）。',
        ifOmitted: '必填（至少要有一个候选值）。',
        example: '"优"',
      },
      {
        key: 'value2',
        zh: '值2…',
        en: 'value2',
        required: false,
        desc: '序号为 2、3… 时返回的值，可继续罗列到第 254 个。',
        accepts: '任意值。',
        ifOmitted: '可选的后续候选项；最少 1 个、最多 254 个。',
        example: '"良"',
      },
    ],
  },
  returnValue: '返回序号指定的那个候选值；序号小于 1 或大于候选项数则 #VALUE!。',
  examples: [
    {
      title: '示例 1：直接按序号取标签',
      scene: '评分 1~4 对应「优/良/中/差」，想把数字映射成文字。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CHOOSE(2,"优","良","中","差")',
      result: '返回「良」（第 2 个候选）',
      explanation: '序号 2 指向候选列表里的第 2 项「良」。',
    },
    {
      title: '示例 2：配合 MATCH 做分类映射',
      scene: 'A 列是等级文字，想转成对应分值（优=95 良=85 中=70 差=50），不想写嵌套 IF。',
      dataTsv: '等级\n良',
      dataAnchor: 'A1',
      formula: '=CHOOSE(MATCH(A2,{"优","良","中","差"},0),95,85,70,50)',
      result: 'A2 是「良」时返回 85',
      explanation: 'MATCH 算出「良」在第 2 位，CHOOSE 据此返回第 2 个分值 85。比 IF 嵌套更易读、好维护。',
    },
    {
      title: '示例 3：序号越界报错',
      scene: '只有 4 个候选，却传了序号 5。',
      dataTsv: 'x',
      dataAnchor: 'A1',
      formula: '=CHOOSE(5,"优","良","中","差")',
      result: '#VALUE!',
      explanation: '序号 5 超出候选数 4，CHOOSE 没法返回第 5 个，报错。',
    },
  ],
  pitfalls: [
    {
      title: '序号超出候选数量',
      reason: 'CHOOSE 的序号必须在 1 到候选值个数之间。给 0、负数或超过上限，它直接 #VALUE!。',
      fix: '确认序号范围；用 MATCH 时确保查找值在列表内，或用 IFERROR 兜底。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '候选超过 254 个',
      reason: 'CHOOSE 最多接受 254 个值，更多选项会录入失败。',
      fix: '超过 254 个改用 VLOOKUP/XLOOKUP 查一张映射表，而不是堆候选。',
      level: 'mid',
    },
    {
      title: '用 CHOOSE 替代大段 IF 却忘了 MATCH',
      reason: '想按分类映射时，若手动写序号很容易错位；不用 MATCH 自动算序号就失去 CHOOSE 的简洁优势。',
      fix: '把「分类→序号」交给 MATCH，CHOOSE 只负责「序号→值」，两者配合最稳。',
      level: 'low',
    },
  ],
  related: [
    { id: 'match', kind: 'companion', why: 'MATCH 算出位置当序号，CHOOSE 据此取候选值，组合替代嵌套 IF。' },
    { id: 'vlookup', kind: 'alternative', why: '候选很多时，建一张映射表用 VLOOKUP/XLOOKUP 比堆 CHOOSE 候选更省事。' },
    { id: 'index', kind: 'confusable', why: 'INDEX 按坐标取区域里的值，CHOOSE 按序号取一串候选，思路相近但数据源不同。' },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'index_num', label: '序号', type: 'number', default: '2' },
      { key: 'value1', label: '值1', type: 'text', default: '"优"' },
      { key: 'value2', label: '值2', type: 'text', default: '"良"' },
      { key: 'value3', label: '值3', type: 'text', default: '"中"' },
      { key: 'value4', label: '值4', type: 'text', default: '"差"' },
      { key: 'value5', label: '值5', type: 'text', default: '""' },
    ],
    template: '=CHOOSE({index_num},{value1},{value2},{value3},{value4},{value5})',
    cases: [
      { label: '默认：第 2 个候选', type: 'ok', values: {}, expect: '良', note: '序号 2 指向候选列表第 2 项「良」' },
      { label: '第 1 个候选', type: 'ok', values: { index_num: '1' }, expect: '优', note: '序号 1 指向「优」' },
      { label: '序号超出 → #VALUE!', type: 'error', values: { index_num: '6' }, expect: '#VALUE!', note: '只有 4 个有效候选，序号 6 超出范围' },
      { label: '序号为 0 → #VALUE!', type: 'error', values: { index_num: '0' }, expect: '#VALUE!', note: '序号必须 ≥ 1' },
      { label: '序号非数字 → #VALUE!', type: 'error', values: { index_num: 'abc' }, expect: '#VALUE!', note: '序号必须是整数' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default chooseEntry;
