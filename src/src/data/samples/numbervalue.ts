import type { FunctionEntry } from '@/types';

/** NUMBERVALUE · 按指定分隔符把文本转数字（text 类 B5 批次） */

const TSV = '文本\t说明\n1.234,56\t欧式(点千分位逗号小数)\n1,234.56\t英式(逗号千分位点小数)\n1 234,56\t空格千分位';

const numbervalueEntry: FunctionEntry = {
  id: 'numbervalue',
  enName: 'NUMBERVALUE',
  zhName: '文本按分隔符转数字',
  zhCommon: ['NUMBERVALUE', '文本转数字', '本地化转数'],
  alias: ['分隔符转数', '欧式转数', '自定义转数字'],
  category: 'text',
  abbr: 'wbafgfzsz',
  pinyin: 'wenbenanfengefuzhuanshuzi',
  keywords: ['NUMBERVALUE', '文本转数字', '分隔符', '欧式', '千分位', '逗号小数'],
  difficulty: 3,
  usageLevel: 8,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: '解决欧洲格式「1.234,56」这类点逗号颠倒的文本无法用 VALUE 转数的问题。',
  },
  oneLiner: '按你指定的小数/千分位分隔符，把文本数字转成真正的数值',
  summary:
    'NUMBERVALUE 是 VALUE 的增强版：VALUE 只能认当前区域的数字格式，遇到「1.234,56」（欧式：点是千分位、逗号是小数）就报错；NUMBERVALUE 允许你显式指定 decimal_separator 和 group_separator，从而正确解析任何本地化格式。解析失败返回 #VALUE!。Excel 2013 起可用。',
  syntax: {
    patternCn: '=NUMBERVALUE(文本, [小数分隔符], [千分位分隔符])',
    patternEn: '=NUMBERVALUE(text, [decimal_separator], [group_separator])',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要转换的文本数字。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 文本里不能含无法识别的字符，否则返回 #VALUE!。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'decimal_separator',
        zh: '小数分隔符',
        en: 'decimal_separator',
        required: false,
        desc: '指定文本里哪个符号是小数点。',
        accepts: '单个字符，如 "," 或 "."。',
        ifOmitted: '取当前区域设置的小数分隔符。',
        example: '","',
        pitfallRank: 2,
      },
      {
        key: 'group_separator',
        zh: '千分位分隔符',
        en: 'group_separator',
        required: false,
        desc: '指定文本里哪个符号是千分位分隔符。',
        accepts: '单个字符，如 "." 或 " "（空格）。',
        ifOmitted: '取当前区域设置的千位分隔符（可为空）。',
        example: '"."',
        pitfallRank: 3,
      },
    ],
  },
  returnValue: '返回解析后的数值；格式无法识别时返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：解析欧式数字',
      scene: '从欧洲系统导出「1.234,56」，VALUE 报错。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NUMBERVALUE(A2,",",".")',
      result: '1234.56',
      explanation: '明确告诉 Excel：逗号是小数点、点是千分位 → 正确得到 1234.56。',
    },
    {
      title: '示例 2：空格作千分位',
      scene: '文本是「1 234,56」（空格分隔千位）。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NUMBERVALUE(A4,","," ")',
      result: '1234.56',
      explanation: 'group_separator 用空格也能正确解析。',
    },
    {
      title: '示例 3：英式常规格式',
      scene: '文本是「1,234.56」，想稳妥转数。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=NUMBERVALUE(A3,".","")',
      result: '1234.56',
      explanation: '点作小数、不指定千位分隔符（空串），同样得到正确数值。',
    },
  ],
  pitfalls: [
    {
      title: '小数与千分位分隔符指定反了',
      reason: '两个参数顺序容易搞混，导致 1.234,56 被错解成 1.23。',
      fix: '第 2 参是小数分隔符、第 3 参是千分位分隔符，按文本实际写法对应填。',
      level: 'high',
    },
    {
      title: '用 VALUE 去解析欧式文本',
      reason: 'VALUE 只认当前区域格式，遇到颠倒的「点千分位逗号小数」直接报 #VALUE!。',
      fix: '欧式/本地化文本统一用 NUMBERVALUE 并显式指定分隔符。',
      level: 'mid',
    },
    {
      title: '文本含货币符号或字母',
      reason: 'NUMBERVALUE 无法识别 ¥、$ 或单位文字，会返回 #VALUE!。',
      fix: '先用 SUBSTITUTE 清掉符号/单位再转，或配合 TEXT 反向思路清理。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'value',
      kind: 'confusable',
      why: 'VALUE 只能认当前区域格式；NUMBERVALUE 可自定义分隔符，专治本地化文本。',
    },
    {
      id: 'substitute',
      kind: 'companion',
      why: '先用 SUBSTITUTE 去掉符号/单位，NUMBERVALUE 解析更稳。',
    },
    {
      id: 'text',
      kind: 'confusable',
      why: 'TEXT 是数值→文本（格式化），NUMBERVALUE 是文本→数值（解析），方向相反。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"1,234.56"' },
      { key: 'locale', label: '区域', type: 'text', default: '"en-US"' },
    ],
    template: '=NUMBERVALUE({text},{locale})',
    cases: [
      { label: '默认：带千分位文本转数字', type: 'ok', values: {}, expect: '1234.56', note: 'NUMBERVALUE 去掉千分位逗号后转数字' },
      { label: '无法解析的文本 → #VALUE!', type: 'error', values: { text: '"abc"' }, expect: '#VALUE!', note: '文本里混进非数字字符' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'abc' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '空文本 → #VALUE!', type: 'error', values: { text: '""' }, expect: '#VALUE!', note: '空串无法转数字' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default numbervalueEntry;
