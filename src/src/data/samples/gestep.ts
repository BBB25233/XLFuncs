import type { FunctionEntry } from '@/types';

/** GESTEP · 阈值比较（engineering 类 B9 批次） */

const gestepEntry: FunctionEntry = {
  id: 'gestep',
  enName: 'GESTEP',
  zhName: '阈值比较',
  zhCommon: ['GESTEP', '阶跃'],
  alias: ['大于等于判定'],
  category: 'engineering',
  abbr: 'yzbj',
  pinyin: 'yuzhibijiao',
  keywords: ['gestep', '阈值', '阶跃'],
  difficulty: 2,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '数是否 ≥ 阈值',
  summary: 'GESTEP 判断数值是否大于等于阈值：是得 1，否得 0，配合求和可做区间计数。',
  syntax: { patternCn: '=GESTEP(数, [阈值])', patternEn: '=GESTEP(number, [step])', args: [{ key: 'n', zh: '数', en: 'number', required: true, desc: '要比较的数' },
    { key: 'step', zh: '阈值', en: 'step', required: false, desc: '阈值，默认 0' }] },
  returnValue: '1（≥阈值）或 0',
  examples: [
    {
      title: '示例：阈值判定',
      scene: '8 是否 ≥ 5',
      dataAnchor: 'A2',
      formula: '=GESTEP(8,5)',
      result: '1',
      explanation: '8≥5 返回 1。',
    },
    {
      title: '示例：偏差在 0.05 公差内算合格，一列 0/1 标出来',
      scene: '实测值与标准值的偏差要控制在 0.05 以内，想一个公式直接得到合格/不合格，再 SUM 数出合格件数。',
      dataTsv: '物料\t标准值\t实测值\nA\t10\t10.02\nB\t10\t10.09',
      dataAnchor: 'A1',
      formula: '=GESTEP(0.05,ABS(C2-B2))',
      result: '1（A 行偏差 0.02，没超公差）；B 行偏差 0.09 → 0',
      explanation:
        'GESTEP 判的是「第 1 个 ≥ 第 2 个」，把公差放前面、实际偏差放后面，得到的 1 就是「偏差没超公差」。注意是 ≥ 不是 >：偏差正好 0.05 也算合格，要求严格小于就得改用 IF。',
    },
  ],
  pitfalls: [{ title: '与 DELTA 区别', reason: 'GESTEP 是 ≥，DELTA 是 =。', fix: '相等用 DELTA、≥ 用 GESTEP。', level: 'low' }],
  related: [{ id: 'delta', kind: 'companion', why: 'DELTA 与本品类相关' },
    { id: 'if', kind: 'companion', why: 'IF 与本品类相关' },
    { id: 'countif', kind: 'companion', why: 'COUNTIF 与本品类相关' }],
  calc: {
  enabled: true,
  sampleTableId: 'sales',
  ranges: {},
  fields: [
    { key: "number", label: "数", type: "number", default: "5" },
    { key: "step", label: "步长", type: "number", default: "2" }
  ],
  template: "=GESTEP({number},{step})",
  cases: [
    { label: "5>=2 → 1", type: "ok", values: { number: "5", step: "2" }, expect: "1", note: "达阈值" },
    { label: "1<2 → 0", type: "ok", values: { number: "1", step: "2" }, expect: "0", note: "未达阈值" },
    { label: "文本参数 → #VALUE!", type: "error", values: { number: "abc", step: "2" }, expect: "#VALUE!", note: "非数字" },
    { label: "空参数 → #VALUE!", type: "error", values: { number: "", step: "2" }, expect: "#VALUE!", note: "空单元格" },
    { label: "步长文本 → #VALUE!", type: "error", values: { number: "5", step: "xyz" }, expect: "#VALUE!", note: "非数字" }
  ],
},
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default gestepEntry;
