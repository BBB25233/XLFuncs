import type { FunctionEntry } from '@/types';

/** JIS · 半角转全角（compatibility 类 B9 批次） */

const jisEntry: FunctionEntry = {
  id: 'jis',
  enName: 'JIS',
  zhName: '半角转全角',
  zhCommon: ['JIS', '半角转全角'],
  alias: ['全角化'],
  category: 'compatibility',
  abbr: 'bjzqj',
  pinyin: 'banjiaozhuanquanjiao',
  keywords: ['jis', '半角', '全角'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把半角字符转全角',
  summary: 'JIS 将半角（单字节）英数标点转为全角（双字节），用于日文等排版。',
  syntax: { patternCn: '=JIS(文本)', patternEn: '=JIS(text)', args: [{ key: 't', zh: '文本', en: 'text', required: true, desc: '含半角字符的文本' }] },
  returnValue: '全角文本',
  examples: [{ title: '示例：半角转全角', scene: '半角 ABC', dataAnchor: 'A2', formula: '=JIS(A2)', result: 'ＡＢＣ', explanation: '半角字母变全角。' }],
  pitfalls: [{ title: '与 DBCS 类似', reason: '两者都做半→全转换。', fix: '按区域习惯选用。', level: 'low' }],
  related: [{ id: 'asc', kind: 'companion', why: 'ASC 与本品类相关' },
    { id: 'dbcs', kind: 'companion', why: 'DBCS 与本品类相关' },
    { id: 'len', kind: 'companion', why: 'LEN 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [{ key: 't', label: '文本', type: 'text', default: 'ABC' }],
    template: '=JIS({t})',
    cases: [
      { label: '半角转全角', type: 'ok', values: {}, expect: 'ＡＢＣ', note: '半角字母转成对应的全角字母。' },
      { label: '缺少文本', type: 'error', values: { t: '' }, expect: '#VALUE!', note: 'JIS 需要一个文本参数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default jisEntry;
