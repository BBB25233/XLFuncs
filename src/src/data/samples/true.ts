import type { FunctionEntry } from '@/types';

/** TRUE · 真值常量（logical 类 B8 批次） */

const trueEntry: FunctionEntry = {
  id: 'true',
  enName: 'TRUE',
  zhName: '真值常量',
  zhCommon: [
    'TRUE',
    '真',
    '逻辑真'
  ],
  alias: [
    '真',
    '逻辑真值'
  ],
  category: 'logical',
  abbr: 'zzcl',
  pinyin: 'zhenzhichangliang',
  keywords: [
    'TRUE',
    '逻辑',
    '真',
    '布尔'
  ],
  difficulty: 1,
  usageLevel: 5,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'TRUE() 直接返回逻辑值 TRUE，常配合 IF/AND/OR 使用，也可直接写 TRUE 不加括号。'
  },
  oneLiner: '返回逻辑真值 TRUE',
  summary: 'TRUE 就是逻辑世界的「是」。多数时候你不必显式调用它，IF 之类函数本身就返回 TRUE/FALSE；但当公式需要主动产出真值（比如做标志位、配合条件格式或数组运算）时，TRUE() 很方便。',
  syntax: {
    patternCn: '=TRUE()',
    patternEn: '=TRUE()',
    args: []
  },
  returnValue: '返回逻辑值 TRUE。',
  examples: [
    {
      title: '示例 1：直接返回真',
      scene: '需要一个恒为真的值。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=TRUE()',
      result: 'TRUE',
      explanation: '单元格显示 TRUE，右对齐（逻辑值特征）。'
    },
    {
      title: '示例 2：给 IF 当结果',
      scene: '条件成立时打勾。',
      dataTsv: '得分\t门槛\n85\t60',
      dataAnchor: 'A1',
      formula: '=IF(A2>B2,TRUE(),FALSE())',
      result: 'TRUE',
      explanation: '括号可省略，写 IF(A2>B2,TRUE,FALSE) 也行。'
    }
  ],
  pitfalls: [
    {
      title: '把 TRUE 当文本',
      reason: '用引号包成 "TRUE" 会变成文本，逻辑判断不认。',
      fix: '逻辑值不要加引号。',
      level: 'mid'
    },
    {
      title: '和 1 混用',
      reason: 'TRUE 在算术里等于 1，但本质仍是逻辑值，别和数值 1 等同处理。',
      fix: '需要数字时显式用 --TRUE 或 N()。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'false',
      kind: 'companion',
      why: 'FALSE 是 TRUE 的反面。'
    },
    {
      id: 'if',
      kind: 'companion',
      why: 'IF 的条件成立/不成立分别返回 TRUE/FALSE 分支。'
    },
    {
      id: 'and',
      kind: 'companion',
      why: 'AND/OR 产出 TRUE/FALSE 供判断使用。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [],
    template: '=TRUE()',
    cases: [
      {
        label: '直接返回真值',
        type: 'ok',
        values: {},
        expect: 'TRUE',
        note: 'TRUE() 恒返回逻辑真值 TRUE。',
      },
      {
        label: '再确认一次恒为真',
        type: 'ok',
        values: {},
        expect: 'TRUE',
        note: '无参数、无副作用，每次都得到 TRUE。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default trueEntry;
