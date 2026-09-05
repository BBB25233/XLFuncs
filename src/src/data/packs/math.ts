import type { FunctionEntry } from '@/types';
import sumifsEntry from '@/data/samples/sumifs';
import absEntry from '@/data/samples/abs';
import signEntry from '@/data/samples/sign';
import gcdEntry from '@/data/samples/gcd';
import lcmEntry from '@/data/samples/lcm';
import modEntry from '@/data/samples/mod';
import quotientEntry from '@/data/samples/quotient';
import powerEntry from '@/data/samples/power';
import productEntry from '@/data/samples/product';
import sqrtEntry from '@/data/samples/sqrt';
import sumsqEntry from '@/data/samples/sumsq';
import seriesumEntry from '@/data/samples/seriesum';
import factEntry from '@/data/samples/fact';
import factdoubleEntry from '@/data/samples/factdouble';
import multinomialEntry from '@/data/samples/multinomial';
import combinEntry from '@/data/samples/combin';
import combinaEntry from '@/data/samples/combina';
import permutEntry from '@/data/samples/permut';
import romanEntry from '@/data/samples/roman';
import baseEntry from '@/data/samples/base';
import decimalEntry from '@/data/samples/decimal';
import arabicEntry from '@/data/samples/arabic';
import randEntry from '@/data/samples/rand';
import randbetweenEntry from '@/data/samples/randbetween';
import ceilingMathEntry from '@/data/samples/ceiling-math';
import floorMathEntry from '@/data/samples/floor-math';
import mroundEntry from '@/data/samples/mround';
import evenEntry from '@/data/samples/even';
import oddEntry from '@/data/samples/odd';
import truncEntry from '@/data/samples/trunc';
import piEntry from '@/data/samples/pi';
import sinEntry from '@/data/samples/sin';
import cosEntry from '@/data/samples/cos';
import tanEntry from '@/data/samples/tan';
import asinEntry from '@/data/samples/asin';
import acosEntry from '@/data/samples/acos';
import atanEntry from '@/data/samples/atan';
import atan2Entry from '@/data/samples/atan2';
import sinhEntry from '@/data/samples/sinh';
import coshEntry from '@/data/samples/cosh';
import tanhEntry from '@/data/samples/tanh';
import asinhEntry from '@/data/samples/asinh';
import acoshEntry from '@/data/samples/acosh';
import atanhEntry from '@/data/samples/atanh';
import degreesEntry from '@/data/samples/degrees';
import radiansEntry from '@/data/samples/radians';
import sqrtpiEntry from '@/data/samples/sqrtpi';
import sumx2my2Entry from '@/data/samples/sumx2my2';
import sumx2py2Entry from '@/data/samples/sumx2py2';
import sumxmy2Entry from '@/data/samples/sumxmy2';
import mdetermEntry from '@/data/samples/mdeterm';
import minverseEntry from '@/data/samples/minverse';
import mmultEntry from '@/data/samples/mmult';

/**
 * 数学与三角类 8 条：SUMIFS（已发布样板，一字不改）+ 其余 7 条完整内容
 * 写作口径：PRD §10.4 / §10.5.2，增补件 §4，深度与语气模仿 samples/sumifs.ts
 */

