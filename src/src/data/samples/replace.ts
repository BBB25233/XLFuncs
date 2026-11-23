import type { FunctionEntry } from '@/types';

/** REPLACE · 按位置替换（text 类 B5 批次） */

const TSV = '手机号\n13812345678\n13900001111\n13722223333';

const replaceEntry: FunctionEntry = {
  id: 'replace',
  enName: 'REPLACE',
  zhName: '按位置替换',
  zhCommon: ['按位置替换', 'REPLACE', '替换指定位置'],
  alias: ['替换第几位起', '按字符数替换', '位置替换'],
  category: 'text',
  abbr: 'awzth',
  pinyin: 'anweizhitihuan',
  keywords: ['REPLACE', '按位置替换', '脱敏', '替换第几位', '字符数'],
  difficulty: 3,
  usageLevel: 28,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '从第几个字符开始，替换掉指定个数的字符',
  summary:
    'REPLACE 按**位置**替换：告诉它「从第几位开始、替换几个字符、换成什么」。它不管内容是什么，只看位置，所以最适合格式固定的数据脱敏——手机号中间四位打星、身份证隐藏出生日期。如果替换规则依赖**内容**（比如把所有「有限公司」换成「有限责任公司」），那该用 SUBSTITUTE。',
  syntax: {
    patternCn: '=REPLACE(原文本, 开始位置, 替换个数, 新文本)',
    patternEn: '=REPLACE(old_text, start_num, num_chars, new_text)',
    args: [
      {
        key: 'old_text',
        zh: '原文本',
        en: 'old_text',
        required: true,
        desc: '要做替换的原始文本。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '常配合 LEN 动态计算位置。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'start_num',
        zh: '开始位置',
        en: 'start_num',
        required: true,
        desc: '从第几个字符开始替换（从 1 开始计数）。',
        accepts: '正整数。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '⚠️ 小于 1 会报 #VALUE!；超过文本长度则变成「追加」。',
        example: '4',
        pitfallRank: 1,
      },
      {
        key: 'num_chars',
        zh: '替换个数',
        en: 'num_chars',
        required: true,
        desc: '要替换掉多少个字符；写 0 表示纯插入。',
        accepts: '非负整数。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '写 0 时相当于在该位置插入新文本，不删除任何原字符。',
        example: '4',
      },
      {
        key: 'new_text',
        zh: '新文本',
        en: 'new_text',
        required: true,
        desc: '要替换成的内容；写 "" 等于删除。',
        accepts: '带引号的文字、单元格引用。',
        ifOmitted: '四个参数都必填，省略公式无法成立。',
        tip: '写空引号 "" 就是删除指定位置的字符。',
        example: '"****"',
      },
    ],
  },
  returnValue: '返回替换后的文本；start_num < 1 或 num_chars < 0 返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：手机号中间四位打星（脱敏）',
      scene: '导出的客户手机号要看但不能全展示，需脱敏。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=REPLACE(A2,4,4,"****")',
      result: '138****5678；下拉得 139****1111、137****3333',
      explanation: '从第 4 位开始、替换 4 个字符为 ****，前三位和后四位保留。这是最经典的脱敏写法。',
    },
    {
      title: '示例 2：num_chars 写 0 实现插入',
      scene: '想在指定位置插入内容而不删除原有字符。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=REPLACE(A2,1,0,"+86")',
      result: '+8613812345678',
      explanation: '替换个数为 0 → 只插入不删除，得到带国际区号的号码。',
    },
    {
      title: '示例 3：删除指定位置的字符',
      scene: '编码里固定位置多了一位校验码，要去掉。',
      dataTsv: '编码\nAB-01X\nCD-02X',
      dataAnchor: 'A1',
      formula: '=REPLACE(A2,6,1,"")',
      result: 'AB-01；CD-02',
      explanation: '新文本写空引号 "" 即为删除第 6 位开始的 1 个字符。',
    },
  ],
  pitfalls: [
    {
      title: '与 SUBSTITUTE 的适用场景混淆',
      reason: 'REPLACE 按**位置**、SUBSTITUTE 按**内容**。用 REPLACE 去替换「某个词」会因位置变动而错乱。',
      fix: '格式固定、按位置脱敏用 REPLACE；按内容替换词语用 SUBSTITUTE。',
      level: 'high',
    },
    {
      title: 'start_num 传 0 或负数',
      reason: '位置从 1 开始计数，小于 1 无意义。',
      fix: '确保 start_num ≥ 1；不确定时配合 FIND/SEARCH 动态定位。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '中文与全角字符的计数',
      reason: 'REPLACE 按「字符」计数，一个汉字/全角字符算 1 个，与字节数无关（区别于 REPLACEB）。',
      fix: '中文场景直接按可见字符数计数即可；需要按字节处理才用 REPLACEB。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'substitute',
      kind: 'confusable',
      why: 'SUBSTITUTE 按内容替换（指定第几次出现）、REPLACE 按位置替换，是文本替换里最容易用错的一对。',
    },
    {
      id: 'mid',
      kind: 'companion',
      why: 'MID 按位置取值，与 REPLACE 的按位置思路一致，可配合定位。',
    },
    {
      id: 'replaceb',
      kind: 'companion',
      why: 'REPLACEB 是按字节计数的版本，处理双字节字符时使用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'old_text', label: '原文', type: 'text', default: '"abcdef"' },
      { key: 'start_num', label: '起始位置', type: 'number', default: '2' },
      { key: 'num_chars', label: '长度', type: 'number', default: '3' },
      { key: 'new_text', label: '新文本', type: 'text', default: '"XY"' },
    ],
    template: '=REPLACE({old_text},{start_num},{num_chars},{new_text})',
    cases: [
      { label: '默认：从位置2起替换3个字符为 XY', type: 'ok', values: {}, expect: 'aXYef', note: 'REPLACE("abcdef",2,3,"XY") = aXYef' },
      { label: '起始位置 <1 → #VALUE!', type: 'error', values: { start_num: '0' }, expect: '#VALUE!', note: '起始位置必须 >=1' },
      { label: '起始位置超长 → #VALUE!', type: 'error', values: { start_num: '99' }, expect: '#VALUE!', note: '起始位置超出原文长度' },
      { label: '长度为负 → #VALUE!', type: 'error', values: { num_chars: '-1' }, expect: '#VALUE!', note: '长度不能为负' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default replaceEntry;
