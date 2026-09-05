/**
 * B16 内容生成器：LAMBDA 与动态数组类 12 个函数 → src/data/samples/<id>.ts
 * 只负责生成文件；pack 注册与 catalog 由主理人统一并入。
 */
import { writeFileSync } from 'node:fs';

function q(s) {
  return (
    "'" +
    String(s)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t') +
    "'"
  );
}
const ID_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function ser(v, indent) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const items = v.map((x) => ser(x, indent));
    const one = '[' + items.join(', ') + ']';
    if (one.length + indent.length <= 110) return one;
    return '[\n' + items.map((x) => indent + '  ' + x).join(',\n') + '\n' + indent + ']';
  }
  if (typeof v === 'object') {
    const ks = Object.keys(v);
    if (ks.length === 0) return '{}';
    const body = ks
      .map((k) => {
        const kk = ID_RE.test(k) ? k : q(k);
        return indent + '  ' + kk + ': ' + ser(v[k], indent + '  ');
      })
      .join(',\n');
    return '{\n' + body + '\n' + indent + '}';
  }
  if (typeof v === 'string') return q(v);
  return String(v);
}

const V = { min: '365', label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）' };
const META = { updatedAt: '2026-09-01', status: 'published', customEdited: false };
const CALC = { enabled: false, ranges: {}, fields: [], template: '', cases: [] };

const DATA = [
  {
    id: 'lambda',
    enName: 'LAMBDA',
    zhName: '自定义函数',
    zhCommon: ['LAMBDA', '自定义函数', '自己造函数'],
    alias: ['自造函数', '公式封装', '命名公式'],
    keywords: ['LAMBDA', '自定义函数', '封装公式', '名称管理器', '递归'],
    difficulty: 3,
    usageLevel: 62,
    oneLiner: '把一段公式封装成可以反复调用的函数',
    summary:
      'LAMBDA 让你把「输入参数 → 计算过程」封装成一个自己的函数。用法是 =LAMBDA(参数1, 参数2, …, 计算式)，最后一个参数必须是计算式本身。它单独写没有意义，真正用法有两种：一是直接跟参数调用，二是在「公式 → 名称管理器」里给它命名，之后全工作簿都能像内置函数一样用。它还能递归调用自己（先命名，再在公式里引用该名称），用来算阶乘、遍历层级这类问题。',
    syntax: {
      patternCn: '=LAMBDA(参数1, [参数2]…, 计算式)',
      patternEn: '=LAMBDA(parameter1, [parameter2], …, calculation)',
      args: [
        { key: 'parameter1', zh: '参数1', en: 'parameter1', required: true, desc: '要传入的值，可以是单元格、区域或常量。', example: 'x', tip: '参数名不能和单元格地址撞车，别写 A1。' },
        { key: 'parameter2', zh: '参数2', en: 'parameter2', required: false, desc: '可继续追加参数，最多 253 个。', example: 'y' },
        { key: 'calculation', zh: '计算式', en: 'calculation', required: true, desc: '最后一个参数，是真正返回结果的公式，必须能算出具体值。', example: 'x+y', tip: '⚠️ 必须是最后一个参数，且不能是区域引用就完事。' },
      ],
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
        explanation: 'LAMBDA(...) 后面紧跟一对括号把实参传进去，这叫「立即调用」。适合临时用一次、不值得命名的场景。',
      },
      {
        title: '示例 2：命名后全表复用（推荐）',
        scene: '在名称管理器里新建名称「含税价」，引用位置写 =LAMBDA(price, rate, price*(1+rate))，然后单元格直接用。',
        dataTsv: '单价\t税率\n100\t0.13\n250\t0.13',
        dataAnchor: 'A1',
        formula: '=含税价(A2, B2)',
        result: '113，下拉即得 282.5（250×1.13）',
        explanation: '命名之后它就跟内置函数一模一样，可以下拉、可以在别的公式里嵌套。这是 LAMBDA 最主流、最值得投资的用法。',
      },
      {
        title: '示例 3：递归算阶乘',
        scene: '先定义名称「阶乘」= LAMBDA(n, IF(n<=1, 1, n*阶乘(n-1)))，再调用。',
        dataTsv: 'n\n5\n6',
        dataAnchor: 'A1',
        formula: '=阶乘(A2)',
        result: '120（5!）',
        explanation: 'LAMBDA 可以在自己的计算式里引用已被命名的自己，实现递归。务必留好终止条件（这里是 n<=1 返回 1），否则会无限递归报 #NUM!。',
      },
    ],
    pitfalls: [
      { title: '只写 LAMBDA 不传参，直接回车', reason: 'LAMBDA 本身只是一个「函数对象」，不传参调用它就返回 #CALC!，很多人以为公式写错了。', fix: '要么在后面紧跟 (实参) 立即调用，要么去名称管理器命名后按名字调用。', level: 'high', errorCode: '#CALC!' },
      { title: '参数名用了单元格地址', reason: '把参数命名成 A1、B2 这种，Excel 会把它当单元格引用而不是参数，结果全乱。', fix: '参数名用有意义的英文/拼音，如 price、rate、x、y，且避开 A1 样式。', level: 'high' },
      { title: '递归没有终止条件', reason: '递归 LAMBDA 缺少 IF 出口会一直调用自己，最终报错。', fix: '每个递归都要有明确的基线条件，如 IF(n<=1, 1, …)。', level: 'mid', errorCode: '#NUM!' },
    ],
    related: [
      { id: 'let', kind: 'companion', why: 'LET 在单个公式内命名中间结果，是 LAMBDA 的轻量替代。' },
      { id: 'map', kind: 'companion', why: 'MAP 把 LAMBDA 套用到数组每个元素上。' },
      { id: 'makearray', kind: 'companion', why: 'MAKEARRAY 用 LAMBDA 逐格计算生成数组。' },
    ],
  },
  {
    id: 'let',
    enName: 'LET',
    zhName: '命名中间结果',
    zhCommon: ['LET', '变量', '中间结果'],
    alias: ['公式变量', '定义变量', '简化公式'],
    keywords: ['LET', '变量', '中间结果', '复用计算', '简化公式'],
    difficulty: 2,
    usageLevel: 58,
    oneLiner: '在公式里给中间结果起个名字，避免重复算、重复写',
    summary:
      'LET 让你在一个公式内部定义「变量」：=LET(名称1, 值1, [名称2, 值2]…, 计算式)。最后一项是返回结果的计算式，前面的名字可以在后面随便引用。它有两个实打实的好处：一是同一段计算只算一次（性能更好），二是长公式变得能读懂。以前要靠辅助列或者把同一段 VLOOKUP 抄三遍的地方，用 LET 都能清爽解决。',
    syntax: {
      patternCn: '=LET(名称1, 值1, [名称2, 值2]…, 计算式)',
      patternEn: '=LET(name1, value1, [name2, value2], …, calculation)',
      args: [
        { key: 'name1', zh: '名称1', en: 'name1', required: true, desc: '给中间结果起的名字，必须成对出现。', example: '小计', tip: '名字不能和单元格地址冲突。' },
        { key: 'value1', zh: '值1', en: 'value1', required: true, desc: '这个变量代表的值，可以是常量或任意公式。', example: 'A2*B2' },
        { key: 'calculation', zh: '计算式', en: 'calculation', required: true, desc: '最后一个参数，使用前面定义的名字算出最终结果。', example: '小计*1.13' },
      ],
    },
    returnValue: '返回「计算式」的结果。',
    examples: [
      {
        title: '示例 1：同一段计算只算一次',
        scene: '含税价要判断是否超过起征点，小计被用了两次。',
        dataTsv: '单价\t数量\n12\t10\n8\t30',
        dataAnchor: 'A1',
        formula: '=LET(小计, A2*B2, 税额, 小计*0.13, IF(小计>200, 小计+税额, 小计))',
        result: '120（小计 120 未超 200，不计税）',
        explanation: '小计只算了一次却被引用三次。不用 LET 的话 A2*B2 要抄三遍，既慢又容易改漏。',
      },
      {
        title: '示例 2：让长公式能读懂',
        scene: '把一串嵌套判断拆成有名字的步骤。',
        dataTsv: '月份\t销售额\n1\t120\n2\t80\n3\t200',
        dataAnchor: 'A1',
        formula: '=LET(总额, SUM(B2:B4), 平均, AVERAGE(B2:B4), 总额&" / 平均 "&ROUND(平均,1))',
        result: '400 / 平均 133.3',
        explanation: '每个中间量都有名字，别人（和三个月后的你）一眼能看懂公式在干什么。',
      },
    ],
    pitfalls: [
      { title: '参数个数写成奇数', reason: 'LET 要求「名字/值」成对，最后再跟一个计算式。少写一个值，Excel 直接拒绝公式。', fix: '检查参数个数：变量数是偶数个，最后再加 1 个计算式。', level: 'high' },
      { title: '名字用了单元格地址', reason: '名称写成 A1、B2 会和真正的单元格引用混淆，Excel 会报错或取到错误的值。', fix: '用有意义的名字，如 小计、total、rate。', level: 'mid' },
      { title: '以为 LET 的变量能在别处用', reason: 'LET 定义的变量只在当前这一个公式内有效，换个单元格就失效。', fix: '要跨单元格复用请用「名称管理器 + LAMBDA」。', level: 'mid' },
    ],
    related: [
      { id: 'lambda', kind: 'companion', why: 'LAMBDA 把逻辑封装成可跨单元格复用的函数。' },
      { id: 'if', kind: 'companion', why: '判断类公式配合 LET 能大幅瘦身。' },
      { id: 'sum', kind: 'companion', why: '聚合结果常作为 LET 的中间变量。' },
    ],
  },
  {
    id: 'map',
    enName: 'MAP',
    zhName: '逐元素变换',
    zhCommon: ['MAP', '逐元素', '批量映射'],
    alias: ['映射', '逐项处理', '数组变换'],
    keywords: ['MAP', '逐元素', '映射', '数组变换', 'LAMBDA'],
    difficulty: 3,
    usageLevel: 44,
    oneLiner: '对数组里每个元素套用同一段计算，返回一个同形状的数组',
    summary:
      'MAP 把 LAMBDA 依次作用到数组的每一个元素上，返回的结果数组与原数组行数列数完全一致。它是「我要对这一整片数据做同一个操作」的标准答案，替代了过去要写辅助列再下拉的做法。MAP 一次只能处理一个数组（要两个数组请配 MAP 的两个参数写法或用别的函数组合），LAMBDA 的参数与传入数组一一对应。',
    syntax: {
      patternCn: '=MAP(数组1, [数组2]…, LAMBDA(参数…, 计算式))',
      patternEn: '=MAP(array1, [array2], …, LAMBDA(parameter, calculation))',
      args: [
        { key: 'array1', zh: '数组1', en: 'array1', required: true, desc: '要逐项处理的区域或数组。', example: 'A2:A6' },
        { key: 'lambda', zh: 'LAMBDA', en: 'LAMBDA(parameter, calculation)', required: true, desc: '对每个元素执行的计算，参数个数要与传入数组个数一致。', example: 'LAMBDA(x, x*1.13)' },
      ],
    },
    returnValue: '返回一个与原数组尺寸相同的结果数组（会自动溢出）。',
    examples: [
      {
        title: '示例 1：整列统一加价',
        scene: '一批单价统一上调 13%。',
        dataTsv: '单价\n100\n250\n80',
        dataAnchor: 'A1',
        formula: '=MAP(A2:A4, LAMBDA(x, x*1.13))',
        result: '溢出为 {113; 282.5; 90.4} 一列',
        explanation: '一个公式算出整列结果并自动溢出到下方单元格，不需要下拉填充。',
      },
      {
        title: '示例 2：两个数组对应运算',
        scene: '单价 × 数量 逐行相乘。',
        dataTsv: '单价\t数量\n12\t10\n8\t30\n25\t4',
        dataAnchor: 'A1',
        formula: '=MAP(A2:A4, B2:B4, LAMBDA(p, q, p*q))',
        result: '溢出为 {120; 240; 100}',
        explanation: '传两个数组时 LAMBDA 就要有两个参数，按顺序一一对应。两个数组尺寸必须一致，否则报 #VALUE!。',
      },
    ],
    pitfalls: [
      { title: 'LAMBDA 参数个数与数组个数不匹配', reason: '传了两个数组却只写一个参数（或反过来），Excel 直接报错。', fix: '保持「数组个数 == LAMBDA 参数个数」。', level: 'high', errorCode: '#VALUE!' },
      { title: '结果区域被占住导致溢出失败', reason: 'MAP 的结果要溢出到下方/右方单元格，那些格子若有内容就会挡住。', fix: '清空结果区域，或把公式放到空白处。', level: 'high', errorCode: '#SPILL!' },
      { title: '想「汇总成一个值」却用了 MAP', reason: 'MAP 是逐元素变换，返回同尺寸数组；要聚合成单个值该用 REDUCE。', fix: '汇总用 REDUCE，保留中间过程用 SCAN。', level: 'mid' },
    ],
    related: [
      { id: 'reduce', kind: 'alternative', why: '要把数组聚合成单个值用 REDUCE。' },
      { id: 'scan', kind: 'alternative', why: '要保留每一步累积结果用 SCAN。' },
      { id: 'byrow', kind: 'companion', why: 'BYROW 是「逐行」版本，MAP 是「逐元素」。' },
    ],
  },
  {
    id: 'reduce',
    enName: 'REDUCE',
    zhName: '累积汇总',
    zhCommon: ['REDUCE', '累积', '归约'],
    alias: ['归约', '聚合计算', '折叠'],
    keywords: ['REDUCE', '累积', '归约', '聚合', 'LAMBDA'],
    difficulty: 3,
    usageLevel: 36,
    oneLiner: '把一整片数据按规则一步步累积，最终算出一个值',
    summary:
      'REDUCE 从「初始值」出发，拿着 LAMBDA(累计值, 当前元素) 依次遍历数组，把结果累积下去，最后返回单个值。它是求和、计数、拼接字符串、找最大最小等聚合操作的通用引擎——SUM 能做的事它都能做，还能做 SUM 做不到的自定义聚合（比如「只累加满足条件且转换后的值」）。要保留每一步的中间结果请改用 SCAN。',
    syntax: {
      patternCn: '=REDUCE([初始值], 数组, LAMBDA(累计值, 当前元素, 计算式))',
      patternEn: '=REDUCE([initial_value], array, LAMBDA(accumulator, value, calculation))',
      args: [
        { key: 'initial_value', zh: '初始值', en: 'initial_value', required: false, desc: '累积的起点，省略时取数组第一个元素。', example: '0', tip: '累加用 0、累乘用 1、拼接用 ""。' },
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要遍历的区域或数组。', example: 'A2:A6' },
        { key: 'lambda', zh: 'LAMBDA', en: 'LAMBDA(accumulator, value, …)', required: true, desc: '固定两个参数：累计值、当前元素，返回新的累计值。', example: 'LAMBDA(acc, x, acc+x)' },
      ],
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
        explanation: '从 0 开始，依次加 120、240、100。教学意义上等价于 SUM，但逻辑完全由你掌控。',
      },
      {
        title: '示例 2：条件聚合（SUM 做不到的事）',
        scene: '只累加超过 150 的金额，且先打 9 折。',
        dataTsv: '金额\n120\n240\n100\n300',
        dataAnchor: 'A1',
        formula: '=REDUCE(0, A2:A5, LAMBDA(acc, x, IF(x>150, acc+x*0.9, acc)))',
        result: '486（240×0.9 + 300×0.9）',
        explanation: '「先筛选再换算再累加」这种复合逻辑，用 REDUCE 一次写完，不必加辅助列。',
      },
    ],
    pitfalls: [
      { title: '初始值选错', reason: '累加用 1、累乘用 0，结果完全不对，而且不报错，很难发现。', fix: '累加/计数从 0 开始，累乘从 1 开始，字符串拼接从 "" 开始。', level: 'high' },
      { title: 'LAMBDA 写成三个参数', reason: 'REDUCE 的 LAMBDA 固定两参数（累计值、当前元素），写错参数个数会报错。', fix: '严格写 LAMBDA(acc, x, …)。', level: 'high', errorCode: '#VALUE!' },
      { title: '想要中间过程却用了 REDUCE', reason: 'REDUCE 只给最终结果，中间每一步都丢掉了。', fix: '要看累积轨迹（如累计余额）改用 SCAN。', level: 'mid' },
    ],
    related: [
      { id: 'scan', kind: 'alternative', why: 'SCAN 保留每一步累积值，返回数组。' },
      { id: 'map', kind: 'companion', why: 'MAP 逐元素变换，REDUCE 聚合成单值。' },
      { id: 'sum', kind: 'companion', why: '简单求和直接用 SUM 更快。' },
    ],
  },
  {
    id: 'scan',
    enName: 'SCAN',
    zhName: '累积过程',
    zhCommon: ['SCAN', '累积过程', '累计'],
    alias: ['累计数组', '累积轨迹', '逐行累计'],
    keywords: ['SCAN', '累积', '累计余额', '过程数组', 'LAMBDA'],
    difficulty: 3,
    usageLevel: 28,
    oneLiner: '像 REDUCE 一样累积，但把每一步的结果都留下来',
    summary:
      'SCAN 与 REDUCE 的累积逻辑完全一样，区别是：REDUCE 只返回最终的单个值，SCAN 把每一步的累计值都返回，形成一个与原数组同尺寸的数组。这让「累计销售额」「滚动余额」「逐行累计占比」这类需求一个公式就能溢出完成，不用再写 SUM($A$2:A2) 然后下拉。',
    syntax: {
      patternCn: '=SCAN([初始值], 数组, LAMBDA(累计值, 当前元素, 计算式))',
      patternEn: '=SCAN([initial_value], array, LAMBDA(accumulator, value, calculation))',
      args: [
        { key: 'initial_value', zh: '初始值', en: 'initial_value', required: false, desc: '累积起点，省略时取数组第一个元素。', example: '0' },
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要遍历的区域或数组。', example: 'B2:B6' },
        { key: 'lambda', zh: 'LAMBDA', en: 'LAMBDA(accumulator, value, …)', required: true, desc: '固定两参数，返回新的累计值。', example: 'LAMBDA(acc, x, acc+x)' },
      ],
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
        explanation: '一个公式溢出整列累计值，插入新月份也自动跟着走，不用改公式。',
      },
      {
        title: '示例 2：滚动余额',
        scene: '收入为正、支出为负，看每次变动后的余额。',
        dataTsv: '事项\t变动\n期初\t1000\n进货\t-300\n销售\t500',
        dataAnchor: 'A1',
        formula: '=SCAN(0, B2:B4, LAMBDA(acc, x, acc+x))',
        result: '溢出为 {1000; 700; 1200}',
        explanation: '这就是「期初 + 逐笔变动」的滚动余额，一个公式搞定，比辅助列更不容易出错。',
      },
    ],
    pitfalls: [
      { title: '和 REDUCE 搞混', reason: '只要最终总数却用了 SCAN，会溢出一大片结果，反而添乱。', fix: '只要一个数用 REDUCE；要过程数组用 SCAN。', level: 'high' },
      { title: '初始值重复计入', reason: 'SCAN 从初始值开始，第一次就把初始值+第一个元素算出去了；若数组首元素本身就是起点，会重复加一次。', fix: '确认初始值语义：从 0 起算就写 0；若首行已是起点，可省略初始值。', level: 'mid' },
      { title: '溢出区域被挡住', reason: '结果数组要占用的单元格里有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'reduce', kind: 'alternative', why: '只要最终值用 REDUCE。' },
      { id: 'byrow', kind: 'companion', why: 'BYROW 逐行聚合，SCAN 是逐元素累积。' },
      { id: 'sum', kind: 'companion', why: 'SUM 只能给总数，SCAN 给完整轨迹。' },
    ],
  },
  {
    id: 'byrow',
    enName: 'BYROW',
    zhName: '逐行聚合',
    zhCommon: ['BYROW', '逐行', '按行汇总'],
    alias: ['按行计算', '每行一个结果', '行聚合'],
    keywords: ['BYROW', '逐行', '按行汇总', 'LAMBDA', '行聚合'],
    difficulty: 3,
    usageLevel: 34,
    oneLiner: '对每一行套用同一段计算，每行返回一个结果',
    summary:
      'BYROW 把数组的每一行当作一个整体交给 LAMBDA 处理，返回一个「行数 = 原行数」的单列数组。典型场景是每行求合计、每行找最大值、每行判断是否达标——过去要在最右列写公式再下拉，现在一个公式溢出整列。它和 MAP 的区别很关键：MAP 是逐「单元格」，BYROW 是逐「行」（你的 LAMBDA 拿到的是一整行数组）。',
    syntax: {
      patternCn: '=BYROW(数组, LAMBDA(行, 计算式))',
      patternEn: '=BYROW(array, LAMBDA(row, calculation))',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要逐行处理的区域。', example: 'A2:C6' },
        { key: 'lambda', zh: 'LAMBDA', en: 'LAMBDA(row, …)', required: true, desc: '接收「一行」作为参数，返回该行的单个结果。', example: 'LAMBDA(r, SUM(r))', tip: '⚠️ 参数 r 是一整行数组，不是单个值。' },
      ],
    },
    returnValue: '返回一个单列数组，元素个数 = 原数组行数（自动溢出）。',
    examples: [
      {
        title: '示例 1：每行求和',
        scene: '三个月销量按行合计。',
        dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
        dataAnchor: 'A1',
        formula: '=BYROW(B2:C3, LAMBDA(r, SUM(r)))',
        result: '溢出为 {320; 230}',
        explanation: 'LAMBDA 的 r 拿到的是整行（如 {120,200}），SUM(r) 就是这一行的合计。不用在 D 列写公式再下拉。',
      },
      {
        title: '示例 2：每行判断达标',
        scene: '任一个月超过 180 就算达标。',
        dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
        dataAnchor: 'A1',
        formula: '=BYROW(B2:C3, LAMBDA(r, IF(MAX(r)>=180, "达标", "未达标")))',
        result: '溢出为 {"达标"; "未达标"}',
        explanation: '逐行做判断并返回文本，结果同样溢出成一列。',
      },
    ],
    pitfalls: [
      { title: '把 LAMBDA 参数当成单个值用', reason: 'BYROW 传进来的是「一整行数组」，直接写 r*2 会返回数组而不是单值，导致结果溢出成多行。', fix: '在 LAMBDA 里用 SUM/MAX/AVERAGE 等把行聚合成单值。', level: 'high' },
      { title: '和 MAP 用反了', reason: 'MAP 逐单元格、BYROW 逐行；想逐单元格却用 BYROW，结果会莫名其妙。', fix: '逐单元格变换用 MAP，逐行聚合用 BYROW，逐列用 BYCOL。', level: 'high' },
      { title: '结果列被占住', reason: '溢出区域有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'bycol', kind: 'companion', why: 'BYCOL 是逐列版本。' },
      { id: 'map', kind: 'alternative', why: '逐单元格变换用 MAP。' },
      { id: 'sum', kind: 'companion', why: '行内求和最常用 SUM。' },
    ],
  },
  {
    id: 'bycol',
    enName: 'BYCOL',
    zhName: '逐列聚合',
    zhCommon: ['BYCOL', '逐列', '按列汇总'],
    alias: ['按列计算', '每列一个结果', '列聚合'],
    keywords: ['BYCOL', '逐列', '按列汇总', 'LAMBDA', '列聚合'],
    difficulty: 3,
    usageLevel: 26,
    oneLiner: '对每一列套用同一段计算，每列返回一个结果',
    summary:
      'BYCOL 是 BYROW 的「转置版」：把数组的每一列交给 LAMBDA，返回一个「列数 = 原列数」的单行数组。适合做每列求和、每列求平均、每列找最值这类横向汇总——结果横向溢出一行，正好放在数据下方做汇总行。',
    syntax: {
      patternCn: '=BYCOL(数组, LAMBDA(列, 计算式))',
      patternEn: '=BYCOL(array, LAMBDA(column, calculation))',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要逐列处理的区域。', example: 'B2:D6' },
        { key: 'lambda', zh: 'LAMBDA', en: 'LAMBDA(column, …)', required: true, desc: '接收「一列」作为参数，返回该列的单个结果。', example: 'LAMBDA(c, SUM(c))', tip: '⚠️ 参数 c 是一整列数组，不是单个值。' },
      ],
    },
    returnValue: '返回一个单行数组，元素个数 = 原数组列数（自动溢出）。',
    examples: [
      {
        title: '示例 1：每列求和',
        scene: '各月销量按列汇总成一行。',
        dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
        dataAnchor: 'A1',
        formula: '=BYCOL(B2:C3, LAMBDA(c, SUM(c)))',
        result: '横向溢出为 {200, 350}',
        explanation: '结果是一行，正好放在数据下方当汇总行用。',
      },
      {
        title: '示例 2：每列找最大值',
        scene: '看每个月的最高销量。',
        dataTsv: '姓名\t1月\t2月\n张三\t120\t200\n李四\t80\t150',
        dataAnchor: 'A1',
        formula: '=BYCOL(B2:C3, LAMBDA(c, MAX(c)))',
        result: '横向溢出为 {120, 200}',
        explanation: '逐列取最大，一个公式得到每月峰值。',
      },
    ],
    pitfalls: [
      { title: 'LAMBDA 参数当成单值', reason: '传进来的是一整列数组，不做聚合就返回数组，结果布局会乱。', fix: '用 SUM/MAX/AVERAGE 等把列聚合成单值。', level: 'high' },
      { title: '结果行被占住', reason: '横向溢出的单元格里有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
      { title: '和 BYROW 用反', reason: '想要每行一个结果却用了 BYCOL，方向就错了。', fix: '逐行用 BYROW，逐列用 BYCOL。', level: 'mid' },
    ],
    related: [
      { id: 'byrow', kind: 'companion', why: 'BYROW 是逐行版本。' },
      { id: 'map', kind: 'alternative', why: '逐单元格变换用 MAP。' },
      { id: 'sum', kind: 'companion', why: '列内求和最常用 SUM。' },
    ],
  },
  {
    id: 'makearray',
    enName: 'MAKEARRAY',
    zhName: '生成数组',
    zhCommon: ['MAKEARRAY', '生成数组', '构造数组'],
    alias: ['造数组', '按行列生成', '自定义矩阵'],
    keywords: ['MAKEARRAY', '生成数组', '矩阵', '乘法表', 'LAMBDA'],
    difficulty: 3,
    usageLevel: 22,
    oneLiner: '按行列下标逐格计算，凭空生成一个数组',
    summary:
      'MAKEARRAY(行数, 列数, LAMBDA(行号, 列号, 计算式)) 会遍历每一个位置，用你给的计算式算出该格的值，拼成一个数组。它是「凭空造表」的工具：乘法表、日程矩阵、坐标网格、批量编号都能做。LAMBDA 拿到的是当前格的行号与列号（从 1 开始），你可以用它们做任何运算。',
    syntax: {
      patternCn: '=MAKEARRAY(行数, 列数, LAMBDA(行号, 列号, 计算式))',
      patternEn: '=MAKEARRAY(rows, cols, LAMBDA(r, c, calculation))',
      args: [
        { key: 'rows', zh: '行数', en: 'rows', required: true, desc: '要生成的行数，必须 > 0。', example: '9' },
        { key: 'cols', zh: '列数', en: 'cols', required: true, desc: '要生成的列数，必须 > 0。', example: '9' },
        { key: 'lambda', zh: 'LAMBDA', en: 'LAMBDA(r, c, …)', required: true, desc: '接收当前行号、列号（均从 1 开始），返回该格的值。', example: 'LAMBDA(r, c, r*c)' },
      ],
    },
    returnValue: '返回指定行列的数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：九九乘法表',
        scene: '一次性生成整张乘法表。',
        dataTsv: '说明\n生成 9×9 乘法表',
        dataAnchor: 'A1',
        formula: '=MAKEARRAY(9, 9, LAMBDA(r, c, r*c))',
        result: '溢出为 9 行 9 列，第 r 行第 c 列 = r×c',
        explanation: '行号列号都从 1 开始，直接相乘即是乘法表。不用填 81 个公式。',
      },
      {
        title: '示例 2：批量生成编号/日期',
        scene: '生成 3 行 4 列的序号矩阵。',
        dataTsv: '说明\n生成 3×4 序号',
        dataAnchor: 'A1',
        formula: '=MAKEARRAY(3, 4, LAMBDA(r, c, (r-1)*4+c))',
        result: '溢出为 {1,2,3,4; 5,6,7,8; 9,10,11,12}',
        explanation: '用行列号推算线性序号，是批量造测试数据的常用写法。',
      },
    ],
    pitfalls: [
      { title: '行列数写成 0 或负数', reason: 'MAKEARRAY 要求行列数 > 0，否则报错。', fix: '确保行列数是正整数，需要动态计算时用 ROUNDUP 等处理。', level: 'high', errorCode: '#VALUE!' },
      { title: '以为行列号从 0 开始', reason: 'Excel 的 MAKEARRAY 行列号从 1 开始，按 0 起算会导致整体偏移一行一列。', fix: '记住 r、c 最小是 1；需要 0 基下标就写 (r-1)、(c-1)。', level: 'high' },
      { title: '生成超大数组拖慢表格', reason: '几千×几千的 MAKEARRAY 会瞬间产生百万级单元格，Excel 会卡死。', fix: '控制规模，或改用 SEQUENCE 等更轻量的方案。', level: 'mid' },
    ],
    related: [
      { id: 'sequence', kind: 'alternative', why: '只要一列/一行序列，SEQUENCE 更轻便。' },
      { id: 'map', kind: 'companion', why: 'MAP 变换已有数组，MAKEARRAY 从零生成。' },
      { id: 'expand', kind: 'companion', why: 'EXPAND 把已有数组扩到指定尺寸。' },
    ],
  },
  {
    id: 'filter',
    enName: 'FILTER',
    zhName: '筛选并溢出',
    zhCommon: ['FILTER', '筛选', '动态筛选'],
    alias: ['条件筛选', '溢出筛选', '动态过滤'],
    keywords: ['FILTER', '筛选', '过滤', '条件', '动态数组'],
    difficulty: 2,
    usageLevel: 78,
    oneLiner: '按条件筛出符合条件的行，结果自动溢出',
    summary:
      'FILTER 是动态数组时代的招牌函数：=FILTER(数组, 条件, [无结果时显示])，把条件为 TRUE 的行整行筛出来，结果自动溢出到下方。它彻底改变了「筛选」这件事——不用点筛选按钮、不用刷新、源数据一改结果立刻变。条件通常写成比较表达式（如 B2:B10>500），可以叠加多个条件（乘号 = 且，加号 = 或）。筛选不出结果时，第三个参数可以给出友好提示，否则返回 #CALC!。',
    syntax: {
      patternCn: '=FILTER(数组, 条件, [无结果时显示])',
      patternEn: '=FILTER(array, include, [if_empty])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要筛选的数据区域（可含多列）。', example: 'A2:C10' },
        { key: 'include', zh: '条件', en: 'include', required: true, desc: '与目标数组行数相同的布尔数组，TRUE 的行被保留。', example: 'C2:C10>500', tip: '多条件：乘号*表「且」，加号+表「或」。' },
        { key: 'if_empty', zh: '无结果时显示', en: 'if_empty', required: false, desc: '一行都筛不到时返回的内容，省略则报 #CALC!。', example: '"无匹配"', tip: '强烈建议填上，避免出现难懂的 #CALC!。' },
      ],
    },
    returnValue: '返回符合条件的行组成的数组（自动溢出）；无匹配且未给第三参数时返回 #CALC!。',
    examples: [
      {
        title: '示例 1：单条件筛选',
        scene: '筛出销售额超过 500 的记录。',
        dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
        dataAnchor: 'A1',
        formula: '=FILTER(A2:C4, C2:C4>500, "无匹配")',
        result: '溢出两行：张三/华东/800、王五/华东/1200',
        explanation: '条件数组 C2:C4>500 得到 {TRUE;FALSE;TRUE}，只有 TRUE 的行被保留。整行一起返回。',
      },
      {
        title: '示例 2：多条件（且）',
        scene: '华东且销售额超 500。',
        dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
        dataAnchor: 'A1',
        formula: '=FILTER(A2:C4, (B2:B4="华东")*(C2:C4>500), "无匹配")',
        result: '溢出两行：张三、王五',
        explanation: '两个布尔数组相乘即「且」。要「或」就把乘号换成加号 +。',
      },
    ],
    pitfalls: [
      { title: '条件数组行数与目标不一致', reason: '条件是 10 行、数据是 8 行，Excel 无法对应，直接报错。', fix: '确保条件区域与数据区域行数完全相同。', level: 'high', errorCode: '#VALUE!' },
      { title: '筛不到就报 #CALC!', reason: '条件太严时结果为空，没给第三参数就显示 #CALC!，看起来像公式坏了。', fix: '始终补上第三参数，如 "无匹配" 或 ""。', level: 'high', errorCode: '#CALC!' },
      { title: '溢出区域被占住', reason: '结果要溢出的下方单元格有内容（哪怕只是个空格）。', fix: '清空溢出区域；这是动态数组最常见的 #SPILL! 原因。', level: 'high', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'sort', kind: 'companion', why: '筛完常要排序，两者常嵌套使用。' },
      { id: 'unique', kind: 'companion', why: 'UNIQUE 去重，常与 FILTER 组合。' },
      { id: 'sortby', kind: 'companion', why: 'SORTBY 按另一列排序。' },
    ],
  },
  {
    id: 'sort',
    enName: 'SORT',
    zhName: '排序',
    zhCommon: ['SORT', '排序', '动态排序'],
    alias: ['排序溢出', '自动排序', '数组排序'],
    keywords: ['SORT', '排序', '升序', '降序', '动态数组'],
    difficulty: 2,
    usageLevel: 70,
    oneLiner: '对一个区域排序，结果自动溢出，源数据变了结果跟着变',
    summary:
      'SORT 把区域按指定列排序后溢出到新位置，不改变源数据。它是动态的：源数据一改，排序结果立刻重排，再也不用手动点「排序」按钮。=SORT(数组, [排序列号], [排序顺序], [按列排序])，排序列号指按第几列排（省略为第 1 列），排序顺序 1=升序、-1=降序（默认升序），第四参数 TRUE 表示按列排序而不是按行。',
    syntax: {
      patternCn: '=SORT(数组, [排序列号], [排序顺序], [按列排序])',
      patternEn: '=SORT(array, [sort_index], [sort_order], [by_col])',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要排序的区域。', example: 'A2:C10' },
        { key: 'sort_index', zh: '排序列号', en: 'sort_index', required: false, desc: '按区域内第几列排序，从 1 开始；省略为 1。', example: '3', tip: '针对「传入区域」内部列号，不是工作表列号。' },
        { key: 'sort_order', zh: '排序顺序', en: 'sort_order', required: false, desc: '1=升序（默认），-1=降序。', example: '-1' },
        { key: 'by_col', zh: '按列排序', en: 'by_col', required: false, desc: 'FALSE（默认）按行排序；TRUE 按列排序。', example: 'FALSE' },
      ],
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
        explanation: '第 2 参数 3 表示按区域内第 3 列排，-1 是降序。源数据顺序不受影响。',
      },
      {
        title: '示例 2：只排单列',
        scene: '把一列数字从小到大排。',
        dataTsv: '分数\n88\n95\n72',
        dataAnchor: 'A1',
        formula: '=SORT(A2:A4)',
        result: '{72; 88; 95}',
        explanation: '单列时省略排序列号与顺序即可，默认升序。',
      },
    ],
    pitfalls: [
      { title: '排序列号写成了工作表列号', reason: '第 2 参数是「传入区域内的第几列」，不是 C 列=3 这种工作表列号；区域从第 B 列开始时两者会错位。', fix: '数区域内是第几列，从 1 开始数。', level: 'high' },
      { title: '想按另一列排却找不到', reason: 'SORT 只能按「数组内部」的列排序；按数组之外的列排要用 SORTBY。', fix: '按外部列排序改用 SORTBY。', level: 'high' },
      { title: '溢出区域被占住', reason: '结果溢出位置有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'sortby', kind: 'alternative', why: '按数组之外的列排序用 SORTBY。' },
      { id: 'filter', kind: 'companion', why: '先 FILTER 再 SORT 是最常见组合。' },
      { id: 'unique', kind: 'companion', why: 'UNIQUE 去重后常接 SORT。' },
    ],
  },
  {
    id: 'sortby',
    enName: 'SORTBY',
    zhName: '按指定列排序',
    zhCommon: ['SORTBY', '按列排序', '依据排序'],
    alias: ['依据列排序', '外部列排序', '多关键字排序'],
    keywords: ['SORTBY', '排序', '多关键字', '依据列', '动态数组'],
    difficulty: 2,
    usageLevel: 48,
    oneLiner: '按另一个（或另几个）列的值来排序，支持多关键字',
    summary:
      'SORT 只能按数组内部的列排，SORTBY 可以按「任意等长的列」排，而且支持多个排序关键字依次生效。=SORTBY(数组, 依据列1, [顺序1], [依据列2, 顺序2]…)。这是它比 SORT 灵活的地方：依据列甚至可以不在你要返回的结果里。做「先按部门、再按销售额」这种多关键字排序时，SORTBY 是唯一干净的方案。',
    syntax: {
      patternCn: '=SORTBY(数组, 依据列1, [顺序1], [依据列2, 顺序2]…)',
      patternEn: '=SORTBY(array, by_array1, [sort_order1], [by_array2, sort_order2], …)',
      args: [
        { key: 'array', zh: '数组', en: 'array', required: true, desc: '要排序并返回的区域。', example: 'A2:C10' },
        { key: 'by_array1', zh: '依据列1', en: 'by_array1', required: true, desc: '用于排序的列，行数必须与数组一致，可在数组之外。', example: 'D2:D10' },
        { key: 'sort_order1', zh: '顺序1', en: 'sort_order1', required: false, desc: '1=升序（默认），-1=降序。', example: '-1' },
        { key: 'by_array2', zh: '依据列2', en: 'by_array2', required: false, desc: '第二个排序关键字，在第一个相同时生效。', example: 'C2:C10' },
      ],
    },
    returnValue: '返回排序后的数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：按数组之外的列排序',
        scene: '返回姓名和部门，但按「权重」列（不在返回结果里）排序。',
        dataTsv: '姓名\t部门\t权重\n张三\t华东\t2\n李四\t华北\t1\n王五\t华东\t3',
        dataAnchor: 'A1',
        formula: '=SORTBY(A2:B4, C2:C4, -1)',
        result: '王五/华东、张三/华东、李四/华北',
        explanation: '依据列 C 不出现在返回结果中，这正是 SORTBY 相对 SORT 的优势。',
      },
      {
        title: '示例 2：多关键字排序',
        scene: '先按部门升序，同部门再按销售额降序。',
        dataTsv: '姓名\t部门\t销售额\n张三\t华东\t800\n李四\t华北\t300\n王五\t华东\t1200',
        dataAnchor: 'A1',
        formula: '=SORTBY(A2:C4, B2:B4, 1, C2:C4, -1)',
        result: '王五/华东/1200、张三/华东/800、李四/华北/300',
        explanation: '两组「依据列+顺序」依次生效，这就是多关键字排序。',
      },
    ],
    pitfalls: [
      { title: '依据列行数与数组不一致', reason: '行数不同无法一一对应，Excel 报错。', fix: '确保 by_array 与 array 行数完全相同。', level: 'high', errorCode: '#VALUE!' },
      { title: '顺序参数写成了 0 或 2', reason: '顺序只认 1（升序）和 -1（降序），写 0/2 会报 #VALUE!。', fix: '升序写 1，降序写 -1。', level: 'mid', errorCode: '#VALUE!' },
      { title: '溢出区域被占住', reason: '结果溢出位置有内容。', fix: '清空溢出区域。', level: 'mid', errorCode: '#SPILL!' },
    ],
    related: [
      { id: 'sort', kind: 'alternative', why: '只按数组内部列排时用 SORT 更简单。' },
      { id: 'filter', kind: 'companion', why: 'FILTER 与 SORTBY 常一起用。' },
      { id: 'unique', kind: 'companion', why: '去重后排序是常见需求。' },
    ],
  },
  {
    id: 'sequence',
    enName: 'SEQUENCE',
    zhName: '生成序列',
    zhCommon: ['SEQUENCE', '序列', '自动生成序号'],
    alias: ['序号', '连续数字', '日期序列'],
    keywords: ['SEQUENCE', '序列', '序号', '连续数字', '动态数组'],
    difficulty: 1,
    usageLevel: 66,
    oneLiner: '一键生成连续数字（或日期）序列，自动溢出',
    summary:
      'SEQUENCE(行数, [列数], [起始值], [步长]) 生成一个等差数列数组。它替代了「在 A1 输 1、A2 输 2 然后下拉」这种体力活，也替代了 ROW(1:10) 这类取巧写法。因为结果是动态数组，行数由参数决定，增删数据不用重新拉填充。起始值给日期序列号（或配合 DATE）还能生成连续日期，做日程表、摊销表非常方便。',
    syntax: {
      patternCn: '=SEQUENCE(行数, [列数], [起始值], [步长])',
      patternEn: '=SEQUENCE(rows, [columns], [start], [step])',
      args: [
        { key: 'rows', zh: '行数', en: 'rows', required: true, desc: '要生成的行数。', example: '10' },
        { key: 'columns', zh: '列数', en: 'columns', required: false, desc: '要生成的列数，省略为 1。', example: '3' },
        { key: 'start', zh: '起始值', en: 'start', required: false, desc: '第一个数，省略为 1。', example: '100', tip: '填日期序列号可生成日期序列。' },
        { key: 'step', zh: '步长', en: 'step', required: false, desc: '相邻两个数的差，省略为 1，可为负（递减）。', example: '-1' },
      ],
    },
    returnValue: '返回按行列排布的等差数组（自动溢出）。',
    examples: [
      {
        title: '示例 1：生成 1 到 10',
        scene: '快速造一列序号。',
        dataTsv: '说明\n生成 1~10',
        dataAnchor: 'A1',
        formula: '=SEQUENCE(10)',
        result: '溢出为 {1;2;3;4;5;6;7;8;9;10}',
        explanation: '只给行数时生成 1 起的单列序列。比下拉填充更稳，插入行也不会错乱。',
      },
      {
        title: '示例 2：生成连续日期',
        scene: '从 2026-01-01 起生成 5 天日期。',
        dataTsv: '说明\n生成连续日期',
        dataAnchor: 'A1',
        formula: '=DATE(2026,1,1)+SEQUENCE(5)-1',
        result: '溢出为 2026/1/1 ~ 2026/1/5',
        explanation: 'SEQUENCE 生成 0~4 的增量加到起始日期上，即得连续日期。做排班表、摊销表很好用。',
      },
      {
        title: '示例 3：倒序 / 矩阵',
        scene: '从 10 倒数到 1，或生成 3 行 4 列。',
        dataTsv: '说明\n倒序与矩阵',
        dataAnchor: 'A1',
        formula: '=SEQUENCE(10, , 10, -1)',
        result: '{10;9;8;7;6;5;4;3;2;1}',
        explanation: '步长为负即递减；给列数则可生成多行多列矩阵。',
      },
    ],
    pitfalls: [
      { title: '行列数写成 0 或负数', reason: 'SEQUENCE 要求行列数为正，否则报错。', fix: '行列数取正整数；动态计算时用 MAX(1, …) 兜底。', level: 'high', errorCode: '#VALUE!' },
      { title: '溢出区域被占住', reason: '生成的序列要占用的单元格有内容。', fix: '清空溢出区域。', level: 'high', errorCode: '#SPILL!' },
      { title: '想要「跟着数据行数变」却写死数字', reason: '把行数写死成 10，数据变成 15 行后序列不跟着长。', fix: '行数用 COUNTA/ROWS 动态算，如 SEQUENCE(COUNTA(A2:A100))。', level: 'mid' },
    ],
    related: [
      { id: 'makearray', kind: 'alternative', why: '要按行列号自定义计算用 MAKEARRAY。' },
      { id: 'row', kind: 'companion', why: 'ROW 也能造序号，但 SEQUENCE 更直观可控。' },
      { id: 'sort', kind: 'companion', why: 'SEQUENCE 常与排序类函数组合造测试数据。' },
    ],
  },
];

