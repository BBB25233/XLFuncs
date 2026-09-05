import type { FunctionEntry } from '@/types';

/** 累积汇总 · 把一整片数据按规则一步步累积，最终算出一个值（lambda 类 B16 批次，Microsoft 365） */

const reduceEntry: FunctionEntry = {
  id: 'reduce',
  enName: 'REDUCE',
  zhName: '累积汇总',
  zhCommon: ['REDUCE', '累积', '归约'],
  alias: ['归约', '聚合计算', '折叠'],
  category: 'lambda',
  abbr: 'ljhz',
  pinyin: 'leijihuizong',
  keywords: ['REDUCE', '累积', '归约', '聚合', 'LAMBDA'],
  difficulty: 3,
  usageLevel: 36,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把一整片数据按规则一步步累积，最终算出一个值',
  summary: 'REDUCE 从「初始值」出发，拿着 LAMBDA(累计值, 当前元素) 依次遍历数组，把结果累积下去，最后返回单个值。它是求和、计数、拼接字符串、找最大最小等聚合操作的通用引擎——SUM 能做的事它都能做，还能做 SUM 做不到的自定义聚合（比如「只累加满足条件且转换后的值」）。要保留每一步的中间结果请改用 SCAN。',
  syntax: {
    patternCn: '=REDUCE([初始值], 数组, LAMBDA(累计值, 当前元素, 计算式))',
    patternEn: '=REDUCE([initial_value], array, LAMBDA(accumulator, value, calculation))',
    args: [
      {
      key: 'initial_value',
      zh: '初始值',
      en: 'initial_value',
      required: false,
      desc: '累积的起点，省略时取数组第一个元素。',
      example: '0',
      tip: '累加用 0、累乘用 1、拼接用 ""。'
    },
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要遍历的区域或数组。',
      example: 'A2:A6'
    },
      {
      key: 'lambda',
      zh: 'LAMBDA',
      en: 'LAMBDA(accumulator, value, …)',
      required: true,
      desc: '固定两个参数：累计值、当前元素，返回新的累计值。',
      example: 'LAMBDA(acc, x, acc+x)'
    }
    ]
  },
  returnValue: '返回累积后的单个值。',
  examples: [
    {
    title: '示例 1：自己实现求和',
    scene: '把一列数字累加起来。',
    dataTsv: '金额\n120\n240\n100',
    dataAnchor: 'A1',
    formula: '=REDUCE(0, A2:A4, LAMBDA(acc, x, acc+x))',
    result: '460',
    explanation: '从 0 开始，依次加 120、240、100。教学意义上等价于 SUM，但逻辑完全由你掌控。'
  },
    {
    title: '示例 2：条件聚合（SUM 做不到的事）',
    scene: '只累加超过 150 的金额，且先打 9 折。',
    dataTsv: '金额\n120\n240\n100\n300',
    dataAnchor: 'A1',
    formula: '=REDUCE(0, A2:A5, LAMBDA(acc, x, IF(x>150, acc+x*0.9, acc)))',
    result: '486（240×0.9 + 300×0.9）',
    explanation: '「先筛选再换算再累加」这种复合逻辑，用 REDUCE 一次写完，不必加辅助列。'
  }
  ],
  pitfalls: [
    {
    title: '初始值选错',
    reason: '累加用 1、累乘用 0，结果完全不对，而且不报错，很难发现。',
    fix: '累加/计数从 0 开始，累乘从 1 开始，字符串拼接从 "" 开始。',
    level: 'high'
  },
    {
    title: 'LAMBDA 写成三个参数',
    reason: 'REDUCE 的 LAMBDA 固定两参数（累计值、当前元素），写错参数个数会报错。',
    fix: '严格写 LAMBDA(acc, x, …)。',
    level: 'high',
    errorCode: '#VALUE!'
  },
    {
    title: '想要中间过程却用了 REDUCE',
    reason: 'REDUCE 只给最终结果，中间每一步都丢掉了。',
    fix: '要看累积轨迹（如累计余额）改用 SCAN。',
    level: 'mid'
  }
  ],
  related: [
    {
    id: 'scan',
    kind: 'alternative',
    why: 'SCAN 保留每一步累积值，返回数组。'
  },
    {
    id: 'map',
    kind: 'companion',
    why: 'MAP 逐元素变换，REDUCE 聚合成单值。'
  },
    {
    id: 'sum',
    kind: 'companion',
    why: '简单求和直接用 SUM 更快。'
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

export default reduceEntry;
