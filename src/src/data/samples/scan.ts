import type { FunctionEntry } from '@/types';

/** 累积过程 · 像 REDUCE 一样累积，但把每一步的结果都留下来（lambda 类 B16 批次，Microsoft 365） */

const scanEntry: FunctionEntry = {
  id: 'scan',
  enName: 'SCAN',
  zhName: '累积过程',
  zhCommon: ['SCAN', '累积过程', '累计'],
  alias: ['累计数组', '累积轨迹', '逐行累计'],
  category: 'lambda',
  abbr: 'ljgc',
  pinyin: 'leijiguocheng',
  keywords: ['SCAN', '累积', '累计余额', '过程数组', 'LAMBDA'],
  difficulty: 3,
  usageLevel: 28,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '像 REDUCE 一样累积，但把每一步的结果都留下来',
  summary: 'SCAN 与 REDUCE 的累积逻辑完全一样，区别是：REDUCE 只返回最终的单个值，SCAN 把每一步的累计值都返回，形成一个与原数组同尺寸的数组。这让「累计销售额」「滚动余额」「逐行累计占比」这类需求一个公式就能溢出完成，不用再写 SUM($A$2:A2) 然后下拉。',
  syntax: {
    patternCn: '=SCAN([初始值], 数组, LAMBDA(累计值, 当前元素, 计算式))',
    patternEn: '=SCAN([initial_value], array, LAMBDA(accumulator, value, calculation))',
    args: [
      {
      key: 'initial_value',
      zh: '初始值',
      en: 'initial_value',
      required: false,
      desc: '累积起点，省略时取数组第一个元素。',
      example: '0'
    },
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要遍历的区域或数组。',
      example: 'B2:B6'
    },
      {
      key: 'lambda',
      zh: 'LAMBDA',
      en: 'LAMBDA(accumulator, value, …)',
      required: true,
      desc: '固定两参数，返回新的累计值。',
      example: 'LAMBDA(acc, x, acc+x)'
    }
    ]
  },
  returnValue: '返回每一步累积值组成的数组（与原数组同尺寸，自动溢出）。',
  examples: [
    {
    title: '示例 1：累计销售额',
    scene: '逐月累计，不想写 SUM($B$2:B2) 再下拉。',
    dataTsv: '月份\t销售额\n1\t120\n2\t240\n3\t100',
    dataAnchor: 'A1',
    formula: '=SCAN(0, B2:B4, LAMBDA(acc, x, acc+x))',
    result: '溢出为 {120; 360; 460}',
    explanation: '一个公式溢出整列累计值，插入新月份也自动跟着走，不用改公式。'
  },
    {
    title: '示例 2：滚动余额',
    scene: '收入为正、支出为负，看每次变动后的余额。',
    dataTsv: '事项\t变动\n期初\t1000\n进货\t-300\n销售\t500',
    dataAnchor: 'A1',
    formula: '=SCAN(0, B2:B4, LAMBDA(acc, x, acc+x))',
    result: '溢出为 {1000; 700; 1200}',
    explanation: '这就是「期初 + 逐笔变动」的滚动余额，一个公式搞定，比辅助列更不容易出错。'
  }
  ],
  pitfalls: [
    {
    title: '和 REDUCE 搞混',
    reason: '只要最终总数却用了 SCAN，会溢出一大片结果，反而添乱。',
    fix: '只要一个数用 REDUCE；要过程数组用 SCAN。',
    level: 'high'
  },
    {
    title: '初始值重复计入',
    reason: 'SCAN 从初始值开始，第一次就把初始值+第一个元素算出去了；若数组首元素本身就是起点，会重复加一次。',
    fix: '确认初始值语义：从 0 起算就写 0；若首行已是起点，可省略初始值。',
    level: 'mid'
  },
    {
    title: '溢出区域被挡住',
    reason: '结果数组要占用的单元格里有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'reduce',
    kind: 'alternative',
    why: '只要最终值用 REDUCE。'
  },
    {
    id: 'byrow',
    kind: 'companion',
    why: 'BYROW 逐行聚合，SCAN 是逐元素累积。'
  },
    {
    id: 'sum',
    kind: 'companion',
    why: 'SUM 只能给总数，SCAN 给完整轨迹。'
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

export default scanEntry;
