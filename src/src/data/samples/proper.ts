import type { FunctionEntry } from '@/types';

/** PROPER · 首字母大写（text 类 B5 批次） */

const TSV = '原始\t\nzhang san\t\nLI SI\t\nwang wu\t';

const properEntry: FunctionEntry = {
  id: 'proper',
  enName: 'PROPER',
  zhName: '首字母大写',
  zhCommon: ['首字母大写', 'PROPER', '标题化'],
  alias: ['每个词首字母大写', '姓名规范化', 'Title Case'],
  category: 'text',
  abbr: 'szmdx',
  pinyin: 'shouzimudaxie',
  keywords: ['PROPER', '首字母大写', '标题化', '姓名规范', 'TitleCase'],
  difficulty: 2,
  usageLevel: 25,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把每个单词的首字母改成大写、其余改成小写',
  summary:
    'PROPER 会把「zhang san」变成「Zhang San」，适合规范英文人名、地名、标题。它把所有分隔符（空格、连字符、标点）都当作单词边界，所以「O\'BRIEN」会变成「O\'Brien」、「iPhone」会变成「Iphone」——遇到缩写、品牌名、专有名词时要人工复核。中文不受影响。',
  syntax: {
    patternCn: '=PROPER(文本)',
    patternEn: '=PROPER(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要做首字母大写处理的文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '空格、连字符、标点都会被当作单词分界。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回每个单词首字母大写、其余小写后的文本。',
  examples: [
    {
      title: '示例 1：规范英文姓名',
      scene: '导入的英文名大小写混乱，要统一成规范写法。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=PROPER(A2)',
      result: 'Zhang San；下拉得 Li Si、Wang Wu',
      explanation: '每个以空格分隔的词首字母大写、其余小写，格式统一。',
    },
    {
      title: '示例 2：连字符也会被当作分界',
      scene: '处理复姓或带连字符的名字。',
      dataTsv: '原始\nSMITH-JOHN\nmary-jane',
      dataAnchor: 'A1',
      formula: '=PROPER(A2)',
      result: 'Smith-John；Mary-Jane',
      explanation: '连字符后面的字母也会大写——多数情况下正是想要的，但要留意特殊规则。',
    },
    {
      title: '示例 3：缩写与品牌名会被破坏',
      scene: '处理含缩写或特殊拼写的内容。',
      dataTsv: '原始\nO\'BRIEN\niPhone\nUSA',
      dataAnchor: 'A1',
      formula: '=PROPER(A2)',
      result: 'O\'Brien；Iphone；Usa',
      explanation:
        'iP hone 变 Iphone、USA 变 Usa，反而更糟。含缩写/专有名词的数据不要盲目套 PROPER，需人工复核。',
    },
  ],
  pitfalls: [
    {
      title: '缩写词被改成首字母大写而失真',
      reason: 'PROPER 不认识缩写，USA→Usa、IBM→Ibm，反而破坏原意。',
      fix: '含缩写、专有名词、品牌名的数据不要全表套用，转换后人工抽查修正。',
      level: 'high',
    },
    {
      title: '忽略撇号内的大小写规则',
      reason: 'O\'BRIEN 会变成 O\'Brien（正确），但 McDonald 会变成 Mcdonald（错误）。',
      fix: '这类特殊拼写规则需人工处理或配合 SUBSTITUTE 修正。',
      level: 'mid',
    },
    {
      title: '对中文姓名无效',
      reason: '中文没有大小写概念，PROPER 不会有任何改变。',
      fix: '中文数据无需使用；处理中文姓名主要是去空格（TRIM）。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'upper',
      kind: 'confusable',
      why: 'UPPER 全部大写、PROPER 仅首字母大写，用途不同别混用。',
    },
    {
      id: 'lower',
      kind: 'companion',
      why: 'PROPER 本质上先把其余字母转小写再大写首字母，与 LOWER 有关联。',
    },
    {
      id: 'trim',
      kind: 'companion',
      why: '规范姓名时常一起用：=PROPER(TRIM(A2))。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"hello world"' },
    ],
    template: '=PROPER({text})',
    cases: [
      { label: '默认：每个单词首字母大写', type: 'ok', values: {}, expect: 'Hello World', note: '单词首字母大写，其余小写' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'hello' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { text: 'abc' }, expect: '#NAME?', note: '文本必须带引号' },
      { label: '第三处未加引号 → #NAME?', type: 'error', values: { text: 'one two' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default properEntry;
