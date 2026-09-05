import type { FunctionEntry } from '@/types';

/** ASC · 全角转半角（compatibility 类 B9 批次） */

const ascEntry: FunctionEntry = {
  id: 'asc',
  enName: 'ASC',
  zhName: '全角转半角',
  zhCommon: ['ASC', '全角转半角'],
  alias: ['半角化'],
  category: 'compatibility',
  abbr: 'qjzbj',
  pinyin: 'quanjiaozhuanbanjiao',
  keywords: ['asc', '全角', '半角'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把全角字符转半角',
  summary: 'ASC 将全角（双字节）英数标点转为半角（单字节），便于统一处理字符串。',
  syntax: { patternCn: '=ASC(文本)', patternEn: '=ASC(text)', args: [{ key: 't', zh: '文本', en: 'text', required: true, desc: '含全角字符的文本' }] },
  returnValue: '半角文本',
  examples: [{ title: '示例：全角转半角', scene: '全角 ＡＢＣ', dataAnchor: 'A2', formula: '=ASC(A2)', result: 'ABC', explanation: '全角字母变半角。' }],
  pitfalls: [{ title: '只影响全角', reason: '半角字符原样返回。', fix: '反向用 JIS/DBCS。', level: 'low' }],
  related: [{ id: 'jis', kind: 'companion', why: 'JIS 与本品类相关' },
    { id: 'dbcs', kind: 'companion', why: 'DBCS 与本品类相关' },
    { id: 'len', kind: 'companion', why: 'LEN 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [{ key: 't', label: '文本', type: 'text', default: 'ＡＢＣ' }],
    template: '=ASC({t})',
    cases: [
      { label: '全角转半角', type: 'ok', values: {}, expect: 'ABC', note: '全角字母转成对应的半角字母。' },
      { label: '缺少文本', type: 'error', values: { t: '' }, expect: '#VALUE!', note: 'ASC 需要一个文本参数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default ascEntry;
