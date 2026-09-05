import type { FunctionEntry } from '@/types';

/** TEXTSPLIT · 按分隔符拆分成数组（text 类 B5 批次，Microsoft 365） */

const TSV = '文本\t说明\n"苹果,香蕉,橙子"\t逗号分隔\n"北/京/市"\t斜杠分隔';

const textsplitEntry: FunctionEntry = {
  id: 'textsplit',
  enName: 'TEXTSPLIT',
  zhName: '文本按分隔符拆分',
  zhCommon: ['TEXTSPLIT', '拆分文本', '文本分列'],
  alias: ['文本拆分', '分列', '分隔成数组'],
  category: 'text',
  abbr: 'wbafgfcf',
  pinyin: 'wenbenanfengefuchaifen',
  keywords: ['TEXTSPLIT', '拆分', '分隔符', '分列', '数组', '365'],
  difficulty: 4,
  usageLevel: 16,
  version: {
    min: '365',
    label: 'Microsoft 365 / Excel 2021 起可用',
    notes: '动态数组函数，结果会自动溢出到相邻单元格；替代了老式「分列」向导的纯公式写法。',
  },
  oneLiner: '按行/列分隔符把一段文本拆成多行多列的数组（动态溢出）',
  summary:
    'TEXTSPLIT 是 365 的动态数组函数，按列分隔符（和可选的行分隔符）把文本拆成数组并自动溢出。它比 FIND/MID 拼长公式拆字符串简单得多；配合 ignore_empty 可决定是否保留空单元格，match_mode 控制是否忽略大小写，pad_with 指定数组形状不齐时的填充值。是处理 CSV 片段、日志行的利器。',
  syntax: {
    patternCn: '=TEXTSPLIT(文本, 列分隔符, [行分隔符], [忽略空], [匹配模式], [填充值])',
    patternEn: '=TEXTSPLIT(text, col_delimiter, [row_delimiter], [ignore_empty], [match_mode], [pad_with])',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要拆分的源文本。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 结果是数组，会溢出到右侧/下方单元格，确保那里是空的。',
        example: 'A2',
        pitfallRank: 1,
      },
      {
        key: 'col_delimiter',
        zh: '列分隔符',
        en: 'col_delimiter',
        required: true,
        desc: '按此字符在横向（列）切开。',
        accepts: '字符或字符数组（如 {"，",","} 同时支持中英文逗号）。',
        ifOmitted: '这是必填参数。',
        example: '","',
        pitfallRank: 2,
      },
      {
        key: 'row_delimiter',
        zh: '行分隔符',
        en: 'row_delimiter',
        required: false,
        desc: '按此字符在纵向（行）切开，用于同时分行分列。',
        accepts: '单个字符。',
        ifOmitted: '默认只按列拆分（结果是一行）。',
        example: 'CHAR(10)',
        pitfallRank: 3,
      },
    ],
  },
  returnValue: '返回拆分后的数组（溢出到相邻单元格）；分隔符找不到时返回 #N/A。',
  examples: [
    {
      title: '示例 1：按逗号拆成一行多列',
      scene: '把「苹果,香蕉,橙子」拆到三个单元格。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TEXTSPLIT(A2,",")',
      result: '苹果 | 香蕉 | 橙子（横向溢出三格）',
      explanation: '逗号作列分隔符，结果自动往右溢出。',
    },
    {
      title: '示例 2：同时按行、列拆分',
      scene: '文本里有换行（分行）和逗号（分列）。',
      dataTsv: '文本\n"甲,1\n乙,2"',
      dataAnchor: 'A1',
      formula: '=TEXTSPLIT(A2,,",")',
      result: '甲 1 / 乙 2（两行两列）',
      explanation: '省略列分隔符、行分隔符用换行符，实现行列二维拆分。',
    },
    {
      title: '示例 3：中英逗号都支持',
      scene: '数据里混用全角「，」和半角「,」。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=TEXTSPLIT(A2,{"，",","})',
      result: '正确拆出各项',
      explanation: '列分隔符用数组，可一次匹配多种分隔符。',
    },
  ],
  pitfalls: [
    {
      title: '结果溢出区被占用报错 #SPILL!',
      reason: 'TEXTSPLIT 是动态数组，会把结果铺到旁边空单元格；旁边有内容就溢出失败。',
      fix: '清空结果区右侧/下方，或把公式放到空旷区域再引用。',
      level: 'high',
      errorCode: '#SPILL!',
    },
    {
      title: '旧版 Excel 没有这个函数',
      reason: 'TEXTSPLIT 是 365/2021 才有的动态数组函数。',
      fix: '旧版用 FIND/MID 或「数据→分列」向导替代。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '分隔符找不到返回 #N/A',
      reason: '文本里没有指定分隔符时，TEXTSPLIT 返回错误而非原文本。',
      fix: '用 IFERROR 兜底，或先用 SEARCH 判断分隔符是否存在。',
      level: 'mid',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'textjoin',
      kind: 'companion',
      why: 'TEXTJOIN 是 TEXTSPLIT 的逆操作：一个合并、一个拆分。',
    },
    {
      id: 'find',
      kind: 'confusable',
      why: '老版用 FIND+MID 手动拆，TEXTSPLIT 一行搞定。',
    },
    {
      id: 'substitute',
      kind: 'companion',
      why: '拆分前常先用 SUBSTITUTE 把多种分隔符统一成一个。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"a,b;c"' },
      { key: 'col_delim', label: '列分隔符', type: 'text', default: '","' },
      { key: 'row_delim', label: '行分隔符', type: 'text', default: '";"' },
    ],
    template: '=TEXTSPLIT({text},{col_delim},{row_delim})',
    cases: [
      { label: '默认：按逗号/分号拆分', type: 'ok', values: {}, expect: 'a,b,c', note: 'TEXTSPLIT（简化）按分隔符拆成数组再以逗号展示' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'a,b;c' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '列分隔符未加引号 → #NAME?', type: 'error', values: { col_delim: ',' }, expect: '#NAME?', note: '分隔符也是文本，要带引号' },
      { label: '行分隔符未加引号 → #NAME?', type: 'error', values: { row_delim: ';' }, expect: '#NAME?', note: '分隔符也是文本，要带引号' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default textsplitEntry;
