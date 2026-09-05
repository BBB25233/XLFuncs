import type { FunctionEntry } from '@/types';
import averageaEntry from '@/data/samples/averagea';
import medianEntry from '@/data/samples/median';
import modeSnglEntry from '@/data/samples/mode-sngl';
import modeMultEntry from '@/data/samples/mode-mult';
import largeEntry from '@/data/samples/large';
import smallEntry from '@/data/samples/small';
import rankEqEntry from '@/data/samples/rank-eq';
import rankAvgEntry from '@/data/samples/rank-avg';
import percentileIncEntry from '@/data/samples/percentile-inc';
import percentileExcEntry from '@/data/samples/percentile-exc';
import quartileIncEntry from '@/data/samples/quartile-inc';
import quartileExcEntry from '@/data/samples/quartile-exc';
import stdevSEntry from '@/data/samples/stdev-s';
import stdevPEntry from '@/data/samples/stdev-p';
import stdevaEntry from '@/data/samples/stdeva';
import stdevpaEntry from '@/data/samples/stdevpa';
import varSEntry from '@/data/samples/var-s';
import varPEntry from '@/data/samples/var-p';
import varaEntry from '@/data/samples/vara';
import varpaEntry from '@/data/samples/varpa';
import countblankEntry from '@/data/samples/countblank';
import geomeanEntry from '@/data/samples/geomean';
import harmeanEntry from '@/data/samples/harmean';
import trimmeanEntry from '@/data/samples/trimmean';
import devsqEntry from '@/data/samples/devsq';
import avedevEntry from '@/data/samples/avedev';
import skewEntry from '@/data/samples/skew';
import kurtEntry from '@/data/samples/kurt';
import frequencyEntry from '@/data/samples/frequency';
import permutationaEntry from '@/data/samples/permutationa';
import correlEntry from '@/data/samples/correl';
import pearsonEntry from '@/data/samples/pearson';
import rsqEntry from '@/data/samples/rsq';
import slopeEntry from '@/data/samples/slope';
import interceptEntry from '@/data/samples/intercept';
import steyxEntry from '@/data/samples/steyx';
import forecastLinearEntry from '@/data/samples/forecast-linear';
import trendEntry from '@/data/samples/trend';
import growthEntry from '@/data/samples/growth';
import linestEntry from '@/data/samples/linest';
import logestEntry from '@/data/samples/logest';
import covarianceSEntry from '@/data/samples/covariance-s';
import covariancePEntry from '@/data/samples/covariance-p';
import normDistEntry from '@/data/samples/norm-dist';
import normSDistEntry from '@/data/samples/norm-s-dist';
import binomDistEntry from '@/data/samples/binom-dist';
import poissonDistEntry from '@/data/samples/poisson-dist';
import tDistEntry from '@/data/samples/t-dist';

/**
 * 统计类 9 条（count / counta / countif / countifs / average / averageif /
 * averageifs / max / min）。
 *
 * 写作口径：
 *  - 字段深度、语气、结构与 samples/if.ts 样板保持一致；
 *  - 计数 / 平均规则、错误码严格遵循 Excel 真实行为；
 *  - 重点提醒「不报错但结果错」的坑（文本型数字、空文本、比较符加引号等）。
 *
 * 关键规则备忘：
 *  - COUNT 只数数字；COUNTA 数一切非空（含文本、空格、逻辑值、错误值、空文本 ""）；
 *  - AVERAGE 自动忽略文字与空格，不把文字当 0（那是 AVERAGEA 的活）；
 *  - AVERAGEIFS / SUMIFS 都把「输出区域」放第一个，条件区域在后；
 *    COUNTIFS 没有单独输出区域，直接 (条件区域, 条件, …)。
 */

/* ============================ COUNT ============================ */

/** 成绩小表：混入文本「缺考」与一处空格，用于对比 COUNT / COUNTA / AVERAGE */
const SCORE_TSV = '姓名\t成绩\n张三\t85\n李四\t缺考\n王五\t92\n赵六\t\n钱七\t78';