/** SUM · 求和 */
const sumEntry: FunctionEntry = {
  id: 'sum',
  enName: 'SUM',
  zhName: '求和',
  zhCommon: ['求和', '加总', '合计'],
  alias: ['数字相加', '金额合计', '累计求和'],
  category: 'math',
  abbr: 'qh',
  pinyin: 'qiuhe',
  keywords: ['求和', '加总', '汇总金额', '数字相加', '区间求和', '累计'],
  difficulty: 1,
  usageLevel: 97,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '把一堆数字加起来',
  summary:
    '最常见的函数，没有之一。把一堆数字、一整列、甚至几个不连续的区域全部加在一起。SUM 很「聪明」：它会自动跳过空格和真正的文本，只加数字；但它也很「老实」：区域里只要有一个错误值，整个结果就会被这个错误值带歪。',
  syntax: {
    patternCn: '=SUM(数字1, [数字2], …)',
    patternEn: '=SUM(number1, [number2], …)',
    args: [
      {
        key: 'number1',
        zh: '数字1',
        en: 'number1',
        required: true,
        desc: '第一个要加的东西：可以是一个单元格、一整列区域、或者一个具体数字。',
        accepts: 'B2 · A2:A100（一整列）· {1,2,3}（数组）· 多个区域用逗号隔开 A2:A5,C2:C5。',
        ifOmitted: '这是必填参数，至少给一个数字或区域，否则公式不成立。',
        tip: '区域和单个数字可以混着写：=SUM(A2:A10, B2) 也行。',
        example: 'A2:A100',
        pitfallRank: 1,
      },
      {
        key: 'number2',
        zh: '数字2',
        en: 'number2',
        required: false,
        desc: '第二个及以后的数字/区域，想加几段就继续用逗号往后接。',
        accepts: '同「数字1」。',
        ifOmitted: '不写就只加第一个参数。经常会写多个区域，如 =SUM(A2:A5,C2:C5)。',
        tip: '可一直追加，没有数量上限（受公式长度限制）。',
        example: 'C2:C5',
      },
    ],
  },
  returnValue: '返回所有参数里数字的总和；参数里纯文本与空格会被自动忽略，不参与计算。',
  examples: [
    {
      title: '示例 1：把一整列销售额加起来',
      scene: '销售表出来，领导只要一个总数：这 12 笔一共卖了多少。',
      tableId: 'sales',
      dataAnchor: 'A1',
      formula: '=SUM(F2:F13)',
      result: '12 笔金额加总，约 451400（具体看样表数据）',
      explanation:
        '直接框住金额那一列 F2:F13，SUM 会把里面所有数字加起来，空行和标题行自动跳过。',
    },
    {
      title: '示例 2：把几个不连续的区域一起加',
      scene: '上半年和下半年的数据分在两列，要合并算全年总额。',
      dataTsv: '月份\t上半年\t下半年\n1月\t1000\t1200\n2月\t1500\t1300\n3月\t900\t1100',
      dataAnchor: 'A1',
      formula: '=SUM(B2:B4,C2:C4)',
      result: '1000+1500+900+1200+1300+1100 = 7000',
      explanation:
        '多个区域用逗号隔开，SUM 会先把它们摊平再统一相加，相当于把两列拼起来求和。',
    },
    {
      title: '示例 3：区域里混了文本数字，结果「悄悄变少」',
      scene:
        '从系统导出的表里，有些金额其实是文本（左上角带绿三角），肉眼看不出差别，SUM 却少算了。',
      dataTsv: '名称\t数额\n一季度\t100\n二季度\t"200"\n三季度\t150\n四季度\t"已结算"',
      dataAnchor: 'A1',
      formula: '=SUM(B2:B5)',
      result: '250（只加了 100 和 150，文本"200"和"已结算"被跳过）',
      explanation:
        'SUM 只认真正的数字，文本型数字 "200" 和文字 "已结算" 都会被忽略——公式不报错，但总数比你想的小。用 VALUE() 转一下或分列转成数字再算。',
    },
  ],
  pitfalls: [
    {
      title: '文本型数字被悄悄跳过，总数算少还不报错',
      reason:
        '从别的系统导进来的金额常常是「文本格式的数字」，单元格左上角带绿三角。SUM 会自动忽略文本，所以你以为加了，其实没加。',
      fix: '选中那些单元格 → 点黄色感叹号 →「转换为数字」，或用 =VALUE(B2) 转一遍，再 SUM。',
      level: 'high',
    },
    {
      title: '区域里有一个错误值，整个 SUM 跟着报错',
      reason:
        'SUM 不会跳过 #VALUE!、#N/A 这类错误值，它们会像病毒一样传染整条公式，导致 SUM 也返回同一个错误。',
      fix: '先用 IFERROR 把错误值清成 0：=SUM(IFERROR(B2:B100,0))，或先修掉源头那格的错误。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '求和时没区分隐藏行/筛选行',
      reason:
        'SUM 对隐藏行、筛选掉的行一视同仁，照样把它们加进去。要「只看可见行」时它会算错。',
      fix: '需要忽略隐藏行时用 SUBTOTAL(109, 区域)（109 代表可见单元格求和），而不是 SUM。',
      level: 'mid',
    },
    {
      title: '合并单元格导致重复或漏算',
      reason:
        '带合并单元格的区域用 SUM 很容易把同一个值算两次，或漏掉被合并覆盖的格子。',
      fix: '求和前先「取消合并并填充」，让每个数字都待在自己独立的格子里，再框区域求和。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'sumif',
      kind: 'confusable',
      why: '只加「满足某个条件」的那些数时用 SUMIF，比先筛再 SUM 省一步。',
    },
    {
      id: 'sumifs',
      kind: 'companion',
      why: '要同时满足好几个条件才相加时用 SUMIFS（多条件求和）。',
    },
    {
      id: 'sumproduct',
      kind: 'companion',
      why: '要「先对应相乘、再把乘积相加」（如 单价×数量 合计）时用 SUMPRODUCT。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '想要的不是总和而是平均数时，用 AVERAGE，它会顺手帮你除以个数。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'F2:F13' },
    fields: [
      { key: 'range', label: '求和区域', type: 'ref', rangeKey: 'range', default: 'F2:F13', placeholder: '如 F2:F13', hint: '要加起来的那一列数字，如金额列 F2:F13。' },
    ],
    template: '=SUM({range})',
    cases: [
      { label: '✅ 正确：销售额总和', type: 'ok', values: { range: 'F2:F13' }, expect: '398400', note: '销售表金额列 F2:F13 共 12 笔加总。' },
      { label: '❌ 区域列超出表范围', type: 'error', values: { range: 'X2:X13' }, expect: '#REF!', note: 'X 列在销售表里不存在，引用无效。' },
      { label: '❌ 区域语法非法', type: 'error', values: { range: 'F2:' }, expect: '#REF!', note: 'F2: 不是合法的「左上角:右下角」区域写法。' },
      { label: '❌ 区域列号越界', type: 'error', values: { range: 'ABC2:ABC13' }, expect: '#REF!', note: 'ABC 列远超出 7 列的销售表，引用无效。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/** SUMIF · 条件求和 */
const sumifEntry: FunctionEntry = {
  id: 'sumif',
  enName: 'SUMIF',
  zhName: '条件求和',
  zhCommon: ['条件求和', '单条件求和', '按条件加总'],
  alias: ['按条件汇总', '区域求和', '分类合计'],
  category: 'math',
  abbr: 'tjqh',
  pinyin: 'tiaojianqiuhe',
  keywords: ['条件求和', '单条件汇总', '按条件加总', '分类合计', '区域求和', '金额按条件加'],
  difficulty: 2,
  usageLevel: 80,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      '注意参数顺序：SUMIF 是「条件区域在前、求和区域在后」，而多条件的 SUMIFS 是「求和区域在前」，两者相反。',
  },
  oneLiner: '只把满足一个条件的数字加起来',
  summary:
    '比 SUM 多了一个「门槛」：先判断某一列满不满足你的条件，满足的那些行，才把对应的数字加进来。只有一组条件时用它最顺手——区域等于某值、金额大于某数都行。要和 SUMIFS 区分：这里条件区域写在前面。',
  syntax: {
    patternCn: '=SUMIF(条件区域, 条件, [求和区域])',
    patternEn: '=SUMIF(range, criteria, [sum_range])',
    args: [
      {
        key: 'range',
        zh: '条件区域',
        en: 'range',
        required: true,
        desc: '要在哪一列里「核对条件」，比如区域列、姓名列。',
        accepts: '一列区域，如 C2:C13。',
        ifOmitted: '这是必填参数。',
        tip: '行数必须和「求和区域」一致，否则结果可能不对甚至报 #VALUE!。',
        example: 'C2:C13',
        pitfallRank: 1,
      },
      {
        key: 'criteria',
        zh: '条件',
        en: 'criteria',
        required: true,
        desc: '满足什么才算数。',
        accepts: '"华东"（文本）· ">10000"（比较）· ">="&H1（引用单元格）· "*东*"（包含）。',
        ifOmitted: '这是必填参数。',
        tip: '除纯数字外，条件和比较符号都要带半角双引号。',
        example: '"华东"',
        pitfallRank: 2,
      },
      {
        key: 'sum_range',
        zh: '求和区域',
        en: 'sum_range',
        required: false,
        desc: '真正要加起来的那一列，比如金额列。',
        accepts: '一列数字区域，如 F2:F13，行数要和「条件区域」一致。',
        ifOmitted:
          '【常见坑】省略时，Excel 默认把「条件区域」本身当作求和区域来加——也就是加的是你用来比对的这一列。',
        tip: '想加别的列一定要显式写第三个参数；只有「条件列就是数字列」时才能省略。',
        example: 'F2:F13',
      },
    ],
  },
  returnValue:
    '返回条件区域里满足条件的那些行、在求和区域中的数字之和；一行都不满足时返回 0。',
  examples: [
    {
      title: '示例 1：华东区的销售额合计',
      scene: '只要华东区这部分的销售额，其它区域不要。',
      tableId: 'sales',
      dataAnchor: 'A1',
      formula: '=SUMIF(C2:C13,"华东",F2:F13)',
      result: '华东区共 6 笔，加总约 198400（具体看样表）',
      explanation: '条件区域 C 列比对"华东"，命中的行把对应的金额 F 列加进来。求和区域写在最后。',
    },
    {
      title: '示例 2：金额大于 1 万的合计',
      scene: '不管区域，只要单笔超过 1 万就计入。',
      tableId: 'sales',
      dataAnchor: 'A1',
      formula: '=SUMIF(F2:F13,">10000")',
      result: '所有 >10000 的金额相加（省略求和区域，加的就是 F 列自己）',
      explanation:
        '这里条件区域和求和区域都是金额列，所以可以省略第三个参数——加的正是用来比对的这一列。',
    },
    {
      title: '示例 3：省略求和区域却加错了列',
      scene: '想求华东区的「数量」合计，随手省略了求和区域，结果出来的是区域名的某种「和」。',
      dataTsv: '区域\t数量\n华东\t5\n华南\t3\n华东\t8\n华北\t2',
      dataAnchor: 'A1',
      formula: '=SUMIF(A2:A5,"华东")',
      result: '0（文本"华东"当数字加是 0，不是你要的 13）',
      explanation:
        '省略 sum_range 时，Excel 把条件区域 A 列本身当数字加——可 A 列是文本，合计为 0。正确写法是 =SUMIF(A2:A5,"华东",B2:B5)。',
    },
  ],
  pitfalls: [
    {
      title: '条件区域和求和区域行数对不上',
      reason:
        'Excel 要求两者行数、形状一致。多框一行或少框一行，它不知道该拿哪一列去对应，直接报错。',
      fix: '把两个区域框成同样行数，如统一 C2:C13 与 F2:F13（都是 12 行）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '文本/比较条件忘了加半角双引号',
      reason: '裸写 华东 或 >10000 时，Excel 把它们当成一个「名称」去找，找不到就报错。',
      fix: '一律加引号：写 "华东"、">10000"。引用单元格用 ">="&H1。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '省略求和区域，结果加错了列',
      reason:
        'SUMIF 省略第三参数时，会把「条件区域」自己当成求和区域。条件区域若是文本列，合计就是 0。',
      fix: '想加别的列就显式写第三个参数：=SUMIF(条件列,条件,求和列)。只有条件列本身就是数字列时才能省略。',
      level: 'high',
    },
    {
      title: '和 SUMIFS 的参数顺序搞反',
      reason:
        'SUMIF 是「条件区域, 条件, 求和区域」，而 SUMIFS 是「求和区域, 条件区域, 条件」——从单条件改多条件时容易照抄旧顺序。',
      fix: '记住：SUMIF 条件在前；SUMIFS 求和区域在前。需要时直接对照两个函数的语法行。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'sumifs',
      kind: 'confusable',
      why: '要同时挂好几组条件时用 SUMIFS，但参数顺序相反（求和区域在前），别照抄 SUMIF 的写法。',
    },
    {
      id: 'sumproduct',
      kind: 'alternative',
      why: '条件是「或者」关系、或要先相乘再按条件加时，SUMIF 做不到，改用 SUMPRODUCT。',
    },
    {
      id: 'countif',
      kind: 'companion',
      why: '要数「有几行满足条件」而不是「金额多少」时，用 COUNTIF（写法几乎一样）。',
    },
    {
      id: 'averageif',
      kind: 'companion',
      why: '要算「满足条件的那些行的平均值」时，用 AVERAGEIF。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { range: 'C2:C13', sum_range: 'F2:F13' },
    fields: [
      { key: 'range', label: '条件区域', type: 'ref', rangeKey: 'range', default: 'C2:C13', placeholder: '如 C2:C13', hint: '要核对条件的列，如区域列 C2:C13。' },
      { key: 'criteria', label: '条件', type: 'text', default: '"华东"', placeholder: '如 "华东"', hint: '文本和比较符号都要放进半角双引号里。' },
      { key: 'sum_range', label: '求和区域', type: 'ref', rangeKey: 'sum_range', default: 'F2:F13', placeholder: '如 F2:F13', hint: '真正要加的列；省略则加条件列本身（文本列会得 0）。' },
    ],
    template: '=SUMIF({range},{criteria},{sum_range})',
    cases: [
      { label: '✅ 正确：华东区销售额合计', type: 'ok', values: { range: 'C2:C13', criteria: '"华东"', sum_range: 'F2:F13' }, expect: '198400', note: '区域=华东 的 6 笔金额加总。' },
      { label: '❌ 文本条件忘了加引号', type: 'error', values: { range: 'C2:C13', criteria: '华东', sum_range: 'F2:F13' }, expect: '#NAME?', note: '裸写 华东 被当成名称去找，找不到报错。' },
      { label: '❌ 比较符号忘了加引号', type: 'error', values: { range: 'C2:C13', criteria: '>10000', sum_range: 'F2:F13' }, expect: '#NAME?', note: '裸写 >10000 被当成名称去找，找不到报错。' },
      { label: '❌ 条件区域与求和区域行数不一致', type: 'error', values: { range: 'C2:C13', criteria: '"华东"', sum_range: 'F2:F10' }, expect: '#VALUE!', note: '条件 12 行、求和 9 行，对应不上。' },
      { label: '❌ 区域列超出表范围', type: 'error', values: { range: 'C2:C13', criteria: '"华东"', sum_range: 'X2:X13' }, expect: '#REF!', note: 'X 列不存在，求和区域引用无效。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/** SUMPRODUCT · 乘积和 */
const sumproductEntry: FunctionEntry = {
  id: 'sumproduct',
  enName: 'SUMPRODUCT',
  zhName: '乘积和',
  zhCommon: ['乘积和', '加权求和', '数组相乘求和'],
  alias: ['对应相乘求和', '加权合计', '多条件求和替代'],
  category: 'math',
  abbr: 'cjh',
  pinyin: 'chengjihe',
  keywords: ['乘积和', '对应相乘求和', '加权求和', '多条件求和', '数组运算', '矩阵相乘求和'],
  difficulty: 4,
  usageLevel: 58,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes:
      'SUMPRODUCT 不忽略文本，只要参与运算的区域里有一个文本单元格（哪怕是空格）就报 #VALUE!，这点与 SUMIFS 不同。',
  },
  oneLiner: '先对应相乘，再把乘积加起来',
  summary:
    '它干两件事：先把你给的若干组区域「逐行对应相乘」，再把所有乘积加总。最常见就是「单价×数量」合计，或者做加权求和。因为它支持条件表达式相乘，还能当「多条件求和」的万能替身——但代价是区域必须同维、且不能混进文本，否则直接报错。',
  syntax: {
    patternCn: '=SUMPRODUCT(数组1, [数组2], [数组3], …)',
    patternEn: '=SUMPRODUCT(array1, [array2], [array3], …)',
    args: [
      {
        key: 'array1',
        zh: '数组1',
        en: 'array1',
        required: true,
        desc: '第一组区域，如单价列。多个数组会逐行对应相乘后再求和。',
        accepts: '一列或一行数字区域，如 B2:B13。也支持条件表达式 (区域="华东")。',
        ifOmitted: '这是必填参数，至少给一个数组。',
        tip: '所有数组的「行数×列数」必须完全一样，否则报 #VALUE!。',
        example: 'B2:B13',
        pitfallRank: 1,
      },
      {
        key: 'array2',
        zh: '数组2',
        en: 'array2',
        required: false,
        desc: '第二组区域，如数量列，会和数组1逐行相乘。',
        accepts: '与数组1同维度的区域。',
        ifOmitted: '只给一个数组时，就是直接把这一列数字求和（等价于 SUM）。',
        tip: '做条件求和时常用 (区域="华东")*(金额>10000) 这种 0/1 相乘来筛选。',
        example: 'C2:C13',
      },
      {
        key: 'array3',
        zh: '数组3',
        en: 'array3',
        required: false,
        desc: '第三组及以后的数组，继续对应相乘。',
        accepts: '同维度区域。',
        ifOmitted: '不写就只乘前两组。',
        tip: '一般两组够用，更多组用于多重加权。',
        example: 'D2:D13',
      },
    ],
  },
  returnValue:
    '返回各组数组逐行对应相乘后、所有乘积的总和；只有一组数组时退化为该列数字之和。',
  examples: [
    {
      title: '示例 1：单价 × 数量 合计金额',
      scene: '有单价和数量两列，要算总金额，不想先加一列「小计」再 SUM。',
      dataTsv: '商品\t单价\t数量\nA\t10\t5\nB\t20\t3\nC\t15\t8\nD\t8\t10',
      dataAnchor: 'A1',
      formula: '=SUMPRODUCT(B2:B5,C2:C5)',
      result: '10×5+20×3+15×8+8×10 = 310',
      explanation:
        'B 列和 C 列逐行相乘（10×5、20×3…），再把四个乘积加起来，一步到位得到总额。',
    },
    {
      title: '示例 2：多条件求和（「或者」关系也好用）',
      scene:
        '要华东区、且单笔大于 1 万的金额合计——这是 SUMIFS 也能做的；换成「华东或华南」就只有 SUMPRODUCT 方便了。',
      dataTsv: '区域\t金额\n华东\t30000\n华南\t12000\n华东\t5000\n华北\t8000\n华东\t20000',
      dataAnchor: 'A1',
      formula: '=SUMPRODUCT((A2:A6="华东")*(B2:B6>10000)*B2:B6)',
      result: '华东且>10000：30000+20000 = 50000',
      explanation:
        '(区域="华东") 和 (金额>10000) 各自返回 TRUE/FALSE（即 1/0），相乘后只留下「同时成立」的行，再乘金额列求和。',
    },
    {
      title: '示例 3：加权平均（得分 × 权重）',
      scene: '几门课权重不同，要算加权平均而不是简单平均。',
      dataTsv: '科目\t得分\t权重\n语文\t80\t0.3\n数学\t90\t0.4\n英语\t70\t0.3',
      dataAnchor: 'A1',
      formula: '=SUMPRODUCT(B2:B4,C2:C4)/SUM(C2:C4)',
      result: '(80×0.3+90×0.4+70×0.3)/1 = 83',
      explanation: '先拿得分乘权重求和，再除以权重总和，得到加权平均分 83。',
    },
  ],
  pitfalls: [
    {
      title: '参与运算的区域里有空格/文本，直接报 #VALUE!',
      reason:
        'SUMPRODUCT 不像 SUMIFS 那样自动忽略文本。只要任意一组区域里出现一个文本单元格（哪怕看起来像空白的空格），整条公式就报错。',
      fix: '先用「分列」或 VALUE() 把文本转成数字；或先用 --(区域) 强制转数值。确认区域是纯数字再算。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '各组数组维度不一致',
      reason:
        'SUMPRODUCT 要求所有数组行数、列数完全相同，才能逐行对应。多一行少一列都对应不上。',
      fix: '把所有数组框成一样的范围，如统一 B2:B13 与 C2:C13（都是 12 行 1 列）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
    {
      title: '区域里混了错误值会传染整条公式',
      reason: '和 SUM 一样，任意一格 #N/A、#DIV/0! 都会让 SUMPRODUCT 返回同一个错误。',
      fix: '先用 IFERROR 把源头错误清成 0，再套 SUMPRODUCT。',
      level: 'mid',
      errorCode: '#N/A',
    },
    {
      title: '条件表达式忘记乘，写成相加',
      reason:
        '多条件筛选要靠「逻辑值相乘（1×1=1）」来取交集。写成加号会得到大于 1 的数，结果完全错但 Excel 不报错。',
      fix: '条件之间用乘号 * 连接：(区域="华东")*(金额>10000)；要「或者」才用加号 +。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'sumifs',
      kind: 'alternative',
      why:
        '条件只是简单的「并且」关系时，用 SUMIFS 更直观也不会被文本坑；SUMPRODUCT 适合「或者」、先乘后加等复杂场景。',
    },
    {
      id: 'sumif',
      kind: 'confusable',
      why: '只有一组条件时 SUMIF 更短，但 SUMPRODUCT 能做「先乘后按条件加」它做不到的事。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '只给一组数组时 SUMPRODUCT 就退化成 SUM；纯求和没必要上它。',
    },
    {
      id: 'average',
      kind: 'companion',
      why: '要的是加权「平均」而非「和」时，配合 SUM 做分母即可，如示例 3。',
    },
  ],
  calc: {
    enabled: true,
    ranges: { array1: 'B2:B5', array2: 'C2:C5' },
    fields: [
      { key: 'array1', label: '数组1', type: 'ref', rangeKey: 'array1', default: 'B2:B5', placeholder: '如 B2:B5', hint: '第一组区域，如单价列。' },
      { key: 'array2', label: '数组2', type: 'ref', rangeKey: 'array2', default: 'C2:C5', placeholder: '如 C2:C5', hint: '第二组区域，如数量列。' },
    ],
    template: '=SUMPRODUCT({array1},{array2})',
    cases: [
      { label: '✅ 正确：单价×数量 合计', type: 'ok', values: { array1: 'B2:B5', array2: 'C2:C5' }, expect: '310', note: '10×5+20×3+15×8+8×10 = 310。' },
      { label: '❌ 两组数组行数不一致', type: 'error', values: { array1: 'B2:B5', array2: 'C2:C4' }, expect: '#VALUE!', note: '数组1 四行、数组2 三行，对应不上。' },
      { label: '❌ 区域列超出表范围', type: 'error', values: { array1: 'X2:X5', array2: 'C2:C5' }, expect: '#REF!', note: 'X 列在样表里不存在，引用无效。' },
      { label: '❌ 区域里混进文本', type: 'error', values: { array1: 'A2:A5', array2: 'C2:C5' }, expect: '#VALUE!', note: '数组1 是商品名（文本），SUMPRODUCT 直接报错。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/** ROUND · 四舍五入 */
const roundEntry: FunctionEntry = {
  id: 'round',
  enName: 'ROUND',
  zhName: '四舍五入',
  zhCommon: ['四舍五入', '保留小数', '取整到指定位数'],
  alias: ['保留位数', '舍入', '精确到小数'],
  category: 'math',
  abbr: 'sswr',
  pinyin: 'sishewuru',
  keywords: ['四舍五入', '保留小数位', '保留两位', '精确到分', '取整到十位百位', '四舍五入取整'],
  difficulty: 1,
  usageLevel: 70,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '保留指定小数位，四舍五入',
  summary:
    '把数字修整到你要的小数位。第二位参数控制「保留几位」：正数留小数、0 取整到个位、负数直接舍到十位/百位/千位。Excel 的 ROUND 是标准四舍五入——遇到 .5 向远离 0 的方向进一位（2.5→3，-2.5→-3），并不是银行家那种「五成双」。',
  syntax: {
    patternCn: '=ROUND(数字, 位数)',
    patternEn: '=ROUND(number, num_digits)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要舍入的那个原始数字。',
        accepts: '具体数字、单元格引用，如 A2、3.14159。',
        ifOmitted: '这是必填参数。',
        tip: 'ROUND 改的是「值」，不是「显示」——单元格里存的已经是舍入后的数。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'num_digits',
        zh: '位数',
        en: 'num_digits',
        required: true,
        desc: '保留到第几位：正数=小数位，0=到个位，负数=到十位/百位/千位。',
        accepts: '2 保留两位 · 1 保留一位 · 0 取整 · -1 到十位 · -2 到百位 · -3 到千位。',
        ifOmitted: '必填，省略会报 #VALUE!（参数不足）。',
        tip: '想「精确到分」写 2；想「四舍五入到百位」写 -2，而不是 2。',
        example: '2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue:
    '返回按指定位数四舍五入后的数字；第二参数为负时舍入到小数点左侧的十位/百位等。',
  examples: [
    {
      title: '示例 1：保留两位小数（精确到分）',
      scene: '金额算出来一长串，要显示成两位小数的「元」。',
      dataTsv: '原始\t说明\n3.14159\t圆周率\n2.005\t待修整\n9.999\t待修整',
      dataAnchor: 'A1',
      formula: '=ROUND(A2,2)',
      result: '3.14（A2）· 2.01（A3，.005 进位）· 10.00（A4）',
      explanation: '第二参数 2 表示保留小数点后两位，第三位起按四舍五入处理。',
    },
    {
      title: '示例 2：取整到个位',
      scene: '人数、件数这类只能是整数。',
      dataTsv: '原始\n2.4\n2.5\n-2.5',
      dataAnchor: 'A1',
      formula: '=ROUND(A2,0)',
      result: '2（2.4）· 3（2.5，.5 进位）· -3（-2.5 向更负方向进位）',
      explanation: '第二参数 0 表示舍入到个位。注意 2.5→3、-2.5→-3，都是向远离 0 的方向进。',
    },
    {
      title: '示例 3：舍入到百位（负数位数）',
      scene: '大金额报表想以「百元」为单位取整。',
      dataTsv: '原始\n1234.56\n9876.54',
      dataAnchor: 'A1',
      formula: '=ROUND(A2,-2)',
      result: '1200（1234.56）· 9900（9876.54）',
      explanation: '第二参数为负时舍到小数点左侧：-2 表示百位（10 的 2 次方），-1 是十位，-3 是千位。1234.56 离最近的百位 1200 更近，所以得 1200。',
    },
  ],
  pitfalls: [
    {
      title: '以为位数只能是正数，不知道负数能舍到十位/百位',
      reason: '很多人只知道 ROUND(数,2) 留两位，遇到「四舍五入到百位」就懵了。其实第二参数写负数就行：-1 十位、-2 百位、-3 千位。',
      fix: '舍到百位写 =ROUND(A2,-2)，舍到十位写 =ROUND(A2,-1)。',
      level: 'mid',
    },
    {
      title: '误以为 ROUND 是「四舍六入五成双」(银行家舍入)',
      reason: '有些编程语言/函数的 .5 是取偶（五成双）。但 Excel 的 ROUND 是标准四舍五入：遇到 .5 一律向远离 0 的方向进一位，2.5→3、-2.5→-3。',
      fix: '要银行家舍入得用 EVEN/ODD 等特殊函数；普通 ROUND 就是「该进就进」。',
      level: 'mid',
    },
    {
      title: '想「保留两位小数显示」却用 ROUND 改了真实值',
      reason: 'ROUND 会真的把单元格里的值变成舍入后的数，后续再拿它做乘除就丢了精度。只想「看着是两位」不该动原值。',
      fix: '只想改显示：右键「设置单元格格式」→ 数值 → 2 位小数，或用 =TEXT(A2,"0.00")。要参与计算才用 ROUND。',
      level: 'mid',
    },
    {
      title: '第二参数省略，报 #VALUE!',
      reason: 'ROUND 的两个参数都是必填。只写一个（如 =ROUND(A2)）会被判为参数不足。',
      fix: '一定写上位数：=ROUND(A2,2)；取整到个位写 =ROUND(A2,0)。',
      level: 'high',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'roundup',
      kind: 'confusable',
      why: 'ROUNDUP 是有小数就进、ROUND 是四舍五入，按「要不要进位」选。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: 'ROUNDDOWN 是直接砍小数不进位，和 ROUND 的四舍五入相反。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: 'INT 只取整且向负无穷，-2.1 得 -3，负数时和 ROUND(数,0) 结果不同。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'text', default: 'A2', placeholder: '如 A2、3.14159', hint: '要四舍五入的数字或单元格引用。' },
      { key: 'digits', label: '位数', type: 'number', default: '2', placeholder: '2', hint: '正=小数位、0=个位、负=十位/百位。' },
    ],
    template: '=ROUND({number},{digits})',
    cases: [
      { label: '✅ 正确：保留两位小数', type: 'ok', values: { number: 'A2', digits: '2' }, expect: '3.14', note: 'A2=3.14159 保留两位得 3.14。' },
      { label: '❌ 位数非数字', type: 'error', values: { number: 'A2', digits: 'x' }, expect: '#VALUE!', note: '位数必须是一个整数。' },
      { label: '❌ 数字所在单元格是文本', type: 'error', values: { number: 'B2', digits: '2' }, expect: '#VALUE!', note: 'B2 是说明（文本），不是有效数字。' },
      { label: '❌ 数字字面量非数字', type: 'error', values: { number: 'hello', digits: '2' }, expect: '#VALUE!', note: 'hello 不是数字。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/** ROUNDUP · 向上舍入 */
const roundupEntry: FunctionEntry = {
  id: 'roundup',
  enName: 'ROUNDUP',
  zhName: '向上舍入',
  zhCommon: ['向上舍入', '进一法', '有小数就进位'],
  alias: ['向上取整', '进一', '天花板函数'],
  category: 'math',
  abbr: 'xssr',
  pinyin: 'xiangshangsheru',
  keywords: ['向上舍入', '进一法', '向上取整', '有小数进位', '舍入到上', '进位取整'],
  difficulty: 2,
  usageLevel: 48,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '有小数就往上进一位',
  summary:
    '不管小数是 0.1 还是 0.9，「只要不是整数就向大进位」。做材料核算、包裹个数（3.1 个也要按 4 个算）时用它最稳。注意「向上」是朝数轴正方向：正数的 2.1→3，负数的 -2.1→-3（更负）。',
  syntax: {
    patternCn: '=ROUNDUP(数字, 位数)',
    patternEn: '=ROUNDUP(number, num_digits)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要向上舍入的原始数字。',
        accepts: '具体数字或单元格，如 A2、2.1。',
        ifOmitted: '必填参数。',
        tip: '负数的「向上」是朝更负的方向（-2.1 → -3）。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'num_digits',
        zh: '位数',
        en: 'num_digits',
        required: true,
        desc: '舍入到的位数，规则与 ROUND 一致：正=小数位、0=个位、负=十位/百位。',
        accepts: '2 保留两位 · 0 取整 · -1 到十位。',
        ifOmitted: '必填，省略报 #VALUE!。',
        tip: '到整数写 0；到十位写 -1。',
        example: '0',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回向绝对值更大方向（远离 0）舍入后的数字；正数变大、负数变得更负。',
  examples: [
    {
      title: '示例 1：有小数就进一位（取整）',
      scene: '买材料，3.1 米也得按 4 米下单。',
      dataTsv: '原始\n2.1\n2.9\n-2.1',
      dataAnchor: 'A1',
      formula: '=ROUNDUP(A2,0)',
      result: '3（2.1）· 3（2.9）· -3（-2.1，向上=更负）',
      explanation: '不管小数多大，非整数就进一。负数向上是朝数轴正方向的反面，即更负。',
    },
    {
      title: '示例 2：保留两位、第三位有就进',
      scene: '金额要「宁多勿少」地上取整到分。',
      dataTsv: '原始\n3.14159\n3.14999',
      dataAnchor: 'A1',
      formula: '=ROUNDUP(A2,2)',
      result: '3.15（3.14159，第三位 1 也进）· 3.15（3.14999）',
      explanation: '第二参数 2 保留两位，只要第三位及以后非零就向上进，所以 3.14159 也进成 3.15。',
    },
    {
      title: '示例 3：向上舍到十位',
      scene: '预算按「十元」为单位向上估。',
      dataTsv: '原始\n1234.56\n9876.54',
      dataAnchor: 'A1',
      formula: '=ROUNDUP(A2,-1)',
      result: '1240（1234.56 向上到十位）· 9880（9876.54）',
      explanation: '第二参数 -1 表示舍到十位，向上取整即 1234.56 → 1240。',
    },
  ],
  pitfalls: [
    {
      title: '把负数的「向上」理解反了',
      reason: 'ROUNDUP(-2.1) 的结果是 -3，不是 -2。因为「向上」是朝数轴正方向，负数离 0 越远（越负）才叫「向上进位」。',
      fix: '记口诀：ROUNDUP 永远让绝对值变大。-2.1 的绝对值从 2.1 变 3。',
      level: 'high',
    },
    {
      title: '和 ROUND 混淆，以为会四舍五入',
      reason: 'ROUNDUP 不论小数多少一律进位，2.1 也会进成 3，没有「四舍」这回事。',
      fix: '要四舍五入用 ROUND；要「有小数就进」才用 ROUNDUP。',
      level: 'mid',
    },
    {
      title: '第二参数省略，报 #VALUE!',
      reason: '两个参数都必填，只写一个会被判参数不足。',
      fix: '写全：=ROUNDUP(A2,0)（取整）或 =ROUNDUP(A2,2)（留两位）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'round',
      kind: 'confusable',
      why: 'ROUND 是四舍五入、ROUNDUP 是有小数就进，按「要不要进位」选。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: '相反方向：ROUNDDOWN 是「直接砍小数不进位」，ROUNDUP 是「一律进位」。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: 'INT 向负无穷取整，负数时可能与 ROUNDUP 结果相同（都更负），但和 ROUNDDOWN 永远相反。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'text', default: 'A2', placeholder: '如 A2、2.1', hint: '要向上舍入的数字或单元格引用。' },
      { key: 'digits', label: '位数', type: 'number', default: '2', placeholder: '2', hint: '正=小数位、0=个位、负=十位/百位。' },
    ],
    template: '=ROUNDUP({number},{digits})',
    cases: [
      { label: '✅ 正确：向上取整到个位', type: 'ok', values: { number: 'A2', digits: '0' }, expect: '3', note: 'A2=2.1 向上取整得 3。' },
      { label: '❌ 位数非数字', type: 'error', values: { number: 'A2', digits: 'x' }, expect: '#VALUE!', note: '位数必须是一个整数。' },
      { label: '❌ 数字所在单元格超出范围', type: 'error', values: { number: 'B2', digits: '0' }, expect: '#VALUE!', note: '本样表只有 A 列，B2 不存在（非数字）。' },
      { label: '❌ 数字字面量非数字', type: 'error', values: { number: 'hello', digits: '0' }, expect: '#VALUE!', note: 'hello 不是数字。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/** ROUNDDOWN · 向下舍入 */
const rounddownEntry: FunctionEntry = {
  id: 'rounddown',
  enName: 'ROUNDDOWN',
  zhName: '向下舍入',
  zhCommon: ['向下舍入', '去尾法', '直接砍小数'],
  alias: ['向下取整', '去尾', '截断小数'],
  category: 'math',
  abbr: 'xxsr',
  pinyin: 'xiangxiasheru',
  keywords: ['向下舍入', '去尾法', '直接砍小数', '向下取整', '截位', '不进位'],
  difficulty: 2,
  usageLevel: 44,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '直接砍掉多余小数，不进位',
  summary:
    '和 ROUNDUP 相反：不管小数是多少，一律朝 0 的方向截断（去尾法）。3.99→3，-2.9→-2。它等价于 TRUNC，区别只在负数方向——INT 是向负无穷，ROUNDDOWN 是向 0，所以负数时两者结果不同。',
  syntax: {
    patternCn: '=ROUNDDOWN(数字, 位数)',
    patternEn: '=ROUNDDOWN(number, num_digits)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要向下舍入的原始数字。',
        accepts: '具体数字或单元格，如 A2、3.99。',
        ifOmitted: '必填参数。',
        tip: '负数时朝 0 方向（绝对值变小）：-2.9 → -2。',
        example: 'A2',
        pitfallRank: 2,
      },
      {
        key: 'num_digits',
        zh: '位数',
        en: 'num_digits',
        required: true,
        desc: '截断到的位数，规则同 ROUND：正=小数位、0=个位、负=十位/百位。',
        accepts: '2 留两位 · 0 取整 · -1 到十位。',
        ifOmitted: '必填，省略报 #VALUE!。',
        tip: '到整数写 0；「砍到十位」写 -1。',
        example: '0',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回朝 0 方向截断（去尾）后的数字；正数变小、负数变大（绝对值都减小）。',
  examples: [
    {
      title: '示例 1：直接砍掉小数取整',
      scene: '只要整数部分，不要任何进位（如按「已完成整件」统计）。',
      dataTsv: '原始\n3.99\n-2.9\n5.01',
      dataAnchor: 'A1',
      formula: '=ROUNDDOWN(A2,0)',
      result: '3（3.99）· -2（-2.9）· 5（5.01）',
      explanation: '无论小数多大都不进位，朝 0 方向截断：-2.9 的 0 方向是 -2。',
    },
    {
      title: '示例 2：保留两位、后面直接砍',
      scene: '金额要「宁少勿多」地截到分。',
      dataTsv: '原始\n3.14999\n3.14159',
      dataAnchor: 'A1',
      formula: '=ROUNDDOWN(A2,2)',
      result: '3.14（3.14999，第三位直接砍）· 3.14（3.14159）',
      explanation: '第二参数 2 保留两位，第三位及以后一律舍去，不四舍五入。',
    },
    {
      title: '示例 3：向下舍到十位',
      scene: '预算按「十元」为单位向下估。',
      dataTsv: '原始\n1234.56\n9876.54',
      dataAnchor: 'A1',
      formula: '=ROUNDDOWN(A2,-1)',
      result: '1230（1234.56 向下到十位）· 9870（9876.54）',
      explanation: '第二参数 -1 舍到十位，向下（朝 0）截断即 1234.56 → 1230。',
    },
  ],
  pitfalls: [
    {
      title: '和 INT 混淆：负数时结果不同',
      reason: 'INT(-2.9) 是 -3（向负无穷），而 ROUNDDOWN(-2.9,0) 是 -2（向 0）。很多人拿 INT 当「去尾」用，负数就翻车。',
      fix: '要「朝 0 去尾」用 ROUNDDOWN；要「向下取整到负无穷」才用 INT。',
      level: 'high',
    },
    {
      title: '和 ROUNDUP 混淆，以为会进位',
      reason: 'ROUNDDOWN 永远不进位，3.99 也是 3，没有「向上」这回事。',
      fix: '要进位用 ROUNDUP；要直接砍小数用 ROUNDDOWN。',
      level: 'mid',
    },
    {
      title: '第二参数省略，报 #VALUE!',
      reason: '两个参数都必填，只写一个会被判参数不足。',
      fix: '写全：=ROUNDDOWN(A2,0)（取整）或 =ROUNDDOWN(A2,2)（留两位）。',
      level: 'high',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'round',
      kind: 'confusable',
      why: 'ROUND 会四舍五入，ROUNDDOWN 只砍不进，按「是否允许进位」选。',
    },
    {
      id: 'roundup',
      kind: 'confusable',
      why: '相反方向：ROUNDUP 一律进位，ROUNDDOWN 一律去尾。',
    },
    {
      id: 'int',
      kind: 'confusable',
      why: 'INT 向负无穷取整，负数时与 ROUNDDOWN（向 0）结果不同，正数时两者一样。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'text', default: 'A2', placeholder: '如 A2、3.99', hint: '要向下舍入的数字或单元格引用。' },
      { key: 'digits', label: '位数', type: 'number', default: '2', placeholder: '2', hint: '正=小数位、0=个位、负=十位/百位。' },
    ],
    template: '=ROUNDDOWN({number},{digits})',
    cases: [
      { label: '✅ 正确：向下取整到个位', type: 'ok', values: { number: 'A2', digits: '0' }, expect: '3', note: 'A2=3.99 砍掉小数得 3。' },
      { label: '❌ 位数非数字', type: 'error', values: { number: 'A2', digits: 'x' }, expect: '#VALUE!', note: '位数必须是一个整数。' },
      { label: '❌ 数字所在单元格超出范围', type: 'error', values: { number: 'B2', digits: '0' }, expect: '#VALUE!', note: '本样表只有 A 列，B2 不存在（非数字）。' },
      { label: '❌ 数字字面量非数字', type: 'error', values: { number: 'hello', digits: '0' }, expect: '#VALUE!', note: 'hello 不是数字。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/** INT · 向下取整 */
const intEntry: FunctionEntry = {
  id: 'int',
  enName: 'INT',
  zhName: '向下取整',
  zhCommon: ['向下取整', '取整', '取整数'],
  alias: ['向下舍入到整数', '取不大于的最大整数', '整数化'],
  category: 'math',
  abbr: 'xxqz',
  pinyin: 'xiangxiaquzheng',
  keywords: ['向下取整', '取整', '取整数', '向下舍入', '负数取整', '截尾取整'],
  difficulty: 1,
  usageLevel: 42,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
  },
  oneLiner: '取不大于它的最大整数',
  summary:
    '把数字「向下」取到最近的整数，也就是取「不大于它的最大整数」。正数时就是砍掉小数（3.9→3），但负数要小心：-2.1 向下是 -3，不是 -2。它是唯一一个参数只有一个的取整函数，最常用于「算整天数」「取整数部分」。',
  syntax: {
    patternCn: '=INT(数字)',
    patternEn: '=INT(number)',
    args: [
      {
        key: 'number',
        zh: '数字',
        en: 'number',
        required: true,
        desc: '要取整的那个数字。',
        accepts: '具体数字或单元格，如 A2、2.9、-2.1。',
        ifOmitted: '必填参数，只有一个。',
        tip: 'INT 不自动转换文本，INT("3.9") 会报 #VALUE!；要先用 VALUE()。',
        example: 'A2',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回不大于原数的最大整数；正数砍小数，负数向更负方向取整（如 -2.1 → -3）。',
  examples: [
    {
      title: '示例 1：正数直接取整',
      scene: '只要整数部分，小数扔掉。',
      dataTsv: '原始\n2.9\n5.01\n100.99',
      dataAnchor: 'A1',
      formula: '=INT(A2)',
      result: '2（2.9）· 5（5.01）· 100（100.99）',
      explanation: '正数时 INT 就是砍掉小数部分，和 ROUNDDOWN(数,0) 结果一致。',
    },
    {
      title: '示例 2：负数取整（最容易错）',
      scene: '温度、差额出现负数时，INT 的方向和直觉相反。',
      dataTsv: '原始\n-2.1\n-2.9\n-0.1',
      dataAnchor: 'A1',
      formula: '=INT(A2)',
      result: '-3（-2.1）· -3（-2.9）· -1（-0.1）',
      explanation: 'INT 取「不大于它的最大整数」：-2.1 的不大于它的最大整数是 -3，所以结果是 -3 不是 -2。',
    },
    {
      title: '示例 3：算两个日期之间的整天数',
      scene: '用结束日期减开始日期得到带小数天的数，INT 取整天数。',
      dataTsv: '开始\t结束\t差\n2024/1/1\t2024/1/10\t9.5',
      dataAnchor: 'A1',
      formula: '=INT(C2)',
      result: '9（完整的整天数，0.5 天舍去）',
      explanation: '日期相减得到天数（可能是小数），INT 取完整的整天数，常用于「已满 X 天」统计。',
    },
  ],
  pitfalls: [
    {
      title: '负数取整方向搞反：INT(-2.1) 是 -3 不是 -2',
      reason: 'INT 是「向下取整到负无穷」，取不大于原数的最大整数。-2.1 向下一步就是 -3，所以结果是 -3，很多人直觉写成 -2。',
      fix: '负数想「朝 0 去尾」用 ROUNDDOWN(-2.1,0) 得 -2；要向下取整才用 INT 得 -3。',
      level: 'high',
    },
    {
      title: '把 INT 当四舍五入用',
      reason: 'INT 只砍小数不进位，2.9 也是 2。想四舍五入却用 INT，会系统性偏小。',
      fix: '要四舍五入用 ROUND；只取整数部分才用 INT。',
      level: 'mid',
    },
    {
      title: '文本型数字传入报 #VALUE!',
      reason: 'INT 不像 SUM 那样宽容，INT("3.9") 会直接报 #VALUE!——它不自动把文本转成数字。',
      fix: '先用 VALUE() 或分列转成数字：=INT(VALUE(A2))。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
  ],
  related: [
    {
      id: 'round',
      kind: 'confusable',
      why: 'ROUND 会四舍五入，INT 只向下取整，按「要不要进位」选。',
    },
    {
      id: 'rounddown',
      kind: 'confusable',
      why: '正数时两者一样；负数时 INT 向负无穷、ROUNDDOWN 向 0，结果不同。',
    },
    {
      id: 'roundup',
      kind: 'confusable',
      why: 'ROUNDUP 一律进位（含负数更负），和 INT 的向下取整方向相反。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '数字', type: 'text', default: 'A2', placeholder: '如 A2、2.9', hint: '要取整的数字或单元格引用。' },
    ],
    template: '=INT({number})',
    cases: [
      { label: '✅ 正确：正数向下取整', type: 'ok', values: { number: 'A2' }, expect: '2', note: 'A2=2.9 取整得 2。' },
      { label: '❌ 数字所在单元格超出范围', type: 'error', values: { number: 'B2' }, expect: '#VALUE!', note: '本样表只有 A 列，B2 不存在（非数字）。' },
      { label: '❌ 数字字面量非数字', type: 'error', values: { number: 'hello' }, expect: '#VALUE!', note: 'hello 不是数字。' },
      { label: '❌ 数字字面量非法', type: 'error', values: { number: '15.7.3' }, expect: '#VALUE!', note: '15.7.3 不是合法数字。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

const pack: Record<string, FunctionEntry> = {
  sum: sumEntry,
  sumif: sumifEntry,
  sumifs: sumifsEntry,
  sumproduct: sumproductEntry,
  round: roundEntry,
  roundup: roundupEntry,
  rounddown: rounddownEntry,
  int: intEntry,
  abs: absEntry,
  sign: signEntry,
  gcd: gcdEntry,
  lcm: lcmEntry,
  mod: modEntry,
  quotient: quotientEntry,
  power: powerEntry,
  product: productEntry,
  sqrt: sqrtEntry,
  sumsq: sumsqEntry,
  seriesum: seriesumEntry,
  fact: factEntry,
  factdouble: factdoubleEntry,
  multinomial: multinomialEntry,
  combin: combinEntry,
  combina: combinaEntry,
  permut: permutEntry,
  roman: romanEntry,
  base: baseEntry,
  decimal: decimalEntry,
  arabic: arabicEntry,
  rand: randEntry,
  randbetween: randbetweenEntry,
  'ceiling-math': ceilingMathEntry,
  'floor-math': floorMathEntry,
  mround: mroundEntry,
  even: evenEntry,
  odd: oddEntry,
  trunc: truncEntry,
  pi: piEntry,
  sin: sinEntry,
  cos: cosEntry,
  tan: tanEntry,
  asin: asinEntry,
  acos: acosEntry,
  atan: atanEntry,
  atan2: atan2Entry,
  sinh: sinhEntry,
  cosh: coshEntry,
  tanh: tanhEntry,
  asinh: asinhEntry,
  acosh: acoshEntry,
  atanh: atanhEntry,
  degrees: degreesEntry,
  radians: radiansEntry,
  sqrtpi: sqrtpiEntry,
  sumx2my2: sumx2my2Entry,
  sumx2py2: sumx2py2Entry,
  sumxmy2: sumxmy2Entry,
  mdeterm: mdetermEntry,
  minverse: minverseEntry,
  mmult: mmultEntry,
};

export default pack;