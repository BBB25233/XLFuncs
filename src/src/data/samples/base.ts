import type { FunctionEntry } from '@/types';

/**
 * BASE · 转任意进制文本
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const baseEntry: FunctionEntry = {
  id: 'base',
  enName: 'BASE',
  zhName: '转任意进制文本',
  zhCommon: ['转进制', '进制转换', '转二进制十六进制'],
  alias: ['任意进制', '进制文本', '数字转基'],
  category: 'math',
  abbr: 'zryjzwb',
  pinyin: 'zhuanrenyijinzhiwenben',
  keywords: ['进制转换', 'BASE', '二进制', '十六进制', '转文本', '任意基'],
  difficulty: 3,
  usageLevel: 24,
  version: {
    min: '2013',
    label: 'Excel 2013 及以上可用',
    notes:
      'BASE 把十进制整数转成 2–36 进制「文本」。radix 超出 2–36 报 #NUM!；结果是文本不是数字，不能直接加。想转回十进制用 DECIMAL。',
  },
  oneLiner: '把十进制数字写成 2–36 进制的文本',
  summary:
    'BASE 干一件事：把普通十进制数转成你指定的进制（2 到 36 之间），以文本形式返回。BASE(255,16) 得到 "FF"（十六进制），BASE(7,2) 得到 "111"（二进制）。第三参数 min_length 可指定最少几位、不足前面补 0。结果是文本，不能直接算术。需要 Excel 2013+。',
  syntax: {
    patternCn: '=BASE(数字, 进制, [最少位数])',
    patternEn: '=BASE(number, radix, [min_length])',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要转换的十进制整数（正数）。',
        accepts: '非负整数或单元格，如 255、A2。小数会被截断取整。',
        ifOmitted: '必填参数。',
        tip: '负数是 #NUM!；小数先截断成整数再转。',
        example: '255',
        pitfallRank: 1,
      },
      {
        key: 'radix',
        zh: '进制',
        en: 'radix',
        required: true,
        desc: '目标进制，2 到 36 之间。',
        accepts: '2（二进制）· 8（八）· 16（十六）· 36（最大，用 0-9 加 A-Z）。',
        ifOmitted: '必填参数。',
        tip: '超过 10 的进制用字母 A–Z 表示 10–35（如 16 进制的 F=15）。',
        example: '16',
        pitfallRank: 2,
      },
      {
        key: 'min_length',
        zh: '最少位数',
        en: 'min_length',
        required: false,
        desc: '结果最少要有几位，不足时在前面补 0。',
        accepts: '正整数，如 8。',
        ifOmitted: '省略时按实际位数输出，不补零。',
        tip: '想固定 8 位二进制（如 00000111）就写 8。',
        example: '8',
      },
    ],
  },
  returnValue:
    '返回该数在指定进制下的文本表示（如 "FF"）；是文本不是数字，不能直接参与算术；radix 越界或负数为 #NUM!。',
  examples: [
    {
      title: '示例 1：十转十六进制',
      scene: '颜色值、内存地址常用十六进制。',
      dataTsv: '十进制\t进制\n255\t16',
      dataAnchor: 'A1',
      formula: '=BASE(A2,B2)',
      result: '"FF"',
      explanation: '255 = 15×16 + 15，十六进制里 15 写作 F，所以是 "FF"。',
    },
    {
      title: '示例 2：十转二进制并补满 8 位',
      scene: '想看固定 8 位二进制，前面补零。',
      dataTsv: '十进制\t进制\t最少位\n7\t2\t8',
      dataAnchor: 'A1',
      formula: '=BASE(A2,B2,C2)',
      result: '"00000111"',
      explanation: '7 的二进制是 111，指定最少 8 位后前面补 5 个 0，得 00000111。',
    },
    {
      title: '示例 3：和 DECIMAL 互转验证',
      scene: '转过去再转回来，确认没错。',
      dataTsv: '十进制\t进制\n255\t16',
      dataAnchor: 'A1',
      formula: '=DECIMAL(BASE(A2,B2),B2)',
      result: '255（BASE 转十六进制文本，DECIMAL 再转回十进制）',
      explanation: 'BASE 出文本、DECIMAL 吃文本，两者互为逆操作，可用来校验。',
    },
  ],
  pitfalls: [
    {
      title: '进制 radix 不在 2–36，报 #NUM!',
      reason: 'BASE 只支持 2 到 36 进制，写 1 或 37 都会报 #NUM!。',
      fix: '确认 radix 在 2–36 之间；超过 36 没有现成单函数。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '把结果当数字加减',
      reason: 'BASE 返回文本 "FF"，直接 +1 会报 #VALUE!。',
      fix: '要算数先用 DECIMAL 转回数字；BASE 只负责「显示成某种进制」。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '负数字或小数',
      reason: 'BASE 不接受负数（#NUM!）；小数会被截断（BASE(7.9,2) 当成 7）。',
      fix: '先确认输入是非负整数；要按四舍五入用 BASE(ROUND(A2,0), radix)。',
      level: 'mid',
      errorCode: '#NUM!',
    },
  ],
  related: [
    {
      id: 'decimal',
      kind: 'confusable',
      why: 'DECIMAL 是把某进制文本转回十进制数字，和 BASE 正好相反，别搞反方向。',
    },
    {
      id: 'roman',
      kind: 'companion',
      why: '同是「数字转另一种文本表示」，ROMAN 转罗马、BASE 转任意进制。',
    },
    {
      id: 'mod',
      kind: 'companion',
      why: '手工算进制（除基取余）时离不开 MOD，理解 MOD 更好懂 BASE 背后的原理。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '255' },
      { key: 'radix', label: '进制（2-36）', type: 'number', default: '16' },
      { key: 'minlen', label: '最小长度（可选）', type: 'number', default: '' },
    ],
    template: '=BASE({number},{radix},{minlen})',
    cases: [
      { label: 'BASE(255,16) → FF', type: 'ok', values: { number: '255', radix: '16' }, expect: 'FF', note: '255 的十六进制是 FF。' },
      { label: 'BASE(255,16,4) → 00FF', type: 'ok', values: { number: '255', radix: '16', minlen: '4' }, expect: '00FF', note: '补足到 4 位，前面补 0。' },
      { label: '进制 40 越界 → #NUM!', type: 'error', values: { number: '255', radix: '40' }, expect: '#NUM!', note: '进制必须在 2…36，否则报 #NUM!。' },
      { label: '负数 -5 → #NUM!', type: 'error', values: { number: '-5', radix: '2' }, expect: '#NUM!', note: '数字不能为负，报 #NUM!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc', radix: '16' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default baseEntry;
