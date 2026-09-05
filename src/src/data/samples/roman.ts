import type { FunctionEntry } from '@/types';

/**
 * ROMAN · 转罗马数字
 * 写作口径：PRD §10.4 / §10.5.2，语气模仿 samples/if.ts
 */

const romanEntry: FunctionEntry = {
  id: 'roman',
  enName: 'ROMAN',
  zhName: '转罗马数字',
  zhCommon: ['罗马数字', '转罗马', '阿拉伯转罗马'],
  alias: ['罗马记数', '年份转罗马', '古典数字'],
  category: 'math',
  abbr: 'zlmsz',
  pinyin: 'zhuanluomashuzi',
  keywords: ['罗马数字', 'ROMAN', '年份转换', '阿拉伯转罗马', '古典记数', '文本转换'],
  difficulty: 2,
  usageLevel: 22,
  version: {
    min: 'all',
    label: 'Excel 2003 起可用',
    notes:
      'ROMAN 只接受 1–3999 的整数；超出范围报 #VALUE!。form 参数（0–4）控制「简写程度」，0 或省略是最标准的古典写法。',
  },
  oneLiner: '把阿拉伯数字写成罗马数字',
  summary:
    '做奖牌、纪念碑、电影片头那种「MMXXIV」效果就靠它。ROMAN(2024) 返回 "MMXXIV"。第二参数 form（0–4）可选，数字越大写法越「偷懒」（用更多减法简写），一般省略就够用。它返回的是文本，不是数字，不能直接拿去加减。',
  syntax: {
    patternCn: '=ROMAN(数字, [简写程度])',
    patternEn: '=ROMAN(number, [form])',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要转换的阿拉伯数字（1 到 3999）。',
        accepts: '整数或单元格，如 2024、A2。',
        ifOmitted: '必填参数。',
        tip: '超出 1–3999 会报 #VALUE!；小数会被截断取整。',
        example: '2024',
        pitfallRank: 1,
      },
      {
        key: 'form',
        zh: '简写程度',
        en: 'form',
        required: false,
        desc: '0–4 的数字，控制罗马数字的简写风格（越大越简）。',
        accepts: '0（标准古典）· 1–3（逐渐简写）· 4（最精简，如用大量减法记号）。',
        ifOmitted: '省略时按 0（最标准写法）处理，日常用这个就够。',
        tip: 'form 只影响「写法长短」，不改变数值；一般留空即可。',
        example: '0',
      },
    ],
  },
  returnValue:
    '返回该数字对应的罗马数字文本（如 "MMXXIV"）；是文本不是数字，不能直接参与算术。',
  examples: [
    {
      title: '示例 1：年份转罗马数字',
      scene: '电影、证书上想写「2024」的罗马写法。',
      dataTsv: '年份\n2024',
      dataAnchor: 'A1',
      formula: '=ROMAN(A2)',
      result: '"MMXXIV"',
      explanation: '2000=M、20=XX、4=IV，拼起来就是 MMXXIV。第二参数省略用标准写法。',
    },
    {
      title: '示例 2：小数被截断',
      scene: '手滑写成 2024.9，照样出 MMXXIV。',
      dataTsv: '年份\n2024.9',
      dataAnchor: 'A1',
      formula: '=ROMAN(A2)',
      result: '"MMXXIV"（按 2024 算）',
      explanation: 'ROMAN 会先把小数截断成整数再转换，所以 2024.9 当成 2024。',
    },
    {
      title: '示例 3：简写程度 form 的影响',
      scene: '同一个数，form=0 和 form=4 写法长度不同。',
      dataTsv: '数字\t简写\n499\t4',
      dataAnchor: 'A1',
      formula: '=ROMAN(A2,B2)',
      result: 'form=4 时 "ID" 而非标准 "CDXCIX"',
      explanation:
        'form 越大越爱用减法记号（如 499 写成 ID = 500-1），更短但更不直观；日常建议留空用标准。',
    },
  ],
  pitfalls: [
    {
      title: '数字超出 1–3999，报 #VALUE!',
      reason: '罗马数字没有 0 也没有表示 4000 以上的标准符号，Excel 只支持 1–3999。',
      fix: '先确认数字落在 1–3999；超范围的要分段处理或换其他记法。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '把结果当数字去加减',
      reason: 'ROMAN 返回的是文本 "MMXXIV"，不是数字，直接 +1 会报 #VALUE!。',
      fix: '要算数先别转罗马；要转回数字用 ARABIC("MMXXIV")（2013+ 才有）。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: 'form 参数乱填超出 0–4',
      reason: 'form 只接受 0–4，填 5 或文本会报 #VALUE!。',
      fix: 'form 留空最稳；要控制简写只在 0–4 之间选。',
      level: 'low',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'base',
      kind: 'companion',
      why: '同是「数字转另一种文本表示」，BASE 转任意进制、ROMAN 转罗马数字。',
    },
    {
      id: 'decimal',
      kind: 'companion',
      why: '反过来想：DECIMAL 把某进制文本转回数字，ROMAN 把数字转文本，一正一反。',
    },
    {
      id: 'int',
      kind: 'companion',
      why: 'ROMAN 会先截断小数，等价于先 INT 取整再转换，理解 INT 更好懂截断行为。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'number', default: '2024' },
    ],
    template: '=ROMAN({number})',
    cases: [
      { label: 'ROMAN(2024) → MMXXIV', type: 'ok', values: { number: '2024' }, expect: 'MMXXIV', note: '2024 的罗马数字写法是 MMXXIV。' },
      { label: '0 → #VALUE!', type: 'error', values: { number: '0' }, expect: '#VALUE!', note: 'ROMAN 只支持 1…3999，0 报 #VALUE!。' },
      { label: '4000 → #VALUE!', type: 'error', values: { number: '4000' }, expect: '#VALUE!', note: '超过 3999 报 #VALUE!。' },
      { label: '文本 abc → #VALUE!', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: '含文本会报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

export default romanEntry;
