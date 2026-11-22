import type { FunctionEntry } from '@/types';

/** DATEVALUE · 文本日期转序列号（datetime 类 B6 批次） */

const TSV = '文本日期\t说明\n2024-3-15\t标准横线格式\n2024/1/1\t斜杠格式\n2024年3月15日\t中文格式（不被识别）';

const datevalueEntry: FunctionEntry = {
  id: 'datevalue',
  enName: 'DATEVALUE',
  zhName: '文本转日期序列',
  zhCommon: ['DATEVALUE', '文本转日期', '日期转数字'],
  alias: ['把文字日期变成真日期', '日期文本转序列号'],
  category: 'datetime',
  abbr: 'wbzrqxl',
  pinyin: 'wenbenzhuanriqixulie',
  keywords: ['文本日期', 'DATEVALUE', '转序列号', '真日期', '日期数字'],
  difficulty: 2,
  usageLevel: 28,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'DATEVALUE 只认「文本写的日期」，把 "2024-3-15" 变成真正的日期序列号。已经是真日期的单元格（靠右对齐、能直接减）再套它会报 #VALUE!。',
  },
  oneLiner: '把"2024-3-15"这样的文字日期变成可计算的真日期',
  summary:
    'Excel 里手打的 "2024-3-15" 如果变成了文本（左上角绿三角、靠左对齐），就不能直接相减算天数差。DATEVALUE 专门把这种文字日期转成真正的日期序列号，转完就能跟 TODAY、DATEDIF 一起算了。已经是真日期的单元格不要再套 DATEVALUE。',
  syntax: {
    patternCn: '=DATEVALUE(文本日期)',
    patternEn: '=DATEVALUE(date_text)',
    args: [
      {
        key: 'date_text',
        zh: '文本日期',
        en: 'date_text',
        required: true,
        desc: '用引号包起来的日期文本，或存着日期文本的单元格引用。',
        accepts: '"2024-3-15" / "2024/1/1"；单元格引用。',
        ifOmitted: '参数必填，省略公式不成立。',
        tip: '⚠️ 必须是文本，真日期单元格套它会报 #VALUE!。',
        example: '"2024-3-15"',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回该日期对应的序列号（1900-01-01 = 1）；文本不是合法日期则 #VALUE!。',
  examples: [
    {
      title: '示例 1：把文本日期变成真日期再相减',
      scene: 'A 列是手打的文本日期，想算两日期之间隔多少天。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DATEVALUE(A2)',
      result: '45366（2024-3-15 对应的序列号）',
      explanation: '转成序列号后就能参与计算；DATEVALUE(A3)-DATEVALUE(A2) 即可算天数差。',
    },
    {
      title: '示例 2：和 TODAY 配合算倒计时',
      scene: '想知道某个文本写的截止日还有多少天。',
      dataTsv: '截止日\n2026-12-31',
      dataAnchor: 'A1',
      formula: '=DATEVALUE(A2)-TODAY()',
      result: '约 123 天（以页面基准日 2026-08-30 计，实际随今天变化）',
      explanation: '文本截止日先转序列号，再减 TODAY() 得到剩余天数。',
    },
    {
      title: '示例 3：中文写法也能直接转成序列号',
      scene: '表格里从业务系统导出的是"2024年3月15日"这种中文写法。',
      dataTsv: TSV,
      dataAnchor: 'A1',
      formula: '=DATEVALUE(A4)',
      result: '45366',
      explanation: '本工具统一识别「年/月/日」写法；Excel 是否识别取决于区域设置，中文版可直接算，英文版需先把年月日替换成 -。',
    },
  ],
  pitfalls: [
    {
      title: '对已经是真日期的单元格套 DATEVALUE',
      reason: '真日期本身已是序列号，DATEVALUE 要的是文本，喂真日期会报 #VALUE!。',
      fix: '真日期直接拿去计算即可；不确定就看看单元格是否靠左对齐（文本特征）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '中文写法在不同区域设置下表现不同',
      reason: '中文版 Excel 能识别"2024年3月15日"，英文版会报 #VALUE!；本工具统一支持，但复制到英文版可能失败。',
      fix: '跨区域分发时先用 SUBSTITUTE 把"年/月/日"替换成"-"，得到 2024-3-15 这种通用写法。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '结果看起来像一串怪数字',
      reason: '序列号 45366 本身没错，只是单元格是「常规」格式，没显示成日期。',
      fix: '把结果单元格格式设为日期；它本来就代表 2024-3-15，可直接参与计算。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'date',
      kind: 'companion',
      why: 'DATE 用年/月/日三个数字拼真日期；DATEVALUE 把现成的文本日期转成真日期，两者殊途同归。',
    },
    {
      id: 'today',
      kind: 'companion',
      why: 'DATEVALUE 转出的序列号可以直接和 TODAY() 相减，算倒计时或已过天数。',
    },
    {
      id: 'value',
      kind: 'alternative',
      why: 'VALUE 把一般数字文本转成数字；日期文本交给 DATEVALUE 更对口。',
    },
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'date_text', label: '文本日期', type: 'text', default: '"2024-1-15"' },
    ],
    template: '=DATEVALUE({date_text})',
    cases: [
      { label: '2024-1-15 → 45306', type: 'ok', values: {}, expect: '45306', note: '1900-01-01=1 起算' },
      { label: '2024-3-15 → 45366', type: 'ok', values: { date_text: '"2024-3-15"' }, expect: '45366', note: '与样例吻合' },
      { label: '中文写法 → 45366', type: 'ok', values: { date_text: '"2024年3月15日"' }, expect: '45366', note: '本工具支持年/月/日写法' },
      { label: '空 → #VALUE!', type: 'error', values: { date_text: '' }, expect: '#VALUE!', note: '文本不能为空' },
      { label: '裸文本 → #VALUE!', type: 'error', values: { date_text: 'abc' }, expect: '#VALUE!', note: '非日期写法报 #VALUE!' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default datevalueEntry;
