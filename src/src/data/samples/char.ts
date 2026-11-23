import type { FunctionEntry } from '@/types';

/** CHAR · 数字转字符（text 类 B5 批次） */

const TSV = '代码\t含义\n10\t换行\n9\t制表符\n65\t字母A';

const charEntry: FunctionEntry = {
  id: 'char',
  enName: 'CHAR',
  zhName: '数字转字符',
  zhCommon: ['CHAR', '数字转字符', '字符代码'],
  alias: ['ASCII转字符', '代码转字符', '生成换行符'],
  category: 'text',
  abbr: 'szzzf',
  pinyin: 'shuzizhuanzifu',
  keywords: ['CHAR', '数字转字符', 'ASCII', '换行符', 'CHAR(10)', '制表符'],
  difficulty: 3,
  usageLevel: 25,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '按字符代码（1–255）返回对应的字符',
  summary:
    'CHAR 是 CODE 的反向操作。它最实用的场景是**生成特殊字符**，尤其是 CHAR(10)（换行）与 CHAR(9)（制表符）——在单元格内强制换行、拼接多行地址时离不开它。注意：Windows 版 Excel 用的是 ANSI/Windows-1252 字符集，1–31 是控制字符，32–126 是可打印 ASCII，128–255 是扩展字符。',
  syntax: {
    patternCn: '=CHAR(数字)',
    patternEn: '=CHAR(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '字符代码，1 到 255 之间的整数。',
        accepts: '1–255 的整数、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 超出 1–255 会报 #VALUE!；小数会被截尾取整。',
        example: '10',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该代码对应的字符；代码超出 1–255 返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：单元格内强制换行',
      scene: '把省市区拼成多行显示的地址。',
      dataTsv: '省\t市\t区\n广东\t深圳\t南山',
      dataAnchor: 'A1',
      formula: '=A2&CHAR(10)&B2&CHAR(10)&C2',
      result: '广东 / 深圳 / 南山（三行显示）',
      explanation:
        'CHAR(10) 是换行符。⚠️ 必须把单元格设为「自动换行」才能看到换行效果，否则会显示成小方块。',
    },
    {
      title: '示例 2：用换行符合并列表',
      scene: '把一列名字合并成一个多行文本块。',
      dataTsv: '姓名\n张三\n李四\n王五',
      dataAnchor: 'A1',
      formula: '=TEXTJOIN(CHAR(10),TRUE,A2:A4)',
      result: '张三 / 李四 / 王五（多行）',
      explanation: 'TEXTJOIN 的分隔符可以是 CHAR(10)，比逐个拼接清爽。同样需要开启自动换行。',
    },
    {
      title: '示例 3：常用代码速查',
      scene: '几个高频代码的含义。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=CHAR(A2)',
      result: '10 → 换行符；9 → 制表符；65 → A',
      explanation: '65–90 是大写 A–Z，97–122 是小写 a–z，48–57 是数字 0–9。',
    },
  ],
  pitfalls: [
    {
      title: '用了 CHAR(10) 却看不到换行',
      reason: '单元格没开启「自动换行」时，换行符会显示成小方块或不可见字符。',
      fix: '选中单元格 → 开始选项卡 → 自动换行。',
      level: 'high',
    },
    {
      title: '代码超出 1–255',
      reason: 'CHAR 只支持 1–255 的范围。',
      fix: '需要 Unicode 字符（如 emoji、中文特殊符号）请改用 UNICHAR。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '跨平台字符集差异',
      reason: 'Windows 与 macOS 版 Excel 的 128–255 区间字符可能不同，换电脑打开会变样。',
      fix: '涉及扩展字符时尽量用 UNICHAR（Unicode 统一编码），可避免跨平台差异。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'code',
      kind: 'companion',
      why: 'CODE 是 CHAR 的反向操作（字符 → 代码），两者互为逆运算。',
    },
    {
      id: 'unichar',
      kind: 'alternative',
      why: '需要 Unicode 字符（超出 255 或跨平台一致）时用 UNICHAR。',
    },
    {
      id: 'textjoin',
      kind: 'companion',
      why: 'TEXTJOIN 的分隔符常用 CHAR(10) 来实现多行合并。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '65' },
    ],
    template: '=CHAR({number})',
    cases: [
      { label: '默认：码位 65 → A', type: 'ok', values: {}, expect: 'A', note: 'CHAR(65) 返回大写字母 A' },
      { label: '非数字文本 → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: 'CHAR 要求数字' },
      { label: '超出 255 → #VALUE!', type: 'error', values: { number: '999' }, expect: '#VALUE!', note: 'CHAR 仅支持 1..255' },
      { label: '小于 1 → #VALUE!', type: 'error', values: { number: '0' }, expect: '#VALUE!', note: 'CHAR 不接受 0 或负数' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default charEntry;