const BATCH = 'B16';
let ok = 0;
for (const d of DATA) {
  const entry = {
    id: d.id,
    enName: d.enName,
    zhName: d.zhName,
    zhCommon: d.zhCommon,
    alias: d.alias,
    category: 'lambda',
    abbr: d.abbr ?? '',
    pinyin: d.pinyin ?? '',
    keywords: d.keywords,
    difficulty: d.difficulty,
    usageLevel: d.usageLevel,
    version: V,
    oneLiner: d.oneLiner,
    summary: d.summary,
    syntax: d.syntax,
    returnValue: d.returnValue,
    examples: d.examples,
    pitfalls: d.pitfalls,
    related: d.related,
    calc: CALC,
    meta: META,
  };
  const varName = d.id + 'Entry';
  const body = `import type { FunctionEntry } from '@/types';\n\n/** ${d.zhName} · ${d.oneLiner}（lambda 类 ${BATCH} 批次，Microsoft 365） */\n\nconst ${varName}: FunctionEntry = ${ser(entry, '')};\n\nexport default ${varName};\n`;
  writeFileSync('src/data/samples/' + d.id + '.ts', body, 'utf8');
  ok++;
  console.log('wrote', d.id + '.ts', body.split('\n').length, 'lines');
}
console.log('B16 done:', ok, 'files');
