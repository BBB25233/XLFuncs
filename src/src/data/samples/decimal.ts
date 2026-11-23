import type { FunctionEntry } from '@/types';

/**
 * DECIMAL · 任意进制转十进制（math 类新样板之一）
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts、packs/math.ts
 */

/** 进制小表：4 行数据，表头占第 1 行，数据在第 2–5 行 */
const RADIX_TSV = '文本\t进制\n1010\t2\nFF\t16\n777\t8\nZ\t36';

const decimalEntry: FunctionEntry = {
  id: 'decimal',
  enName: 'DECIMAL',
  zhName: '任意进制转十进制',
  zhCommon: ['进制转十进制', '转十进制', '解析进制'],
  alias: ['反进制', '文本转数字', '基转十'],
  category: 'math',
  abbr: 'ryjzzsjz',
  pinyin: 'renyijinzhizhuanshijinzhi',
  keywords: ['进制转换', '转十进制', '二进制转十进制', '十六进制解析', 'BASE 反向', '任意进制'],
  difficulty: 3,
  usageLevel: 22,
  version: {
    min: '2013',
    label: 'Excel 2013 起可用',
    notes: '与 BASE 是一对反向操作；Excel 2007 及更早版本没有这个函数。',
  },
  oneLiner: '把 2–36 进制的文本读成十进制数字',
  summary:
    'BASE 的反向操作：BASE 把十进制数写成 2–36 进制的文本，DECIMAL 再把那段文本读回十进制数。两个参数都必填——第一个是要解析的文本，第二个是它原本的进制（2 到 36）。最常见的用法是解析十六进制：=DECIMAL("FF",16) 得到 255。注意它只认文本，直接塞一个数字进去会报 #VALUE!。',
  syntax: {
    patternCn: '=DECIMAL(文本, 进制)',
    patternEn: '=DECIMAL(text, radix)',
    args: [
      {
        key: 'text',
        zh: '文本',
        en: 'text',
        required: true,
        desc: '要解析的那一串进制文本，必须是文本类型。',
        accepts: '"1010" · "FF" · 单元格引用（如 A2，且 A2 里是文本）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '超过 9 的数字用 A–Z 表示（A=10 … Z=35），大小写都可以，Excel 不区分。',
        example: '"FF"',
        pitfallRank: 1,
      },
      {
        key: 'radix',
        zh: '进制',
        en: 'radix',
        required: true,
        desc: '这串文本原本是几进制，取值 2 到 36。',
        accepts: '2（二进制）· 8（八进制）· 16（十六进制）· 36（最大）。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '常用值：2 二进制、8 八进制、10 十进制、16 十六进制。超过 36 或小于 2 会报 #NUM!。',
        example: '16',
        pitfallRank: 2,
      },
    ],
  },
  returnValue: '返回该进制文本对应的十进制数字；文本或进制不合法时返回 #NUM! / #VALUE!。',
  examples: [
    {
      title: '示例 1：按小表把不同进制的文本读成十进制',
      scene: '系统导出的三列编码分别是二进制、十六进制、八进制，要统一换算成十进制数来比对。',
      dataTsv: RADIX_TSV,
      dataAnchor: 'A1',
      formula: '=DECIMAL(A2,B2)',
      result: '"1010" 按 2 进制 → 10；"FF" 按 16 进制 → 255；"777" 按 8 进制 → 511；"Z" 按 36 进制 → 35',
      explanation:
        '第一个参数是文本、第二个是进制，两个都必填。A–Z 表示 10–35，所以 36 进制里 "Z" 就是 35。下拉填充即可批量换算。',
    },
    {
      title: '示例 2：直接写死参数解析十六进制',
      scene: '只想临时把一个十六进制颜色值或地址换算成十进制，不想在表里铺辅助列。',
      dataTsv: '值\t说明\n1A\t十六进制\n100\t十六进制\n2F\t十六进制',
      dataAnchor: 'A1',
      formula: '=DECIMAL("1A",16)',
      result: '26（1×16 + 10 = 26）',
      explanation:
        '文本要加半角双引号。1A 里 A 代表 10，所以是 1×16¹ + 10×16⁰ = 26。同样的写法把 "100" 换进去得 256、"2F" 得 47。',
    },
    {
      title: '示例 3：与 BASE 配合做「编码—数字」来回转换',
      scene: '先把十进制编号编成短码存起来，需要时再还原回数字，验证编码是否可逆。',
      dataTsv: '编号\t短码\n255\t\n26\t\n511\t',
      dataAnchor: 'A1',
      formula: '=DECIMAL(BASE(A2,16),16)',
      result: '255 → BASE 得 "FF" → DECIMAL 还原回 255',
      explanation:
        'BASE(A2,16) 先编成十六进制文本，DECIMAL 再读回来，结果应该和原数一致。这对组合常用来做「缩短但可逆」的编码；若中间文本被改成该进制不存在的字符，就会报 #NUM!。',
    },
  ],
  pitfalls: [
    {
      title: '第一个参数直接填数字，如 =DECIMAL(1010,2)',
      reason:
        'DECIMAL 只接受文本。直接给数字会被当成数字类型，Excel 无法按进制解析，直接报错。',
      fix: '给文本加半角双引号写成 =DECIMAL("1010",2)；如果值在单元格里，确保它是文本格式（文本型数字会在单元格左上角显示绿色三角）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '进制写成 1、37 或更大的数',
      reason: 'DECIMAL 的进制只允许 2 到 36。超出范围 Excel 会拒绝计算。',
      fix: '检查 radix 参数：常用只有 2 / 8 / 10 / 16，最大 36。',
      level: 'mid',
      errorCode: '#NUM!',
    },
    {
      title: '文本里出现了该进制不存在的字符，如 =DECIMAL("2",2)',
      reason:
        '二进制里只有 0 和 1，出现 2 就无意义；同理十六进制里出现 G 也不合法。这类「看起来没写错但结果报错」最难排查。',
      fix: '核对文本每一位是否都小于 radix。十六进制合法字符是 0–9 与 A–F；36 进制最大到 Z。',
      level: 'mid',
      errorCode: '#NUM!',
    },
    {
      title: '指望它能处理负号或小数',
      reason: 'DECIMAL 只解析非负整数，传 "-1" 或 "1.5" 都会报 #NUM!。',
      fix: '先确保文本是纯数字/字母组成的非负整数；需要正负号时，把符号拆出来单独处理，再在外面乘 -1。',
      level: 'low',
      errorCode: '#NUM!',
    },
  ],
  related: [
    {
      id: 'base',
      kind: 'companion',
      why: 'BASE 是「十进制 → 任意进制文本」，DECIMAL 是它的反向；两者参数顺序一致，常成对使用。',
    },
    {
      id: 'roman',
      kind: 'confusable',
      why: 'ROMAN 也是把数字写成特殊记数法，但它是固定十进制→罗马数字、且没有反向解析函数（要还原得用 MATCH 查表）。',
    },
    {
      id: 'value',
      kind: 'confusable',
      why: 'VALUE 是把「文本型数字」转成真数字，只能处理十进制；DECIMAL 专管非十进制的解析，别混用。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'text', label: '数字文本', type: 'text', default: '"FF"' },
      { key: 'radix', label: '进制（2-36）', type: 'number', default: '16' },
    ],
    template: '=DECIMAL({text},{radix})',
    cases: [
      { label: 'DECIMAL("FF",16) → 255', type: 'ok', values: { text: '"FF"', radix: '16' }, expect: '255', note: '十六进制 FF 等于十进制 255。' },
      { label: 'DECIMAL("111",2) → 7', type: 'ok', values: { text: '"111"', radix: '2' }, expect: '7', note: '二进制 111 等于十进制 7。' },
      { label: '进制 40 越界 → #NUM!', type: 'error', values: { text: '"FF"', radix: '40' }, expect: '#NUM!', note: '进制必须在 2…36，否则报 #NUM!。' },
      { label: '超范围字符 XYZ → #NUM!', type: 'error', values: { text: '"XYZ"', radix: '16' }, expect: '#NUM!', note: 'X 不是十六进制合法字符，报 #NUM!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default decimalEntry;
