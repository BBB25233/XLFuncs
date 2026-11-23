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
  examples: [{ title: '示例：半角转全角', scene: '半角 ABC', dataAnchor: 'A2', formula: '=JIS(A2)', result: 'ＡＢＣ', explanation: '半角字母变全角。' },
    { title: '示例 2：编号补成全角填日文表单', scene: '要往日文格式的申请表里填编号，对方要求全角，A-01 这种半角写法得先转成全角再贴。', dataTsv: '编号\nA-01', dataAnchor: 'A1', formula: '=JIS(A2)', result: 'Ａ－０１（字母、数字和连字符 - 全部变成全角）', explanation: 'JIS 把半角 0x21–0x7E 的字符逐个换成对应全角，连字符也不例外；半角空格 0x20 不在范围内，不会变宽。' }],
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
      { label: '空格转全角空格', type: 'ok', values: { t: ' ' }, expect: '　', note: '半角空格转全角空格。' },
      { label: '数字转全角', type: 'ok', values: { t: '123' }, expect: '１２３', note: '数字同样按半角 ASCII 转全角。' },
      { label: '空文本返回空串', type: 'ok', values: { t: '' }, expect: '', note: 'JIS("") 合法，返回空串。' },
      { label: '超过 255 字符 → #VALUE!', type: 'error', values: { t: 'A'.repeat(256) }, expect: '#VALUE!', note: '超过 255 字符直接报错。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default jisEntry;