const countEntry: FunctionEntry = {
  id: 'count',
  enName: 'COUNT',
  zhName: '数字计数',
  zhCommon: ['数字个数', '数数字', '几个数字'],
  alias: ['数字计数', '计数数字', '统计数字'],
  category: 'statistical',
  abbr: 'szjs',
  pinyin: 'shuzijishu',
  keywords: ['数数字', '数字个数', '统计数字个数', '有几个数字', '忽略文本', '只数数字'],
  difficulty: 1,
  usageLevel: 68,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '只统计数字，文本、逻辑值、错误值、空单元格一律不算。想数「非空的格子」请用 COUNTA。',
  },
  oneLiner: '数有多少个格子装的是数字',
  summary:
    '只数「数字」的格子：成绩 85、金额 1200 都算，但「缺考」这种文字、TRUE/FALSE、空着的格子都不算。经常用来核对数据里到底录入了几个有效数值。记住它和 COUNTA 的区别——COUNT 眼里只有数字，COUNTA 眼里只要不是彻底空着就算。',
  syntax: {
    patternCn: '=COUNT(值1, [值2], …)',
    patternEn: '=COUNT(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个要统计的区域或数值，可以是 A2:A100 这样的区域，也可以直接写数字。',
        accepts: '单元格区域（如 B2:B50）、一组逗号分隔的单元格、或直接写数字 1,2,3。',
        ifOmitted: '这是必填参数，至少要给一个区域或值。',
        tip: '可以一次框选多个不连续区域，如 COUNT(A2:A10,C2:C10)——它们会被合并起来一起数。',
        example: 'B2:B6',
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '更多要统计的区域或数值，可继续往后加，最多 255 个参数。',
        accepts: '同「值1」。',
        ifOmitted: '省略不影响，只统计值1 即可。',
        tip: '参数之间用逗号隔开，区域之间不需要手动求和，COUNT 自己会合并计数。',
        example: 'D2:D6',
      },
    ],
  },
  returnValue: '返回参数里「数字型」单元格的个数（不含文本、逻辑值、空单元格）。',
  examples: [
    {
      title: '示例 1：成绩列里到底录入了几个数字',
      scene: '一列成绩混进了「缺考」文字和一格漏填的空格，想知道实际有效的数字有几个。',
      dataTsv: SCORE_TSV,
      dataAnchor: 'A1',
      formula: '=COUNT(B2:B6)',
      result: '3（只数到 张三85、王五92、钱七78；「缺考」和空格不算）',
      explanation:
        'COUNT 只认数字。B3 的「缺考」是文本、B5 是空单元格，都被跳过，所以 5 格里只数出 3 个数字。',
    },
    {
      title: '示例 2：多个不连续区域一起数',
      scene: '语文和数学两列成绩分开摆放，要统计两科一共录入了多少个数字。',
      dataTsv: '科目\t语文\t数学\n张三\t85\t90\n李四\t缺考\t88\n王五\t92\t缺考',
      dataAnchor: 'A1',
      formula: '=COUNT(B2:B4,C2:C4)',
      result: '4（85、90、88、92 共 4 个数字；两处「缺考」忽略）',
      explanation: '两个区域用逗号并列，COUNT 会把它们当作一个整体来数，文本照例不计入。',
    },
  ],
  pitfalls: [
    {
      title: '文本型的数字「0012」被当成 0 个',
      reason:
        '从系统导出的编号常是「文本格式的数字」。COUNT 只认真正的数值，文本型数字在它眼里是文字，不算数。',
      fix: '先用「分列」或 VALUE() 把文本转成数字；或改用 COUNTA 数格子数（但那样会把真文字也算进去）。',
      level: 'high',
    },
    {
      title: '以为 COUNT 能数出「交了几份卷子」',
      reason: '「缺考」也是填了内容的格子，但 COUNT 不数文字，结果会比实际交卷人数少。',
      fix: '要数「非空格子」用 =COUNTA(B2:B6)，它会把「缺考」这类文字也计入。',
      level: 'high',
    },
    {
      title: 'TRUE / FALSE 不被统计',
      reason: '逻辑值 TRUE、FALSE 既不是数字也不是文本，COUNT 直接忽略它们。',
      fix: '若要把 TRUE 当 1、FALSE 当 0 来数，改用 COUNTA（TRUE/FALSE 算非空）或先转成数字。',
      level: 'mid',
    },
    {
      title: '错误值（如 #N/A）会让整列「数不出来」',
      reason: 'COUNT 遇到区域里的错误值不会自动跳过，而是把错误原样带出来，导致整公式报错。',
      fix: '先用 IFERROR 把错误值清成空或 0，再用 COUNT；或换 AGGREGATE 函数忽略错误。',
      level: 'low',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'counta',
      kind: 'confusable',
      why: '要数「非空格子」（含文字）用 COUNTA；COUNT 只数数字，漏掉所有文字。',
    },
    {
      id: 'countif',
      kind: 'alternative',
      why: '要数「满足某个条件」的格子（如 >60 的有几个），用 COUNTIF。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '数完个数常要顺手求和，SUM 把数字加总，和 COUNT 常配合使用。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '想知道这些数字的平均水平用 AVERAGE，它同样只认数字、跳过文字。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'B2:B6' },
    fields: [
      {
        key: 'range',
        label: '要数的区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列，混排了数字与「缺考」文字',
      },
    ],
    template: '=COUNT({range})',
    cases: [
      {
        label: '成绩列里数出 3 个数字',
        type: 'ok',
        values: { range: 'B2:B6' },
        expect: '3',
        note: '85 / 92 / 78 三个数字被计入，缺考文字与空格忽略',
      },
      {
        label: '区域写成 B:B（缺行号）',
        type: 'error',
        values: { range: 'B:B' },
        expect: '#REF!',
        note: 'B:B 不是合法区域引用，Excel 报引用无效',
      },
      {
        label: '区域写成 A:B（缺行号）',
        type: 'error',
        values: { range: 'A:B' },
        expect: '#REF!',
        note: '缺少行号，区域解析失败',
      },
      {
        label: '区域写成 2:6（缺列标）',
        type: 'error',
        values: { range: '2:6' },
        expect: '#REF!',
        note: '缺少列标，区域解析失败',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ COUNTA ============================ */

const countaEntry: FunctionEntry = {
  id: 'counta',
  enName: 'COUNTA',
  zhName: '非空计数',
  zhCommon: ['非空个数', '数非空', '非空计数'],
  alias: ['非空单元格计数', '统计非空', '包含文本计数'],
  category: 'statistical',
  abbr: 'fkjs',
  pinyin: 'feikongjishu',
  keywords: ['数非空', '非空个数', '统计非空单元格', '包含文本的格子', '忽略空格', 'COUNT填空'],
  difficulty: 1,
  usageLevel: 55,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '只要格子不是「彻底空着」就算：文字、数字、空格、TRUE/FALSE、错误值、公式返回的空文本 "" 都算非空。',
  },
  oneLiner: '数有多少个格子不是空的',
  summary:
    '只要格子不是彻底空着，COUNTA 就计入：文字「缺考」、数字 85、一个空格「 」、TRUE、甚至公式返回的空文本 "" 都算。常用来统计「一共填了几行」。最容易踩的坑是：用公式凑出来的「假空白」（=IF(...,"",...) 返回的 ""）也会被它数进去。',
  syntax: {
    patternCn: '=COUNTA(值1, [值2], …)',
    patternEn: '=COUNTA(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个要统计的区域或值，可以是整列 A2:A100，也可以零散单元格。',
        accepts: '区域（如 B2:B50）、逗号分隔的单元格、或直接写的内容。',
        ifOmitted: '必填参数，至少给一个区域。',
        tip: 'COUNTA 数的是「内容」，不是「数字」，所以文字格子也计入。',
        example: 'B2:B6',
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '更多区域或值，可继续追加，最多 255 个参数。',
        accepts: '同「值1」。',
        ifOmitted: '省略无影响。',
        tip: '多个不连续区域并列时，重复选中的格子不重复计数。',
        example: 'D2:D6',
      },
    ],
  },
  returnValue: '返回参数里「非空」单元格的个数（含文字、数字、空格、逻辑值、错误值、空文本）。',
  examples: [
    {
      title: '示例 1：成绩列里一共填了几个格子',
      scene: '想知道这列到底录入了几条记录，不管填的是数字还是「缺考」都算。',
      dataTsv: SCORE_TSV,
      dataAnchor: 'A1',
      formula: '=COUNTA(B2:B6)',
      result: '4（85、缺考、92、78 都算；只有赵六那格真空着，不算）',
      explanation:
        'COUNTA 数「非空」。B3 的「缺考」是文字、B5 才是彻底空着，所以 5 格里数出 4 个有内容的。',
    },
    {
      title: '示例 2：用公式返回的空文本 "" 也会被数',
      scene: '一列用 =IF(分数<60,"","及格") 标「及格」，想着「不及格就空着」，结果总数对不上。',
      dataTsv: '姓名\t标记\n张三\t及格\n李四\t\n王五\t及格',
      dataAnchor: 'A1',
      formula: '=COUNTA(B2:B4)',
      result: '3（三格都被计入，因为李四那格是公式返回的 ""，不是真空）',
      explanation:
        '公式返回的 "" 在 Excel 里是一段「长度为 0 的文本」，COUNTA 把它当非空。想排除它要用 COUNTIF(B2:B4,"<>") 或 COUNTBLANK 配合。',
    },
  ],
  pitfalls: [
    {
      title: '一个空格「 」竟被算进去了',
      reason: '看起来「像是空白」的格子，只要里面有个空格字符，就是非空，COUNTA 照算不误。',
      fix: '清理时用 TRIM 去掉首尾空格，或用 COUNTIF(B2:B6,"<>") 只数有真实内容的格子。',
      level: 'high',
    },
    {
      title: '公式返回的空文本 "" 被当非空计入',
      reason: '=IF(...,"",...) 看起来是空的，实际返回一段零长度文本，COUNTA 会把它算 1 个。',
      fix: '要数「真有内容」的格子用 =COUNTIF(B2:B6,"<>")；它不会把 "" 算进去，但仍会计入空格。彻底排干净需先清理空格。',
      level: 'high',
    },
    {
      title: '误以为 COUNTA 等于「有效数据条数」',
      reason: 'COUNTA 把错误值 #N/A、标题文字、备注都算进去，等于「格子里有任何东西」。',
      fix: '只数数字用 COUNT；只数满足某条件用 COUNTIF；COUNTA 适合「一共占了几行」。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'count',
      kind: 'confusable',
      why: '只数数字用 COUNT；COUNTA 数一切非空，会把文字也数进去。',
    },
    {
      id: 'countif',
      kind: 'alternative',
      why: '要数「满足某条件」的非空格子（如标记=已交），用 COUNTIF。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '数完非空格子，常顺手用 AVERAGE 算这些格子的均值。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: 'COUNTA 管「有几行」，SUM 管「加起来多少」，常一起出现在汇总行。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'B2:B6' },
    fields: [
      {
        key: 'range',
        label: '要数的区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列，混排了数字与「缺考」文字',
      },
    ],
    template: '=COUNTA({range})',
    cases: [
      {
        label: '成绩列里数出 4 个非空',
        type: 'ok',
        values: { range: 'B2:B6' },
        expect: '4',
        note: '85 / 缺考 / 92 / 78 四个有内容，空格那格不算',
      },
      {
        label: '区域写成 B:B（缺行号）',
        type: 'error',
        values: { range: 'B:B' },
        expect: '#REF!',
        note: 'B:B 不是合法区域引用',
      },
      {
        label: '区域写成 A:B（缺行号）',
        type: 'error',
        values: { range: 'A:B' },
        expect: '#REF!',
        note: '缺少行号，区域解析失败',
      },
      {
        label: '区域写成 2:6（缺列标）',
        type: 'error',
        values: { range: '2:6' },
        expect: '#REF!',
        note: '缺少列标，区域解析失败',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ COUNTIF ============================ */

/** 带「状态」列的小表，用于演示单条件计数 */
const STATUS_TSV =
  '姓名\t成绩\t状态\n张三\t85\t已交\n李四\t59\t已交\n王五\t92\t已交\n赵六\t45\t未交\n钱七\t78\t已交';

const countifEntry: FunctionEntry = {
  id: 'countif',
  enName: 'COUNTIF',
  zhName: '条件计数',
  zhCommon: ['按条件数', '条件计数', '统计个数'],
  alias: ['单条件计数', '条件统计', '按条件数个数'],
  category: 'statistical',
  abbr: 'tjjs',
  pinyin: 'tiaojianjishu',
  keywords: ['条件计数', '按条件统计', '数满足条件的', '>60计数', '等于某值计数', '通配符计数'],
  difficulty: 2,
  usageLevel: 76,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '条件里用到 >、<、<>、*、? 等符号，整段条件必须用半角双引号包起来，如 ">60"。',
  },
  oneLiner: '数满足某个条件的格子有几个',
  summary:
    '给定一片区域和一个条件，数出满足条件的格子数量：成绩 >60 的有几个、状态=「已交」的有几个、姓名里带「王」字的有几个。条件里的比较符（>、<、<>）和通配符（*、?）必须写进一对半角双引号里，这是新手最易漏的地方。',
  syntax: {
    patternCn: '=COUNTIF(要数的区域, 条件)',
    patternEn: '=COUNTIF(range, criteria)',
    args: [
      {
        key: 'range',
        zh: '要数的区域',
        en: 'range',
        required: true,
        desc: '你想从中筛选并计数的单元格区域，如 B2:B100。',
        accepts: '单个连续区域；COUNTIF 不支持多个不连续区域（那种情况用 COUNTIFS 或相加）。',
        ifOmitted: '必填，不写就不知道去哪数。',
        tip: '条件区域和条件要一一对应：数「成绩>60」就选成绩列，别选成姓名列。',
        example: 'B2:B6',
        pitfallRank: 2,
      },
      {
        key: 'criteria',
        zh: '条件',
        en: 'criteria',
        required: true,
        desc: '一个数字、一段文字，或带比较符 / 通配符的表达式。',
        accepts: '数字 60 · 文字 "苹果" · 比较 ">60" · 不等于 "<>苹果" · 通配 "王*" 。',
        ifOmitted: '必填，不写就变成 COUNT 了。',
        tip: '【最常漏】用到 >、<、<>、*、? 时，整段条件要加半角双引号：">60"，不是 >60。',
        example: '">60"',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回区域内满足条件（equals / 比较 / 通配符匹配）的单元格个数。',
  examples: [
    {
      title: '示例 1：成绩大于 60 的有几个人',
      scene: '老师想快速知道及格线（60 分）以上有多少人。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=COUNTIF(B2:B6,">60")',
      result: '3（85、92、78 三人；59、45 不算）',
      explanation: '条件 ">60" 必须带引号。它在成绩列 B2:B6 里逐个比对，大于 60 的计 1。',
    },
    {
      title: '示例 2：状态为「已交」的有几人',
      scene: '统计作业收齐没有，数一数标记为「已交」的格子。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=COUNTIF(C2:C6,"已交")',
      result: '4（张三、李四、王五、钱七；赵六「未交」不算）',
      explanation: '纯文字条件直接写 "已交" 即可，等于就是精确匹配这一格的内容。',
    },
    {
      title: '示例 3：姓名里带「王」字的有几个（通配符）',
      scene: '想数姓「王」的同学，姓名列不只有「王五」还可能更多。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=COUNTIF(A2:A6,"王*")',
      result: '1（王五；"王*" 表示以「王」开头的任意文本）',
      explanation: '* 代表任意多个字符、? 代表单个字符。要数「王」开头就用 "王*"。',
    },
  ],
  pitfalls: [
    {
      title: '比较符忘了加引号：=COUNTIF(B2:B6,>60)',
      reason: 'Excel 不认识没引号的 >60，会把它当未知名称，直接报 #NAME?。',
      fix: '写成 =COUNTIF(B2:B6,">60")，整段条件用半角双引号包住。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '文本型数字对不上：条件写 60 却数不到',
      reason: '区域里是文本格式的 "60"（左对齐），条件写数字 60 是数值，两者不相等，数不到。',
      fix: '条件也写成文本："60"，或先用 VALUE 把区域转成数字；也可写 ">"&"60" 拼接。',
      level: 'high',
    },
    {
      title: '不等号 "<>" 的两种用法容易混',
      reason: 'COUNTIF(B2:B6,"<>") 数「非空」格子（不含公式空文本 ""）；COUNTIF(B2:B6,"<>苹果") 数「不等于苹果」的格子（包含空格和空文本）。两种含义差很多。',
      fix: '数非空用 "<>"；排除某个具体值用 "<>苹果"。想精确控制空文本，改用 COUNTIFS 多条件。',
      level: 'mid',
    },
    {
      title: '通配符被当成普通字符',
      reason: '条件里想匹配「王*」却写成了精确匹配，星号失去通配含义。',
      fix: '通配符 * ? 只在条件作为文本时生效；若要找字面上的星号，用波浪号转义："王~*"。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'countifs',
      kind: 'alternative',
      why: '要同时满足「多个条件」（如 已交 且 >60）用 COUNTIFS。',
    },
    {
      id: 'count',
      kind: 'companion',
      why: 'COUNTIF 是带条件的 COUNT；不要条件时直接 COUNT 即可。',
    },
    {
      id: 'sumif',
      kind: 'companion',
      why: '数个数用 COUNTIF，按同样条件求和用 SUMIF，二者语法很像。',
    },
    {
      id: 'averageif',
      kind: 'companion',
      why: '按条件求平均用 AVERAGEIF，思路与 COUNTIF 一致。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'C2:C6' },
    fields: [
      {
        key: 'range',
        label: '要数的区域',
        type: 'ref',
        default: 'C2:C6',
        hint: '状态列（已交 / 未交）',
      },
      {
        key: 'criteria',
        label: '条件',
        type: 'text',
        default: '"已交"',
        hint: '比较符 / 通配符必须加半角双引号，如 ">60"',
      },
    ],
    template: '=COUNTIF({range},{criteria})',
    cases: [
      {
        label: '状态=已交 的有 4 人',
        type: 'ok',
        values: { range: 'C2:C6', criteria: '"已交"' },
        expect: '4',
        note: '张三李四王五钱七已交，赵六未交',
      },
      {
        label: '成绩>60 的有 3 人',
        type: 'ok',
        values: { range: 'B2:B6', criteria: '">60"' },
        expect: '3',
        note: '85 / 92 / 78 三人大于 60',
      },
      {
        label: '文本条件没加引号',
        type: 'error',
        values: { range: 'C2:C6', criteria: '已交' },
        expect: '#NAME?',
        note: '裸写文本条件，Excel 当未知名称 → #NAME?',
      },
      {
        label: '比较符没加引号',
        type: 'error',
        values: { range: 'B2:B6', criteria: '>60' },
        expect: '#NAME?',
        note: '裸写 >60，Excel 当未知名称 → #NAME?',
      },
      {
        label: '区域非法 B:B',
        type: 'error',
        values: { range: 'B:B', criteria: '"已交"' },
        expect: '#REF!',
        note: '区域引用不合法 → #REF!',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ COUNTIFS ============================ */

const countifsEntry: FunctionEntry = {
  id: 'countifs',
  enName: 'COUNTIFS',
  zhName: '多条件计数',
  zhCommon: ['多条件数', '多条件计数', '同时满足计数'],
  alias: ['多条件统计', '条件都满足计数', '复合条件计数'],
  category: 'statistical',
  abbr: 'dtjjs',
  pinyin: 'duotiaojianjishu',
  keywords: ['多条件计数', '同时满足多个条件', '多个条件统计', 'AND计数', '条件都满足', '区间计数'],
  difficulty: 3,
  usageLevel: 72,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '每个 (条件区域, 条件) 必须成对出现且区域大小一致，否则报 #VALUE!。条件都需加引号。',
  },
  oneLiner: '数同时满足多个条件的格子有几个',
  summary:
    '在 COUNTIF 基础上支持「多个条件同时成立」：既「已交」又「成绩>60」的人有几个、既「男生」又「及格」的有几个。写法是「(条件区域1, 条件1, 条件区域2, 条件2, …)」成对追加，所有条件都满足才计入。它不像 SUMIFS 那样有单独的「求和区域」——它数的是条件区域本身命中的格子数。',
  syntax: {
    patternCn: '=COUNTIFS(条件区域1, 条件1, [条件区域2, 条件2], …)',
    patternEn: '=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], …)',
    args: [
      {
        key: 'criteria_range1',
        zh: '条件区域1',
        en: 'criteria_range1',
        required: true,
        desc: '第一个条件要核查的区域，如状态列 C2:C100。',
        accepts: '连续区域，所有条件区域必须行数 / 列数一致。',
        ifOmitted: '必填，至少要有一对条件区域 + 条件。',
        tip: '多个条件区域形状要一样大，否则 Excel 报 #VALUE!。',
        example: 'C2:C6',
        pitfallRank: 2,
      },
      {
        key: 'criteria1',
        zh: '条件1',
        en: 'criteria1',
        required: true,
        desc: '对应条件区域1 的判定，如 "已交"。',
        accepts: '数字、文字、">60"、 "<>苹果"、 "王*" 等，带符号要加引号。',
        ifOmitted: '必填，和条件区域1 成对。',
        tip: '多个条件之间是「并且（AND）」关系，不是「或者」。',
        example: '"已交"',
        pitfallRank: 1,
      },
      {
        key: 'criteria_range2',
        zh: '条件区域2',
        en: 'criteria_range2',
        required: false,
        desc: '第二个条件要核查的区域，如成绩列 B2:B100。',
        accepts: '同条件区域1，需与条件区域1 形状一致。',
        ifOmitted: '只满足单条件时省略，改用 COUNTIF 更轻量。',
        tip: '可以继续加第 3、第 4 对，条件越多筛得越细。',
        example: 'B2:B6',
      },
      {
        key: 'criteria2',
        zh: '条件2',
        en: 'criteria2',
        required: false,
        desc: '对应条件区域2 的判定，如 ">60"。',
        accepts: '同条件1。',
        ifOmitted: '与条件区域2 成对，省略则条件区域2 也不必写。',
        tip: '想做「或者」关系（满足任一即可）不能直接用 COUNTIFS，要把几个 COUNTIFS 相加。',
        example: '">60"',
      },
    ],
  },
  returnValue: '返回所有条件同时成立时，命中的单元格个数。',
  examples: [
    {
      title: '示例 1：既「已交」又「成绩>60」的有几人',
      scene: '只统计真正交卷且及格的人，两个条件缺一不可。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=COUNTIFS(C2:C6,"已交",B2:B6,">60")',
      result: '3（张三85、王五92、钱七78；李四59 不达标、赵六未交 都排除）',
      explanation: '两对条件依次写：先 状态=已交，再 成绩>60。同一行必须同时满足才计入。',
    },
    {
      title: '示例 2：成绩落在 60~80 区间的人数',
      scene: '想数「中分段」人数，需要大于 60 且小于等于 80，是两个条件。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=COUNTIFS(B2:B6,">60",B2:B6,"<=80")',
      result: '2（张三85 超出、钱七78 在内、王五92 超出 → 仅钱七78 及…实际 78 一人，赵六45/李四59 不达标；结果=1）',
      explanation:
        '同一个成绩列 B 写了两遍条件，分别框住上下界。本例 60<成绩<=80 的只有钱七 78，所以结果是 1。注意区间端点用 >60 与 <=80 组合。',
    },
  ],
  pitfalls: [
    {
      title: '条件区域大小不一致报 #VALUE!',
      reason: 'COUNTIFS 要求每对条件区域的形状相同；若一处选了 B2:B6、另一处选了 C2:C5，Excel 直接报错。',
      fix: '确保所有条件区域行数、列数一致，建议整列一起选（如 B:B、C:C）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '误以为 COUNTIFS 是「或者」关系',
      reason: '多对条件之间是 AND（同时满足），不是 OR。写 (A,"男",B,"及格") 只会数「男且及格」。',
      fix: '要「或者」就把多个 COUNTIFS 相加：=COUNTIFS(…男…)+COUNTIFS(…及格…)，注意去重。',
      level: 'high',
    },
    {
      title: '条件里的符号又忘了引号',
      reason: '和 COUNTIF 一样，">60"、 "<>未交" 必须加半角双引号。',
      fix: '统一写成带引号的文本条件，需要拼接单元格时用 ">"&E2 这种写法。',
      level: 'mid',
      errorCode: '#NAME?',
    },
    {
      title: '拿它当 SUMIFS 用，想要「求和区域」',
      reason: 'COUNTIFS 没有「数值区域」参数，它只数条件命中的格子。想对满足条件的数求和要用 SUMIFS（求和区域放最前）。',
      fix: '计数用 COUNTIFS；按条件求和改用 =SUMIFS(求和区域, 条件区域1, 条件1, …)。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'countif',
      kind: 'companion',
      why: '单条件就够时用 COUNTIF 更轻；多条件才上 COUNTIFS。',
    },
    {
      id: 'sumifs',
      kind: 'companion',
      why: '同样是多条件，但 SUMIFS 对满足条件的数值求和而非计数。',
    },
    {
      id: 'averageifs',
      kind: 'companion',
      why: '多条件下求平均用 AVERAGEIFS，参数顺序和 COUNTIFS 类似。',
    },
    {
      id: 'count',
      kind: 'confusable',
      why: '不需要条件时直接用 COUNT 数数字，不必套 COUNTIFS。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range1: 'C2:C6', range2: 'B2:B6' },
    fields: [
      {
        key: 'range1',
        label: '条件区域1',
        type: 'ref',
        default: 'C2:C6',
        hint: '状态列',
      },
      {
        key: 'criteria1',
        label: '条件1',
        type: 'text',
        default: '"已交"',
        hint: '带符号要加引号',
      },
      {
        key: 'range2',
        label: '条件区域2',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列',
      },
      {
        key: 'criteria2',
        label: '条件2',
        type: 'text',
        default: '">60"',
        hint: '带符号要加引号',
      },
    ],
    template: '=COUNTIFS({range1},{criteria1},{range2},{criteria2})',
    cases: [
      {
        label: '已交且>60 的有 3 人',
        type: 'ok',
        values: {
          range1: 'C2:C6',
          criteria1: '"已交"',
          range2: 'B2:B6',
          criteria2: '">60"',
        },
        expect: '3',
        note: '张三85 / 王五92 / 钱七78，李四59、赵六未交排除',
      },
      {
        label: '条件1 文本没加引号',
        type: 'error',
        values: {
          range1: 'C2:C6',
          criteria1: '已交',
          range2: 'B2:B6',
          criteria2: '">60"',
        },
        expect: '#NAME?',
        note: '裸写文本条件 → #NAME?',
      },
      {
        label: '两区域行数不一致',
        type: 'error',
        values: {
          range1: 'C2:C6',
          criteria1: '"已交"',
          range2: 'B2:B5',
          criteria2: '">60"',
        },
        expect: '#VALUE!',
        note: '第二对区域只有 4 行，与第一对 5 行不一致 → #VALUE!',
      },
      {
        label: '区域非法 B:B',
        type: 'error',
        values: {
          range1: 'B:B',
          criteria1: '"已交"',
          range2: 'B2:B6',
          criteria2: '">60"',
        },
        expect: '#REF!',
        note: '区域引用不合法 → #REF!',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ AVERAGE ============================ */

const averageEntry: FunctionEntry = {
  id: 'average',
  enName: 'AVERAGE',
  zhName: '平均值',
  zhCommon: ['算平均', '求平均', '平均值'],
  alias: ['算术平均', '平均数', '均值'],
  category: 'statistical',
  abbr: 'pjz',
  pinyin: 'pingjunzhi',
  keywords: ['算平均', '求平均值', '算术平均', '忽略文字', '跳过空格', '平均多少'],
  difficulty: 1,
  usageLevel: 85,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'AVERAGE 自动跳过空格与文字（不计入分母），也不把文字当 0；若想把文字当 0 用 AVERAGEA。',
  },
  oneLiner: '算平均，自动跳过空格和文字',
  summary:
    '把一片区域里的数字加总再除以数字的个数，得到算术平均。它很「聪明」：空格和文字（如「缺考」）会被直接跳过，既不算进分子也不算进分母。所以 AVERAGE 不会因为混进文字就被拉低——那其实是 AVERAGEA 的行为。常用于算平均分、平均销售额。',
  syntax: {
    patternCn: '=AVERAGE(值1, [值2], …)',
    patternEn: '=AVERAGE(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个要平均的区域或数值，如 B2:B100。',
        accepts: '区域、零散单元格、或直接数字。',
        ifOmitted: '必填，至少给一个区域。',
        tip: '区域里混有文字、空格会自动跳过，只对数字求平均。',
        example: 'B2:B6',
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '更多区域或数值，可继续追加。',
        accepts: '同「值1」。',
        ifOmitted: '省略无影响。',
        tip: '多个区域并列时，只合并其中的数字一起平均。',
        example: 'D2:D6',
      },
    ],
  },
  returnValue: '返回参数中所有数字的平均值（总和 ÷ 数字个数，文字与空格不参与）。',
  examples: [
    {
      title: '示例 1：成绩列的平均分（自动跳过「缺考」）',
      scene: '一列成绩里有「缺考」文字和漏填的空格，想算出实际参考同学的平均分。',
      dataTsv: SCORE_TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGE(B2:B6)',
      result: '85（(85+92+78) ÷ 3 = 85；缺考与空格被跳过）',
      explanation:
        'AVERAGE 只在 85、92、78 三个数字上算平均，分母也是 3。「缺考」和空格既不算分子也不算分母。',
    },
    {
      title: '示例 2：两科成绩一起平均',
      scene: '语文、数学两列，要算两个班混合后的整体平均分。',
      dataTsv: '科目\t语文\t数学\n张三\t85\t90\n李四\t缺考\t88\n王五\t92\t缺考',
      dataAnchor: 'A1',
      formula: '=AVERAGE(B2:B4,C2:C4)',
      result: '88.75（85、90、88、92 共 4 个数字平均；(85+90+88+92)/4）',
      explanation: '两个区域里的数字被合并后一起平均，两处「缺考」都不参与计算。',
    },
  ],
  pitfalls: [
    {
      title: '误以为 AVERAGE 会把文字当 0 拉低均值',
      reason:
        '其实 AVERAGE 直接忽略文字和空格，既不进分子也不进分母。真正把文字当 0 的是 AVERAGEA。所以 AVERAGE 的结果往往比你想的高，因为分母变小了。',
      fix: '想把「缺考」当成 0 分计入，用 =AVERAGEA(B2:B6)；想严格只看数字就用 AVERAGE。',
      level: 'high',
    },
    {
      title: '区域全是非数字，得到 #DIV/0!',
      reason: '当被选区域里一个数字都没有（全是文字或空格），分母为 0，公式报错。',
      fix: '先用 COUNT 确认有数字；或在公式外套 IFERROR：=IFERROR(AVERAGE(B2:B6),"无数据")。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
    {
      title: '文本型数字被跳过，平均偏高',
      reason: '从系统导出的「0012」这类文本数字，AVERAGE 当作文字忽略，导致分母和分子都少算。',
      fix: '先用 VALUE() 或「分列」转成真数字，再求平均；或检查为何出现文本型数字。',
      level: 'mid',
    },
    {
      title: '错误值（#N/A 等）直接传染整公式',
      reason: 'AVERAGE 遇到区域里的错误值不跳过，会把错误原样抛出。',
      fix: '先用 IFERROR 清理，或用 AGGREGATE(1,6,区域) 忽略错误再平均。',
      level: 'low',
      errorCode: '#N/A',
    },
  ],
  related: [
    {
      id: 'averageif',
      kind: 'alternative',
      why: '只平均「满足某条件」的数（如 >60 的平均）用 AVERAGEIF。',
    },
    {
      id: 'averageifs',
      kind: 'alternative',
      why: '按「多个条件」求平均用 AVERAGEIFS。',
    },
    {
      id: 'count',
      kind: 'companion',
      why: 'AVERAGE 的分母就是 COUNT 的结果——它俩常一起出现。',
    },
    {
      id: 'max',
      kind: 'companion',
      why: '看平均水平用 AVERAGE，看极值用 MAX，配合了解分布。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'B2:B6' },
    fields: [
      {
        key: 'range',
        label: '要平均的区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列，混排数字与文字',
      },
    ],
    template: '=AVERAGE({range})',
    cases: [
      {
        label: '成绩均值 85',
        type: 'ok',
        values: { range: 'B2:B6' },
        expect: '85',
        note: '(85+92+78)/3=85，缺考与空格被跳过',
      },
      {
        label: '区域全是文本',
        type: 'error',
        values: { range: 'A2:A6' },
        expect: '#DIV/0!',
        note: '姓名列无数字，分母为 0 → #DIV/0!',
      },
      {
        label: '区域落在无数据的 C 列',
        type: 'error',
        values: { range: 'C2:C6' },
        expect: '#DIV/0!',
        note: '本表无 C 列，取到的全是空格，无数字 → #DIV/0!',
      },
      {
        label: '区域非法 B:B',
        type: 'error',
        values: { range: 'B:B' },
        expect: '#REF!',
        note: '区域引用不合法 → #REF!',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ AVERAGEIF ============================ */

const averageifEntry: FunctionEntry = {
  id: 'averageif',
  enName: 'AVERAGEIF',
  zhName: '条件平均',
  zhCommon: ['条件平均', '按条件平均', '平均满足条件的'],
  alias: ['单条件平均', '条件求平均', '挑出来平均'],
  category: 'statistical',
  abbr: 'tjpj',
  pinyin: 'tiaojianpingjun',
  keywords: ['条件平均', '按条件求平均', '只算满足条件的平均', '满足某条件均值', 'AVERAGE加条件'],
  difficulty: 3,
  usageLevel: 50,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '条件里用到 >、<、<>、*、? 必须加半角双引号，如 ">60"。求平均区域可省略（默认等于条件区域）。',
  },
  oneLiner: '只算满足条件的那些数的平均',
  summary:
    '先按一个条件筛选，再对筛出来的数字求平均：已交作业同学的平均分、销量大于 100 的平均销售额。语法是 AVERAGEIF(条件区域, 条件, [求平均区域])——求平均区域省略时，就对在条件区域里命中的数字本身求平均。条件带比较符或通配符时务必加引号。',
  syntax: {
    patternCn: '=AVERAGEIF(条件区域, 条件, [求平均区域])',
    patternEn: '=AVERAGEIF(range, criteria, [average_range])',
    args: [
      {
        key: 'range',
        zh: '条件区域',
        en: 'range',
        required: true,
        desc: '用来判断条件是否成立的那片区域，如状态列 C2:C100。',
        accepts: '单个连续区域。',
        ifOmitted: '必填，不写不知道按什么筛。',
        tip: '条件区域和求平均区域要形状一致、位置对应。',
        example: 'C2:C6',
        pitfallRank: 2,
      },
      {
        key: 'criteria',
        zh: '条件',
        en: 'criteria',
        required: true,
        desc: '筛选条件，如 "已交"、 ">60"。',
        accepts: '数字、文字、">60"、 "<>未交"、 "王*" 等，带符号要加引号。',
        ifOmitted: '必填。',
        tip: '和 COUNTIF 一样，比较符 / 通配符要写进半角双引号。',
        example: '"已交"',
        pitfallRank: 1,
      },
      {
        key: 'average_range',
        zh: '求平均区域',
        en: 'average_range',
        required: false,
        desc: '真正要平均的那片数字区域；省略时默认等于「条件区域」本身。',
        accepts: '与条件区域形状一致的数值区域。',
        ifOmitted: '省略则对条件区域里命中的数字直接求平均（条件区域本身得是数字）。',
        tip: '常用写法：条件看状态列、平均看成绩列，两者分开更灵活。',
        example: 'B2:B6',
      },
    ],
  },
  returnValue: '返回满足条件区域命中的、对应求平均区域里数字的平均值。',
  examples: [
    {
      title: '示例 1：已交作业同学的平均分',
      scene: '只算真正交了卷的人（状态=已交）的平均分，不把未交的算进来。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEIF(C2:C6,"已交",B2:B6)',
      result: '78.5（(85+59+92+78) ÷ 4 = 78.5；赵六未交排除）',
      explanation: '条件区域是状态列 C，求平均区域是成绩列 B。只挑「已交」那几行的成绩来平均。',
    },
    {
      title: '示例 2：成绩大于 60 的平均分（区域省略写法）',
      scene: '直接对成绩列里大于 60 的那些数求平均，条件和数字在同一列。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEIF(B2:B6,">60")',
      result: '85（(85+92+78) ÷ 3 = 85；59、45 排除）',
      explanation: '省略第 3 参数时，AVERAGEIF 对条件区域 B 里满足条件（>60）的数字本身求平均。',
    },
  ],
  pitfalls: [
    {
      title: '条件里的符号忘了引号',
      reason: 'AVERAGEIF 的条件和 COUNTIF 一样，">60" 必须加引号，否则 #NAME?。',
      fix: '写成 =AVERAGEIF(B2:B6,">60",C2:C6)；需要引用单元格时用 ">"&E2。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '条件区域和求平均区域形状不一致',
      reason: '两者行列数必须对应，否则 Excel 报 #VALUE!。',
      fix: '选区域时整列对齐，如 C2:C6 配 B2:B6，而不是 C2:C6 配 B2:B10。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '没有任何满足条件的数，得到 #DIV/0!',
      reason: '比如条件 ">100" 但所有人都没超过 100，分母为 0 报错。',
      fix: '外套 IFERROR：=IFERROR(AVERAGEIF(...),"无匹配")，或用 COUNTIF 先判断是否有命中。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
    {
      title: '误以为会像 AVERAGE 那样跳过文字',
      reason: 'AVERAGEIF 只对「条件命中的行」对应的数字平均；若求平均区域里混有文字，那一行直接被忽略（不是当 0）。',
      fix: '确保求平均区域是纯数字列；文字行若被条件命中也会被 AVERAGEIF 跳过而不是当 0。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'averageifs',
      kind: 'alternative',
      why: '要「多个条件」同时成立才平均，用 AVERAGEIFS。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '不筛选直接平均用 AVERAGE，最简单。',
    },
    {
      id: 'sumif',
      kind: 'companion',
      why: '同样单条件，但 SUMIF 求和、AVERAGEIF 求平均，参数顺序一致。',
    },
    {
      id: 'countif',
      kind: 'companion',
      why: '先 COUNTIF 数满足条件有几个，再 AVERAGEIF 算它们的均值，逻辑连贯。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'C2:C6', average_range: 'B2:B6' },
    fields: [
      {
        key: 'range',
        label: '条件区域',
        type: 'ref',
        default: 'C2:C6',
        hint: '状态列',
      },
      {
        key: 'criteria',
        label: '条件',
        type: 'text',
        default: '"已交"',
        hint: '带符号要加引号',
      },
      {
        key: 'average_range',
        label: '求平均区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列；省略则对条件区域本身求平均',
      },
    ],
    template: '=AVERAGEIF({range},{criteria},{average_range})',
    cases: [
      {
        label: '已交同学平均分 78.5',
        type: 'ok',
        values: { range: 'C2:C6', criteria: '"已交"', average_range: 'B2:B6' },
        expect: '78.5',
        note: '(85+59+92+78)/4=78.5，未交的赵六排除',
      },
      {
        label: '成绩>60 的平均 85（区域省略写法）',
        type: 'ok',
        values: { range: 'B2:B6', criteria: '">60"', average_range: 'B2:B6' },
        expect: '85',
        note: '(85+92+78)/3=85',
      },
      {
        label: '条件没加引号',
        type: 'error',
        values: { range: 'C2:C6', criteria: '已交', average_range: 'B2:B6' },
        expect: '#NAME?',
        note: '裸写文本条件 → #NAME?',
      },
      {
        label: '没有任何命中',
        type: 'error',
        values: { range: 'C2:C6', criteria: '"及格"', average_range: 'B2:B6' },
        expect: '#DIV/0!',
        note: '没有「及格」状态，分母为 0 → #DIV/0!',
      },
      {
        label: '两区域行数不一致',
        type: 'error',
        values: { range: 'C2:C6', criteria: '"已交"', average_range: 'B2:B5' },
        expect: '#VALUE!',
        note: '求平均区域只有 4 行 → #VALUE!',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ AVERAGEIFS ============================ */

const averageifsEntry: FunctionEntry = {
  id: 'averageifs',
  enName: 'AVERAGEIFS',
  zhName: '多条件平均',
  zhCommon: ['多条件平均', '多条件求平均', '同时满足平均'],
  alias: ['多条件均值', '条件都满足平均', '复合条件平均'],
  category: 'statistical',
  abbr: 'dtjpj',
  pinyin: 'duotiaojianpingjun',
  keywords: ['多条件平均', '同时满足多个条件平均', '区间平均', '多个条件求均值', 'AVERAGEIFS'],
  difficulty: 3,
  usageLevel: 46,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      '参数顺序和 SUMIFS 一样：求平均区域放最前，其后是成对的 (条件区域, 条件)。这与 COUNTIFS（无求平均区域）不同，容易写串。',
  },
  oneLiner: '同时满足多个条件的数的平均值',
  summary:
    '多条件下的 AVERAGEIF：既「已交」又「成绩>60」的那些人的平均分。关键记牢参数顺序——求平均区域排最前面，然后是成对的 (条件区域1, 条件1, 条件区域2, 条件2, …)。这个「数值区域在前、条件在后」的顺序和 SUMIFS 一致，但和 COUNTIFS（没有数值区域）不同，初学最容易写串。',
  syntax: {
    patternCn: '=AVERAGEIFS(求平均区域, 条件区域1, 条件1, [条件区域2, 条件2], …)',
    patternEn: '=AVERAGEIFS(average_range, criteria_range1, criteria1, [criteria_range2, criteria2], …)',
    args: [
      {
        key: 'average_range',
        zh: '求平均区域',
        en: 'average_range',
        required: true,
        desc: '真正要平均的数字区域，必须放在【最前面】。',
        accepts: '与各个条件区域形状一致的数值区域，如 B2:B100。',
        ifOmitted: '必填，且是第一个参数。',
        tip: '【最易错】AVERAGEIFS 把求平均区域放第一，和 COUNTIFS 写法不同，别写反。',
        example: 'B2:B6',
        pitfallRank: 1,
      },
      {
        key: 'criteria_range1',
        zh: '条件区域1',
        en: 'criteria_range1',
        required: true,
        desc: '第一个条件核查的区域，如状态列 C2:C100。',
        accepts: '连续区域，形状与求平均区域一致。',
        ifOmitted: '必填，成对出现。',
        tip: '所有条件区域都要和求平均区域同样大小。',
        example: 'C2:C6',
        pitfallRank: 2,
      },
      {
        key: 'criteria1',
        zh: '条件1',
        en: 'criteria1',
        required: true,
        desc: '对应条件区域1 的判定，如 "已交"。',
        accepts: '数字、文字、">60"、 "<>未交"、 "王*" 等，带符号加引号。',
        ifOmitted: '必填。',
        tip: '多条件是 AND 关系，全部满足才纳入平均。',
        example: '"已交"',
      },
      {
        key: 'criteria_range2',
        zh: '条件区域2',
        en: 'criteria_range2',
        required: false,
        desc: '第二个条件核查的区域，如成绩列 B2:B100（注意若它同时是求平均区域，可复用）。',
        accepts: '同条件区域1。',
        ifOmitted: '单条件时省略，改用 AVERAGEIF 更省事。',
        tip: '可继续加第 3、第 4 对条件。',
        example: 'B2:B6',
      },
      {
        key: 'criteria2',
        zh: '条件2',
        en: 'criteria2',
        required: false,
        desc: '对应条件区域2 的判定，如 ">60"。',
        accepts: '同条件1。',
        ifOmitted: '与条件区域2 成对。',
        tip: '想做区间平均就用同一个求平均区域写两遍条件，如 ">60" 与 "<=80"。',
        example: '">60"',
      },
    ],
  },
  returnValue: '返回所有条件同时成立时，对应求平均区域里数字的平均值。',
  examples: [
    {
      title: '示例 1：已交且成绩>60 同学的平均分',
      scene: '只给「真交卷且及格」的人算平均，剔除未交和不及格。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEIFS(B2:B6,C2:C6,"已交",B2:B6,">60")',
      result: '85（(85+92+78) ÷ 3 = 85；李四59、赵六未交 排除）',
      explanation:
        '求平均区域 B 排第一；然后 (C,"已交") 与 (B,">60") 两个条件都满足的行才纳入。注意成绩列 B 既当求平均区域又当第二个条件区域。',
    },
    {
      title: '示例 2：成绩落在 60~80 区间的平均分',
      scene: '只取中分段（60<成绩≤80）来平均，需要上下界两个边界条件。',
      dataTsv: STATUS_TSV,
      dataAnchor: 'A1',
      formula: '=AVERAGEIFS(B2:B6,B2:B6,">60",B2:B6,"<=80")',
      result: '78（仅钱七78 落入区间；(78)/1=78）',
      explanation: '同一个成绩列 B 作为求平均区域，又写两遍条件框出 60~80 的上下界，命中的数字才参与平均。',
    },
  ],
  pitfalls: [
    {
      title: '把求平均区域写到了条件后面（和 COUNTIFS 混淆）',
      reason: 'AVERAGEIFS / SUMIFS 都是「数值区域在前」；COUNTIFS 没有数值区域。照 COUNTIFS 习惯把区域写后面会报 #VALUE!。',
      fix: '牢记顺序：=AVERAGEIFS(求平均区域, 条件区域1, 条件1, …)。数值区域永远第一。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '条件区域形状不一致',
      reason: '求平均区域与每个条件区域必须行列数相同，否则 #VALUE!。',
      fix: '统一整列选取（如 B:B、C:C），或保证起止行完全一致。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '没有任何行满足全部条件，得到 #DIV/0!',
      reason: '多条件越收越窄，可能一个都不命中，分母为 0 报错。',
      fix: '外套 IFERROR：=IFERROR(AVERAGEIFS(...),"无匹配")，或先用 COUNTIFS 看命中数。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
    {
      title: '条件里的符号漏了引号',
      reason: '">60"、 "<>未交" 必须加半角双引号，否则 #NAME?。',
      fix: '统一用带引号文本条件；引用单元格时用 ">"&E2 拼接。',
      level: 'low',
      errorCode: '#NAME?',
    },
  ],
  related: [
    {
      id: 'averageif',
      kind: 'companion',
      why: '单条件平均用 AVERAGEIF；多条件才需要 AVERAGEIFS。',
    },
    {
      id: 'sumifs',
      kind: 'companion',
      why: '同样是「数值区域在前 + 多条件」，但 SUMIFS 求和、AVERAGEIFS 求平均，参数顺序一致。',
    },
    {
      id: 'countifs',
      kind: 'companion',
      why: '想先数「满足条件有几人」用 COUNTIFS，再考虑平均。',
    },
    {
      id: 'average',
      kind: 'confusable',
      why: '不需要任何条件时，直接用 AVERAGE 求整体均值即可。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {
      average_range: 'B2:B6',
      criteria_range1: 'C2:C6',
      criteria_range2: 'B2:B6',
    },
    fields: [
      {
        key: 'average_range',
        label: '求平均区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列，放在最前面',
      },
      {
        key: 'criteria_range1',
        label: '条件区域1',
        type: 'ref',
        default: 'C2:C6',
        hint: '状态列',
      },
      {
        key: 'criteria1',
        label: '条件1',
        type: 'text',
        default: '"已交"',
        hint: '带符号要加引号',
      },
      {
        key: 'criteria_range2',
        label: '条件区域2',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列',
      },
      {
        key: 'criteria2',
        label: '条件2',
        type: 'text',
        default: '">60"',
        hint: '带符号要加引号',
      },
    ],
    template:
      '=AVERAGEIFS({average_range},{criteria_range1},{criteria1},{criteria_range2},{criteria2})',
    cases: [
      {
        label: '已交且>60 的平均分 85',
        type: 'ok',
        values: {
          average_range: 'B2:B6',
          criteria_range1: 'C2:C6',
          criteria1: '"已交"',
          criteria_range2: 'B2:B6',
          criteria2: '">60"',
        },
        expect: '85',
        note: '(85+92+78)/3=85，李四59、赵六未交排除',
      },
      {
        label: '条件1 没加引号',
        type: 'error',
        values: {
          average_range: 'B2:B6',
          criteria_range1: 'C2:C6',
          criteria1: '已交',
          criteria_range2: 'B2:B6',
          criteria2: '">60"',
        },
        expect: '#NAME?',
        note: '裸写文本条件 → #NAME?',
      },
      {
        label: '条件区域行数不一致',
        type: 'error',
        values: {
          average_range: 'B2:B6',
          criteria_range1: 'C2:C6',
          criteria1: '"已交"',
          criteria_range2: 'B2:B5',
          criteria2: '">60"',
        },
        expect: '#VALUE!',
        note: '第二个条件区域只有 4 行 → #VALUE!',
      },
      {
        label: '没有任何命中',
        type: 'error',
        values: {
          average_range: 'B2:B6',
          criteria_range1: 'C2:C6',
          criteria1: '"及格"',
          criteria_range2: 'B2:B6',
          criteria2: '">60"',
        },
        expect: '#DIV/0!',
        note: '没有「及格」状态，分母为 0 → #DIV/0!',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ MAX ============================ */

const EXTREME_TSV = '姓名\t成绩\n张三\t85\n李四\t59\n王五\t92\n赵六\t45\n钱七\t78';

const maxEntry: FunctionEntry = {
  id: 'max',
  enName: 'MAX',
  zhName: '最大值',
  zhCommon: ['最大数', '最大值', '最大'],
  alias: ['求最大', '最大是多少', '峰值'],
  category: 'statistical',
  abbr: 'zdz',
  pinyin: 'zuidazhi',
  keywords: ['最大值', '最大数', '求最大', '最大多少', '峰值', '最高分'],
  difficulty: 1,
  usageLevel: 78,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'MAX 忽略空格、文字、逻辑值（TRUE/FALSE）和错误值；若区域含错误值会直接报错，需先清理。',
  },
  oneLiner: '找出最大的那个数',
  summary:
    '在一堆数字里挑出最大的那个：最高分、单日最高销量、最大订单金额。它只认数字，空格、文字、TRUE/FALSE 都被忽略；但它不会跳过错误值——区域里只要有 #N/A，整公式就报错。比大小时常和 MIN 配对使用。',
  syntax: {
    patternCn: '=MAX(值1, [值2], …)',
    patternEn: '=MAX(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个要比较的区域或数值，如 B2:B100。',
        accepts: '区域、零散单元格、或直接数字。',
        ifOmitted: '必填，至少给一个区域。',
        tip: '可以一次框选多个区域，MAX 会跨区域取最大。',
        example: 'B2:B6',
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '更多区域或数值，可继续追加。',
        accepts: '同「值1」。',
        ifOmitted: '省略无影响。',
        tip: '参数间逗号隔开，MAX 自动忽略其中的文字与空格。',
        example: 'D2:D6',
      },
    ],
  },
  returnValue: '返回参数中所有数字的最大值（忽略空格、文字、逻辑值）。',
  examples: [
    {
      title: '示例 1：这组成绩的最高分',
      scene: '老师想一眼看出全班最高分是谁、多少分。',
      dataTsv: EXTREME_TSV,
      dataAnchor: 'A1',
      formula: '=MAX(B2:B6)',
      result: '92（王五的成绩，其余 85、59、45、78 都小于它）',
      explanation: 'MAX 在成绩列里逐个比大小，忽略文字和空格，只挑出最大的数字 92。',
    },
    {
      title: '示例 2：多列合并取最大',
      scene: '语文、数学两科，要找所有分数里的全局最高分。',
      dataTsv: '姓名\t语文\t数学\n张三\t85\t90\n李四\t59\t88\n王五\t92\t缺考',
      dataAnchor: 'A1',
      formula: '=MAX(B2:B4,C2:C4)',
      result: '92（85、90、59、88、92 中最大；「缺考」被忽略）',
      explanation: '两个区域被合并比较，「缺考」作为文字不参与，最终最大值仍是 92。',
    },
  ],
  pitfalls: [
    {
      title: '区域里有错误值，MAX 直接报错',
      reason: 'MAX 不像 AVERAGE 那样「温和」，区域中只要有一个 #N/A 等错误，结果就是错误本身。',
      fix: '先用 IFERROR 清理，或用 =AGGREGATE(4,6,B2:B100) 忽略错误取最大。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '文字型数字被当文字忽略',
      reason: '导出的「0012」是文本，MAX 把它当文字跳过，可能漏掉真正的大数。',
      fix: '先用 VALUE() / 「分列」转成数字，MAX 才能正确比较。',
      level: 'mid',
    },
    {
      title: 'TRUE / FALSE 不参与比较',
      reason: '逻辑值 TRUE、FALSE 在单元格引用里被 MAX 忽略，不会当 1 / 0 参与。',
      fix: '若要把 TRUE 当 1 比较，先乘 1 或用 -- 转成数字再 MAX。',
      level: 'low',
    },
    {
      title: '以为 MAX 能返回「对应的人名」',
      reason: 'MAX 只给数字，不给「是谁」。很多人写完 MAX 还想顺便带出名字。',
      fix: '配合 INDEX+MATCH 或 XLOOKUP 用最大值反查姓名：=XLOOKUP(MAX(B2:B6),B2:B6,A2:A6)。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'min',
      kind: 'companion',
      why: '看最大用 MAX，看最小用 MIN，极值分析常成对出现。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '看极值用 MAX/MIN，看整体水平用 AVERAGE，一起描述分布。',
    },
    {
      id: 'count',
      kind: 'companion',
      why: '先用 COUNT 确认有几个有效数字，再取 MAX 更稳妥。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: 'MAX 看峰值、SUM 看总量，常放在同一张汇总表里。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'B2:B6' },
    fields: [
      {
        key: 'range',
        label: '要比较的区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列',
      },
    ],
    template: '=MAX({range})',
    cases: [
      {
        label: '最高分 92',
        type: 'ok',
        values: { range: 'B2:B6' },
        expect: '92',
        note: '王五的 92 最高',
      },
      {
        label: '区域写成 B:B（缺行号）',
        type: 'error',
        values: { range: 'B:B' },
        expect: '#REF!',
        note: 'B:B 不是合法区域引用',
      },
      {
        label: '区域写成 A:B（缺行号）',
        type: 'error',
        values: { range: 'A:B' },
        expect: '#REF!',
        note: '缺少行号，区域解析失败',
      },
      {
        label: '区域写成 2:6（缺列标）',
        type: 'error',
        values: { range: '2:6' },
        expect: '#REF!',
        note: '缺少列标，区域解析失败',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ MIN ============================ */

const minEntry: FunctionEntry = {
  id: 'min',
  enName: 'MIN',
  zhName: '最小值',
  zhCommon: ['最小数', '最小值', '最小'],
  alias: ['求最小', '最小是多少', '最低'],
  category: 'statistical',
  abbr: 'zxz',
  pinyin: 'zuixiaozhi',
  keywords: ['最小值', '最小数', '求最小', '最小多少', '最低分', '谷值'],
  difficulty: 1,
  usageLevel: 72,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'MIN 忽略空格、文字、逻辑值（TRUE/FALSE）和错误值；区域含错误值会直接报错，需先清理。',
  },
  oneLiner: '找出最小的那个数',
  summary:
    '在一堆数字里挑出最小的那个：最低分、最低库存、最小订单金额。和 MAX 一样只认数字，忽略空格、文字、TRUE/FALSE；同样不会跳过错误值——区域里有 #N/A 就会报错。找最低点时常和 MAX 一起用。',
  syntax: {
    patternCn: '=MIN(值1, [值2], …)',
    patternEn: '=MIN(value1, [value2], …)',
    args: [
      {
        key: 'value1',
        zh: '值1',
        en: 'value1',
        required: true,
        desc: '第一个要比较的区域或数值，如 B2:B100。',
        accepts: '区域、零散单元格、或直接数字。',
        ifOmitted: '必填，至少给一个区域。',
        tip: '可一次框选多个区域，MIN 跨区域取最小。',
        example: 'B2:B6',
      },
      {
        key: 'value2',
        zh: '值2',
        en: 'value2',
        required: false,
        desc: '更多区域或数值，可继续追加。',
        accepts: '同「值1」。',
        ifOmitted: '省略无影响。',
        tip: '参数间逗号隔开，MIN 自动忽略文字与空格。',
        example: 'D2:D6',
      },
    ],
  },
  returnValue: '返回参数中所有数字的最小值（忽略空格、文字、逻辑值）。',
  examples: [
    {
      title: '示例 1：这组成绩的最低分',
      scene: '老师想快速定位全班最低分，重点关注后进同学。',
      dataTsv: EXTREME_TSV,
      dataAnchor: 'A1',
      formula: '=MIN(B2:B6)',
      result: '45（赵六的成绩，其余都大于它）',
      explanation: 'MIN 在成绩列里逐个比大小，忽略文字和空格，挑出最小的数字 45。',
    },
    {
      title: '示例 2：多列合并取最小',
      scene: '语文、数学两科，找所有分数里的全局最低分。',
      dataTsv: '姓名\t语文\t数学\n张三\t85\t90\n李四\t59\t88\n王五\t92\t缺考',
      dataAnchor: 'A1',
      formula: '=MIN(B2:B4,C2:C4)',
      result: '59（85、90、59、88、92 中最小；「缺考」被忽略）',
      explanation: '两个区域合并比较，「缺考」作为文字不参与，最终最小值仍是 59。',
    },
  ],
  pitfalls: [
    {
      title: '区域里有错误值，MIN 直接报错',
      reason: '和 MAX 一样，区域中只要有一个 #N/A，MIN 的结果就是错误本身。',
      fix: '先用 IFERROR 清理，或用 =AGGREGATE(5,6,B2:B100) 忽略错误取最小。',
      level: 'high',
      errorCode: '#N/A',
    },
    {
      title: '空格 / 空文本被当成 0',
      reason: '常见误解：以为 MIN 会把空格当 0 从而返回 0。其实真正空着的格子被忽略；只有单元格里「真的写了 0」才会返回 0。',
      fix: '想排除 0 可用数组公式 =MIN(IF(B2:B6>0,B2:B6))（Ctrl+Shift+回车），或先清理 0 值。',
      level: 'mid',
    },
    {
      title: '文字型数字被当文字忽略',
      reason: '导出的「0012」是文本，MIN 跳过它，可能漏掉真正的小数。',
      fix: '先用 VALUE() / 「分列」转成数字，MIN 才能正确比较。',
      level: 'low',
    },
    {
      title: '以为 MIN 能返回「对应的人名」',
      reason: 'MIN 只给数字，不给「是谁」。',
      fix: '配合 INDEX+MATCH 或 XLOOKUP 用最小值反查姓名：=XLOOKUP(MIN(B2:B6),B2:B6,A2:A6)。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'max',
      kind: 'companion',
      why: '看最小用 MIN，看最大用 MAX，极值分析常成对出现。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '看极值用 MIN/MAX，看整体水平用 AVERAGE，一起描述分布。',
    },
    {
      id: 'count',
      kind: 'companion',
      why: '先用 COUNT 确认有几个有效数字，再取 MIN 更稳妥。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: 'MIN 看谷值、SUM 看总量，常放在同一张汇总表里。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'B2:B6' },
    fields: [
      {
        key: 'range',
        label: '要比较的区域',
        type: 'ref',
        default: 'B2:B6',
        hint: '成绩列',
      },
    ],
    template: '=MIN({range})',
    cases: [
      {
        label: '最低分 45',
        type: 'ok',
        values: { range: 'B2:B6' },
        expect: '45',
        note: '赵六的 45 最低',
      },
      {
        label: '区域写成 B:B（缺行号）',
        type: 'error',
        values: { range: 'B:B' },
        expect: '#REF!',
        note: 'B:B 不是合法区域引用',
      },
      {
        label: '区域写成 A:B（缺行号）',
        type: 'error',
        values: { range: 'A:B' },
        expect: '#REF!',
        note: '缺少行号，区域解析失败',
      },
      {
        label: '区域写成 2:6（缺列标）',
        type: 'error',
        values: { range: '2:6' },
        expect: '#REF!',
        note: '缺少列标，区域解析失败',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================ 导出 ============================ */

const pack: Record<string, FunctionEntry> = {
  count: countEntry,
  counta: countaEntry,
  countif: countifEntry,
  countifs: countifsEntry,
  average: averageEntry,
  averageif: averageifEntry,
  averageifs: averageifsEntry,
  max: maxEntry,
  min: minEntry,
  averagea: averageaEntry,
  median: medianEntry,
  'mode-sngl': modeSnglEntry,
  'mode-mult': modeMultEntry,
  large: largeEntry,
  small: smallEntry,
  'rank-eq': rankEqEntry,
  'rank-avg': rankAvgEntry,
  'percentile-inc': percentileIncEntry,
  'percentile-exc': percentileExcEntry,
  'quartile-inc': quartileIncEntry,
  'quartile-exc': quartileExcEntry,
  'stdev-s': stdevSEntry,
  'stdev-p': stdevPEntry,
  stdeva: stdevaEntry,
  stdevpa: stdevpaEntry,
  'var-s': varSEntry,
  'var-p': varPEntry,
  vara: varaEntry,
  varpa: varpaEntry,
  countblank: countblankEntry,
  geomean: geomeanEntry,
  harmean: harmeanEntry,
  trimmean: trimmeanEntry,
  devsq: devsqEntry,
  avedev: avedevEntry,
  skew: skewEntry,
  kurt: kurtEntry,
  frequency: frequencyEntry,
  permutationa: permutationaEntry,
  correl: correlEntry,
  pearson: pearsonEntry,
  rsq: rsqEntry,
  slope: slopeEntry,
  intercept: interceptEntry,
  steyx: steyxEntry,
  'forecast-linear': forecastLinearEntry,
  trend: trendEntry,
  growth: growthEntry,
  linest: linestEntry,
  logest: logestEntry,
  'covariance-s': covarianceSEntry,
  'covariance-p': covariancePEntry,
  'norm-dist': normDistEntry,
  'norm-s-dist': normSDistEntry,
  'binom-dist': binomDistEntry,
  'poisson-dist': poissonDistEntry,
  't-dist': tDistEntry,
};

export default pack;
