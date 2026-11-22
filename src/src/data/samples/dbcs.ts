import type { FunctionEntry } from '@/types';

/** DBCS · 双字节字符（compatibility 类 B9 批次） */

const dbcsEntry: FunctionEntry = {
  id: 'dbcs',
  enName: 'DBCS',
  zhName: '双字节字符',
  zhCommon: ['DBCS', '双字节'],
  alias: ['半角转双字节'],
  category: 'compatibility',
  abbr: 'szjzf',
  pinyin: 'shuangzijiezifu',
  keywords: ['dbcs', '双字节', '全角'],
  difficulty: 2,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把半角字符转双字节',
  summary: 'DBCS 将半角英数/片假名转为双字节（全角）字符，与 JIS 作用相近。',
  syntax: { patternCn: '=DBCS(文本)', patternEn: '=DBCS(text)', args: [{ key: 't', zh: '文本', en: 'text', required: true, desc: '含半角字符的文本' }] },
  returnValue: '双字节（全角）文本',
  examples: [{ title: '示例：转双字节', scene: '半角 ABC', dataAnchor: 'A2', formula: '=DBCS(A2)', result: 'ＡＢＣ', explanation: '半角字母变双字节全角。' },
    { title: '示例 2：中英混排统一成全角', scene: '宣传稿要求英文和数字都用全角、但词间空档保持半角，DBCS 的转换范围正好符合这个要求。', dataTsv: '版本\nExcel 2024', dataAnchor: 'A1', formula: '=DBCS(A2)', result: 'Ｅｘｃｅｌ ２０２４（字母数字变全角，中间那个空格仍是半角）', explanation: 'DBCS 只转半角 0x21–0x7E，半角空格 0x20 不在其中，所以空格保持原样。想连空格一起变宽得自己手动补全角空格。' }],
  pitfalls: [{ title: '与 JIS 重叠', reason: 'DBCS 与 JIS 功能类似。', fix: '按需要任选其一。', level: 'low' }],
  related: [{ id: 'asc', kind: 'companion', why: 'ASC 与本品类相关' },
    { id: 'jis', kind: 'companion', why: 'JIS 与本品类相关' },
    { id: 'len', kind: 'companion', why: 'LEN 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [{ key: 't', label: '文本', type: 'text', default: 'ABC' }],
    template: '=DBCS({t})',
    cases: [
      { label: '半角转全角', type: 'ok', values: {}, expect: 'ＡＢＣ', note: '半角字母转成对应的全角字母。' },
      { label: '缺少文本', type: 'error', values: { t: '' }, expect: '#VALUE!', note: 'DBCS 需要一个文本参数。' },
      { label: '只输入半角空格', type: 'error', values: { t: ' ' }, expect: '#VALUE!', note: '只敲空格时参数等于空的，DBCS 报「缺少文本」。' },
      { label: '只输入制表符', type: 'error', values: { t: '\t' }, expect: '#VALUE!', note: '制表符也会被当作空白清掉，结果同样是空参数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default dbcsEntry;
