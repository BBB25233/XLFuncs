import type { FunctionEntry } from '@/types';

/** PHONETIC · 读音提取（compatibility 类 B9 批次） */

const phoneticEntry: FunctionEntry = {
  id: 'phonetic',
  enName: 'PHONETIC',
  zhName: '读音提取',
  zhCommon: ['PHONETIC', '读音'],
  alias: ['拼音提取'],
  category: 'compatibility',
  abbr: 'dytq',
  pinyin: 'duyintiqu',
  keywords: ['phonetic', '读音', '振假名'],
  difficulty: 3,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '提取单元格的读音（振假名）',
  summary: 'PHONETIC 返回日文单元格中附带的振假名（furigana）文本，用于提取读音信息。',
  syntax: { patternCn: '=PHONETIC(引用)', patternEn: '=PHONETIC(reference)', args: [{ key: 'ref', zh: '引用', en: 'reference', required: true, desc: '带振假名的单元格引用' }] },
  returnValue: '读音文本',
  examples: [{ title: '示例：提取文本', scene: 'A2 含文字', dataAnchor: 'A1', dataTsv: '文本\n你好', formula: '=PHONETIC(A2)', result: '你好', explanation: '返回首格文字（本实现仅回显，不存假名）。' },
    { title: '示例 2：没挂振假名时只会原样返回', scene: '从日文地址表里想批量取「東京」的读音，套上 PHONETIC 却发现出来的是汉字，不是 とうきょう。', dataTsv: '地名\n東京', dataAnchor: 'A1', formula: '=PHONETIC(A2)', result: '東京（不是 とうきょう）', explanation: 'PHONETIC 取的是单元格里「已经存好的」振假名，不是实时翻译读音。单元格没挂振假名（中文，或普通录入的日文汉字）时它就把原文原样吐回来，本实现也只做回显。' }],
  pitfalls: [{ title: '仅日文振假名', reason: '中文拼音不会自动提取。', fix: '仅对带振假名的日文有效。', level: 'mid' }],
  related: [{ id: 'left', kind: 'companion', why: 'LEFT 与本品类相关' },
    { id: 'mid', kind: 'companion', why: 'MID 与本品类相关' },
    { id: 'len', kind: 'companion', why: 'LEN 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'ref', label: '文本区域', type: 'ref', default: 'A2' },
    ],
    template: '=PHONETIC({ref})',
    cases: [
      { label: '单格回显', type: 'ok', values: {}, expect: '你好', note: '返回 A2 的原文（本实现不存假名）。' },
      { label: '空格子返回空文本', type: 'ok', values: { ref: 'A3' }, expect: '', note: '引用的格子为空时返回空文本，不报错。' },
      { label: '直接写文本 → #VALUE!', type: 'error', values: { ref: 'abc' }, expect: '#VALUE!', note: 'PHONETIC 只吃单元格引用。' },
      { label: '漏写行号 → #VALUE!', type: 'error', values: { ref: 'A' }, expect: '#VALUE!', note: '地址必须是「列字母 + 行号」。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default phoneticEntry;
