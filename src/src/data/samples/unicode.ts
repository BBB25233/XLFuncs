import type { FunctionEntry } from '@/types';

/** UNICODE · 字符转 Unicode 码位（text 类 B5 批次） */

const TSV = '字符\t说明\n★\t五角星\n中\t中文汉字\n😀\t笑脸emoji';

const unicodeEntry: FunctionEntry = {
  id: 'unicode',
  enName: 'UNICODE',
  zhName: '字符转码值',
  zhCommon: ['UNICODE', 'Unicode码位', '字符码位'],
  alias: ['字符转数字', '取码位', '字符编码'],
  category: 'text',
  abbr: 'zfzmz',
  pinyin: 'zifuzhuanmazhi',
  keywords: ['UNICODE', '码位', 'Unicode', '字符编码', '码点', '取码'],
  difficulty: 3,
  usageLevel: 14,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: 'CODE 只支持系统字符集（通常 1–255），UNICODE 覆盖全部 Unicode 且跨平台一致。',
  },
  oneLiner: '返回文本第一个字符的 Unicode 码位（十进制数字）',
  summary:
    'UNICODE 是 CODE 的 Unicode 升级版，也是 UNICHAR 的逆运算：给它一个字符，它返回该字符的十进制码位。只取第一个字符，后面的字符会被忽略，所以常配合 MID 逐字拆解。典型用途：判断字符类别（如码位 > 127 即非 ASCII）、查字符编码、驱动 UNICHAR 反向生成符号。',
  syntax: {
    patternCn: '=UNICODE(文本)',
    patternEn: '=UNICODE(text)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要查询码位的文本。只取第一个字符。',
        accepts: '文本字符串、单元格引用。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '⚠️ 只返回第一个字符的码位；要取第 N 个字符请用 UNICODE(MID(文本,N,1))。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回第一个字符的 Unicode 码位（十进制整数）；空文本返回 #VALUE!。',
  examples: [
    {
      title: '示例 1：查询常见字符的码位',
      scene: '想知道某个符号的 Unicode 码位，好拿去给 UNICHAR 用。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=UNICODE(A2)',
      result: '9733；20013；128512',
      explanation: '★ 是 9733、中是 20013、emoji 😀 是 128512。拿到码位就能用 UNICHAR 反向生成。',
    },
    {
      title: '示例 2：逐字拆解码位（配合 MID）',
      scene: '想把一个词里每个字符的码位都列出来。',
      dataTsv: '词\nExcel',
      dataAnchor: 'A1',
      formula: '=UNICODE(MID($A$2,ROW(A1),1))',
      result: '向下填充依次得到 69 / 120 / 99 / 101 / 108',
      explanation: 'MID 逐个取出字符，UNICODE 转成码位，ROW(A1) 提供递增的位置序号。',
    },
    {
      title: '示例 3：判断是否为中文字符',
      scene: '想筛出包含中文的行（中文码位集中在 19968–40959）。',
      dataTsv: '内容\n订单A\n订单B\nOrder',
      dataAnchor: 'A1',
      formula: '=IF(AND(UNICODE(A2)>=19968,UNICODE(A2)<=40959),"中文","非中文")',
      result: '中文；中文；非中文',
      explanation: '常用汉字位于 U+4E00–U+9FFF（即 19968–40959）。注意这只判断首字符。',
    },
  ],
  pitfalls: [
    {
      title: '以为它会返回整串文本的码位',
      reason: 'UNICODE 只处理第一个字符，多字符文本后面的内容被忽略。',
      fix: '要处理整串请配合 MID 逐字取：UNICODE(MID(文本,N,1))。',
      level: 'high',
    },
    {
      title: '与 CODE 的结果对不上',
      reason: 'CODE 依赖系统字符集（ANSI/GBK），UNICODE 用统一 Unicode 编码，两者编码体系不同。',
      fix: '同一份文件里统一用 UNICODE/UNICHAR 一套，不要和 CODE/CHAR 混用。',
      level: 'mid',
    },
    {
      title: '在 Excel 2010 及更早版本中使用',
      reason: 'UNICODE 是 Excel 2013 才加入的。',
      fix: '升级 Excel，或改用 CODE（仅限系统字符集）。',
      level: 'high',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'unichar',
      kind: 'companion',
      why: 'UNICHAR 是 UNICODE 的反向操作（码位 → 字符），两者互为逆运算。',
    },
    {
      id: 'code',
      kind: 'confusable',
      why: 'CODE 依赖系统字符集且只覆盖 1–255，UNICODE 覆盖全 Unicode 且跨平台一致。',
    },
    {
      id: 'mid',
      kind: 'companion',
      why: '要取第 N 个字符的码位，需要 MID 先拆出单字符。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '文本', type: 'text', default: '"€"' },
    ],
    template: '=UNICODE({text})',
    cases: [
      { label: '默认：€ 的码位 → 8364', type: 'ok', values: {}, expect: '8364', note: 'UNICODE("€") 返回 8364' },
      { label: '空文本 → #VALUE!', type: 'error', values: { text: '""' }, expect: '#VALUE!', note: 'UNICODE 不接受空串' },
      { label: '文本未加引号 → #NAME?', type: 'error', values: { text: 'abc' }, expect: '#NAME?', note: '忘了加引号' },
      { label: '另一处未加引号 → #NAME?', type: 'error', values: { text: 'Z' }, expect: '#NAME?', note: '裸词一律 #NAME?' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false,
  },
};

export default unicodeEntry;
