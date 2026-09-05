import type { FunctionEntry } from '@/types';

/** 纵向拼接 · 把多个数组上下堆叠成一个大数组（lambda 类 B17 批次，Microsoft 365） */

const vstackEntry: FunctionEntry = {
  id: 'vstack',
  enName: 'VSTACK',
  zhName: '纵向拼接',
  zhCommon: ['VSTACK', '纵向拼接', '上下拼接'],
  alias: ['上下合并', '堆叠表格', '合并区域'],
  category: 'lambda',
  abbr: 'zxpj',
  pinyin: 'zongxiangpinjie',
  keywords: ['VSTACK', '纵向拼接', '合并行', '堆叠', '动态数组'],
  difficulty: 2,
  usageLevel: 52,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把多个数组上下堆叠成一个大数组',
  summary: 'VSTACK(数组1, [数组2]…) 把若干区域纵向堆在一起，列数以最宽的为准（列数不同时缺位补 #N/A）。它是「多表合并」的标准解法：把 1 月、2 月、3 月的明细表堆成一张总表，之后统计只需针对这一张。相比 Power Query，VSTACK 的优势是纯公式、实时更新。',
  syntax: {
    patternCn: '=VSTACK(数组1, [数组2]…)',
    patternEn: '=VSTACK(array1, [array2], …)',
    args: [
      {
      key: 'array1',
      zh: '数组1',
      en: 'array1',
      required: true,
      desc: '放在最上面的数组。',
      example: 'A2:C5'
    },
      {
      key: 'array2',
      zh: '数组2',
      en: 'array2',
      required: false,
      desc: '依次向下堆叠的数组，可继续追加。',
      example: 'A8:C11',
      tip: '⚠️ 各数组列数应一致，不同则缺位补 #N/A。'
    }
    ]
  },
  returnValue: '返回纵向堆叠后的数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：合并两个月的明细',
    scene: '把 1 月、2 月明细堆成总表。',
    dataTsv: '1月姓名\t1月额\t2月姓名\t2月额\n张三\t800\t李四\t300',
    dataAnchor: 'A1',
    formula: '=VSTACK(A2:B2, C2:D2)',
    result: '两行两列：张三/800 与 李四/300',
    explanation: '两段区域列数相同，直接上下堆叠。这是多表合并最省事的写法。'
  },
    {
    title: '示例 2：给总表加表头',
    scene: '堆叠时手动补一行标题。',
    dataTsv: '姓名\t金额\n张三\t800\n李四\t300',
    dataAnchor: 'A1',
    formula: '=VSTACK({"姓名","金额"}, A2:B3)',
    result: '三行两列，第一行为标题',
    explanation: '用数组常量 {"姓名","金额"} 当表头，一次得到带标题的总表。'
  }
  ],
  pitfalls: [
    {
    title: '各数组列数不一致',
    reason: '列数不同时，窄的那几行右侧会补 #N/A，而不是报错，容易漏检。',
    fix: '用 EXPAND 或 CHOOSECOLS 把列数统一再堆叠。',
    level: 'high',
    errorCode: '#N/A'
  },
    {
    title: '重复表头也被堆进来',
    reason: '每张分表都带表头，VSTACK 会把表头也当成数据行堆进去。',
    fix: '引用数据区时跳过表头行（从 A2 起），或堆完用 DROP/FILTER 去掉标题行。',
    level: 'high'
  },
    {
    title: '溢出区域被占住',
    reason: '堆叠后行数变多，下方单元格有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'hstack',
    kind: 'companion',
    why: 'HSTACK 是左右拼接版本。'
  },
    {
    id: 'drop',
    kind: 'companion',
    why: '堆叠后常用 DROP 去掉多余表头行。'
  },
    {
    id: 'tocol',
    kind: 'alternative',
    why: '只要一列合并结果可用 TOCOL 拉平。'
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

export default vstackEntry;
