import type { FunctionEntry } from '@/types';

/** 排序 · 对一个区域排序，结果自动溢出，源数据变了结果跟着变（lambda 类 B16 批次，Microsoft 365） */

const sortEntry: FunctionEntry = {
  id: 'sort',
  enName: 'SORT',
  zhName: '排序',
  zhCommon: ['SORT', '排序', '动态排序'],
  alias: ['排序溢出', '自动排序', '数组排序'],
  category: 'lambda',
  abbr: 'px',
  pinyin: 'paixu',
  keywords: ['SORT', '排序', '升序', '降序', '动态数组'],
  difficulty: 2,
  usageLevel: 70,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '对一个区域排序，结果自动溢出，源数据变了结果跟着变',
  summary: 'SORT 把区域按指定列排序后溢出到新位置，不改变源数据。它是动态的：源数据一改，排序结果立刻重排，再也不用手动点「排序」按钮。=SORT(数组, [排序列号], [排序顺序], [按列排序])，排序列号指按第几列排（省略为第 1 列），排序顺序 1=升序、-1=降序（默认升序），第四参数 TRUE 表示按列排序而不是按行。',
  syntax: {
    patternCn: '=SORT(数组, [排序列号], [排序顺序], [按列排序])',
    patternEn: '=SORT(array, [sort_index], [sort_order], [by_col])',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要排序的区域。',
      example: 'A2:C10'
    },
      {
      key: 'sort_index',
      zh: '排序列号',
      en: 'sort_index',
      required: false,
      desc: '按区域内第几列排序，从 1 开始；省略为 1。',
      example: '3',
      tip: '针对「传入区域」内部列号，不是工作表列号。'
    },
      {
      key: 'sort_order',
      zh: '排序顺序',
      en: 'sort_order',
      required: false,
      desc: '1=升序（默认），-1=降序。',
      example: '-1'
    },
      {
      key: 'by_col',
      zh: '按列排序',
      en: 'by_col',
      required: false,
      desc: 'FALSE（默认）按行排序；TRUE 按列排序。',
      example: 'FALSE'
    }
    ]
  },
  returnValue: '返回排序后的数组（自动溢出），源数据不变。',
  examples: [
    {
    title: '示例 1：按销售额降序',
    scene: '把销售榜按第 3 列从高到低排。',
    dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
    dataAnchor: 'A1',
    formula: '=SORT(A2:C4, 3, -1)',
    result: '王五/华东/1200、张三/华东/800、李四/华北/300',
    explanation: '第 2 参数 3 表示按区域内第 3 列排，-1 是降序。源数据顺序不受影响。'
  },
    {
    title: '示例 2：只排单列',
    scene: '把一列数字从小到大排。',
    dataTsv: '分数\n88\n95\n72',
    dataAnchor: 'A1',
    formula: '=SORT(A2:A4)',
    result: '{72; 88; 95}',
    explanation: '单列时省略排序列号与顺序即可，默认升序。'
  }
  ],
  pitfalls: [
    {
    title: '排序列号写成了工作表列号',
    reason: '第 2 参数是「传入区域内的第几列」，不是 C 列=3 这种工作表列号；区域从第 B 列开始时两者会错位。',
    fix: '数区域内是第几列，从 1 开始数。',
    level: 'high'
  },
    {
    title: '想按另一列排却找不到',
    reason: 'SORT 只能按「数组内部」的列排序；按数组之外的列排要用 SORTBY。',
    fix: '按外部列排序改用 SORTBY。',
    level: 'high'
  },
    {
    title: '溢出区域被占住',
    reason: '结果溢出位置有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'sortby',
    kind: 'alternative',
    why: '按数组之外的列排序用 SORTBY。'
  },
    {
    id: 'filter',
    kind: 'companion',
    why: '先 FILTER 再 SORT 是最常见组合。'
  },
    {
    id: 'unique',
    kind: 'companion',
    why: 'UNIQUE 去重后常接 SORT。'
  }
  ],
  calc: {
    enabled: false,
    ranges: {},
    fields: [],
    template: '',
    cases: []
  },
  meta: {
    updatedAt: '2026-09-01',
    status: 'published',
    customEdited: false
  }
};

export default sortEntry;
