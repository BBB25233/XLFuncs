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
  examples: [{ title: '示例：提取文本', scene: 'A2 含文字', dataAnchor: 'A1', dataTsv: '文本\n你好', formula: '=PHONETIC(A2)', result: '你好', explanation: '返回首格文字（本实现仅回显，不存假名）。' }],
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
      { label: 'ok 回显', type: 'ok', values: {}, expect: '你好', note: '返回首格文字（本实现不存假名）。' },
      { label: '非法：区域无效', type: 'error', values: { ref: 'ZZZ' }, expect: '#REF!', note: '引用写法不对。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default phoneticEntry;
