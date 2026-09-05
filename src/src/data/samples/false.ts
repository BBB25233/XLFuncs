import type { FunctionEntry } from '@/types';

/** FALSE · 取假值（logical 类 B8 批次） */

const falseEntry: FunctionEntry = {
  id: 'false',
  enName: 'FALSE',
  zhName: '取假值',
  zhCommon: [
    'FALSE',
    '假',
    '逻辑假'
  ],
  alias: [
    '假',
    '逻辑假值'
  ],
  category: 'logical',
  abbr: 'qjz',
  pinyin: 'qujiazhi',
  keywords: [
    'FALSE',
    '逻辑',
    '假',
    '布尔'
  ],
  difficulty: 1,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'FALSE() 直接返回逻辑值 FALSE，可省略括号写 FALSE。'
  },
  oneLiner: '返回逻辑假值 FALSE',
  summary: 'FALSE 是逻辑世界的「否」。和 TRUE 一样，多数情况由 IF/AND/OR 自动产生；当你需要主动输出一个假值（如清空标志、作为数组里的空位）时用到它。',
  syntax: {
    patternCn: '=FALSE()',
    patternEn: '=FALSE()',
    args: []
  },
  returnValue: '返回逻辑值 FALSE。',
  examples: [
    {
      title: '示例 1：直接返回假',
      scene: '需要一个恒为假的值。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=FALSE()',
      result: 'FALSE',
      explanation: '单元格显示 FALSE。'
    },
    {
      title: '示例 2：未达标打 FALSE',
      scene: '库存低于安全线才报警。',
      dataTsv: '库存\t安全线\n40\t50',
      dataAnchor: 'A1',
      formula: '=IF(A2>=B2,TRUE(),FALSE())',
      result: 'FALSE',
      explanation: '库存不足，返回 FALSE。'
    }
  ],
  pitfalls: [
    {
      title: '引号包成文本',
      reason: '"FALSE" 是文本不是逻辑值，参与逻辑判断会出错。',
      fix: '别加引号。',
      level: 'mid'
    },
    {
      title: '和 0 混用',
      reason: 'FALSE 算术里等于 0，但类型不同。',
      fix: '要数字用 --FALSE 或 N()。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'true',
      kind: 'companion',
      why: 'TRUE 是 FALSE 的反面。'
    },
    {
      id: 'if',
      kind: 'companion',
      why: 'IF 的假分支返回 FALSE 类结果。'
    },
    {
      id: 'not',
      kind: 'companion',
      why: 'NOT(FALSE) 得到 TRUE。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [],
    template: '=FALSE()',
    cases: [
      {
        label: '直接返回假值',
        type: 'ok',
        values: {},
        expect: 'FALSE',
        note: 'FALSE() 恒返回逻辑假值 FALSE。',
      },
      {
        label: '再确认一次恒为假',
        type: 'ok',
        values: {},
        expect: 'FALSE',
        note: '无参数、无副作用，每次都得到 FALSE。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default falseEntry;
