import type { FunctionEntry } from '@/types';

/** NA · 空错误值（information 类 B8 批次） */

const naEntry: FunctionEntry = {
  id: 'na',
  enName: 'NA',
  zhName: '空错误值',
  zhCommon: [
    'NA',
    '缺失错误',
    '留空标记'
  ],
  alias: [
    '缺失错误',
    '留空'
  ],
  category: 'information',
  abbr: 'kcwz',
  pinyin: 'kongcuowuzhi',
  keywords: [
    'NA',
    '错误',
    '缺失',
    '标记'
  ],
  difficulty: 1,
  usageLevel: 8,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'NA() 主动返回 #N/A，常用于公式里「这里还没填」的格子，提醒下游「数据缺失」。'
  },
  oneLiner: '主动返回 #N/A 错误',
  summary: 'NA() 就是故意制造一个 #N/A。用途：在模板里圈出「待填」「缺失」的格子——下游用 ISNA 能统一识别。比留空白更明确，避免被当成 0 误算。',
  syntax: {
    patternCn: '=NA()',
    patternEn: '=NA()',
    args: []
  },
  returnValue: '返回 #N/A 错误值。',
  examples: [
    {
      title: '示例 1：缺失标记',
      scene: '某格数据还没到。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=NA()',
      result: '#N/A',
      explanation: '明确标记缺失。'
    },
    {
      title: '示例 2：配 IFNA 提示',
      scene: '下游识别缺失。',
      dataTsv: '值\n=#N/A',
      dataAnchor: 'A1',
      formula: '=IFNA(A2,"待补充")',
      result: '待补充',
      explanation: 'IFNA 把 #N/A 换成提示文字。'
    }
  ],
  pitfalls: [
    {
      title: '参与运算全错',
      reason: 'NA() 结果参与求和等会 contagion 成 #N/A。',
      fix: '下游用 IFNA/AGGREGATE 忽略。',
      level: 'mid'
    },
    {
      title: '别加参数',
      reason: 'NA 不接受参数，写 NA(A2) 会 #VALUE!。',
      fix: '空括号 NA()。',
      level: 'low',
      errorCode: '#VALUE!'
    }
  ],
  related: [
    {
      id: 'isna',
      kind: 'companion',
      why: 'ISNA 识别 NA() 产生的 #N/A。'
    },
    {
      id: 'iferror',
      kind: 'companion',
      why: 'IFERROR 兜底全部错误。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [],
    template: '=NA()',
    cases: [
      { label: '无参数', type: 'error', values: {}, expect: '#N/A', note: 'NA 永远返回 #N/A' },
      { label: '带一个参数', type: 'error', values: { value: '1' }, expect: '#N/A', note: 'NA 忽略参数仍返回 #N/A' },
      { label: '带文本参数', type: 'error', values: { value: 'abc' }, expect: '#N/A', note: 'NA 忽略参数仍返回 #N/A' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default naEntry;
