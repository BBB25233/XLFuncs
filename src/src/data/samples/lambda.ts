import type { FunctionEntry } from '@/types';

/** 自定义函数 · 把一段公式封装成可以反复调用的函数（lambda 类 B16 批次，Microsoft 365） */

const lambdaEntry: FunctionEntry = {
  id: 'lambda',
  enName: 'LAMBDA',
  zhName: '自定义函数',
  zhCommon: ['LAMBDA', '自定义函数', '自己造函数'],
  alias: ['自造函数', '公式封装', '命名公式'],
  category: 'lambda',
  abbr: 'zdyhs',
  pinyin: 'zidingyihanshu',
  keywords: ['LAMBDA', '自定义函数', '封装公式', '名称管理器', '递归'],
  difficulty: 3,
  usageLevel: 62,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把一段公式封装成可以反复调用的函数',
  summary: 'LAMBDA 让你把「输入参数 → 计算过程」封装成一个自己的函数。用法是 =LAMBDA(参数1, 参数2, …, 计算式)，最后一个参数必须是计算式本身。它单独写没有意义，真正用法有两种：一是直接跟参数调用，二是在「公式 → 名称管理器」里给它命名，之后全工作簿都能像内置函数一样用。它还能递归调用自己（先命名，再在公式里引用该名称），用来算阶乘、遍历层级这类问题。',
  syntax: {
    patternCn: '=LAMBDA(参数1, [参数2]…, 计算式)',
    patternEn: '=LAMBDA(parameter1, [parameter2], …, calculation)',
    args: [
      {
      key: 'parameter1',
      zh: '参数1',
      en: 'parameter1',
      required: true,
      desc: '要传入的值，可以是单元格、区域或常量。',
      example: 'x',
      tip: '参数名不能和单元格地址撞车，别写 A1。'
    },
      {
      key: 'parameter2',
      zh: '参数2',
      en: 'parameter2',
      required: false,
      desc: '可继续追加参数，最多 253 个。',
      example: 'y'
    },
      {
      key: 'calculation',
      zh: '计算式',
      en: 'calculation',
      required: true,
      desc: '最后一个参数，是真正返回结果的公式，必须能算出具体值。',
      example: 'x+y',
      tip: '⚠️ 必须是最后一个参数，且不能是区域引用就完事。'
    }
    ]
  },
  returnValue: '返回「计算式」的结果；参数不足或计算式出错时返回 #VALUE! / #CALC!。',
  examples: [
    {
    title: '示例 1：直接调用（传参写法）',
    scene: '把「含税价 = 单价 ×(1+税率)」封装起来当场用。',
    dataTsv: '单价\t税率\n100\t0.13\n250\t0.13',
    dataAnchor: 'A1',
    formula: '=LAMBDA(price, rate, price*(1+rate))(A2, B2)',
    result: '113（100×1.13）',
    explanation: 'LAMBDA(...) 后面紧跟一对括号把实参传进去，这叫「立即调用」。适合临时用一次、不值得命名的场景。'
  },
    {
    title: '示例 2：命名后全表复用（推荐）',
    scene: '在名称管理器里新建名称「含税价」，引用位置写 =LAMBDA(price, rate, price*(1+rate))，然后单元格直接用。',
    dataTsv: '单价\t税率\n100\t0.13\n250\t0.13',
    dataAnchor: 'A1',
    formula: '=含税价(A2, B2)',
    result: '113，下拉即得 282.5（250×1.13）',
    explanation: '命名之后它就跟内置函数一模一样，可以下拉、可以在别的公式里嵌套。这是 LAMBDA 最主流、最值得投资的用法。'
  },
    {
    title: '示例 3：递归算阶乘',
    scene: '先定义名称「阶乘」= LAMBDA(n, IF(n<=1, 1, n*阶乘(n-1)))，再调用。',
    dataTsv: 'n\n5\n6',
    dataAnchor: 'A1',
    formula: '=阶乘(A2)',
    result: '120（5!）',
    explanation: 'LAMBDA 可以在自己的计算式里引用已被命名的自己，实现递归。务必留好终止条件（这里是 n<=1 返回 1），否则会无限递归报 #NUM!。'
  }
  ],
  pitfalls: [
    {
    title: '只写 LAMBDA 不传参，直接回车',
    reason: 'LAMBDA 本身只是一个「函数对象」，不传参调用它就返回 #CALC!，很多人以为公式写错了。',
    fix: '要么在后面紧跟 (实参) 立即调用，要么去名称管理器命名后按名字调用。',
    level: 'high',
    errorCode: '#CALC!'
  },
    {
    title: '参数名用了单元格地址',
    reason: '把参数命名成 A1、B2 这种，Excel 会把它当单元格引用而不是参数，结果全乱。',
    fix: '参数名用有意义的英文/拼音，如 price、rate、x、y，且避开 A1 样式。',
    level: 'high'
  },
    {
    title: '递归没有终止条件',
    reason: '递归 LAMBDA 缺少 IF 出口会一直调用自己，最终报错。',
    fix: '每个递归都要有明确的基线条件，如 IF(n<=1, 1, …)。',
    level: 'mid',
    errorCode: '#NUM!'
  }
  ],
  related: [
    {
    id: 'let',
    kind: 'companion',
    why: 'LET 在单个公式内命名中间结果，是 LAMBDA 的轻量替代。'
  },
    {
    id: 'map',
    kind: 'companion',
    why: 'MAP 把 LAMBDA 套用到数组每个元素上。'
  },
    {
    id: 'makearray',
    kind: 'companion',
    why: 'MAKEARRAY 用 LAMBDA 逐格计算生成数组。'
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

export default lambdaEntry;
