import type { FunctionEntry } from '@/types';
import daverageEntry from '@/data/samples/daverage';
import dcountEntry from '@/data/samples/dcount';
import dcountaEntry from '@/data/samples/dcounta';
import dgetEntry from '@/data/samples/dget';
import dmaxEntry from '@/data/samples/dmax';
import dminEntry from '@/data/samples/dmin';
import dproductEntry from '@/data/samples/dproduct';
import dstdevEntry from '@/data/samples/dstdev';
import dstdevpEntry from '@/data/samples/dstdevp';
import dvarEntry from '@/data/samples/dvar';
import dvarpEntry from '@/data/samples/dvarp';

/**
 * 数据库类 1 条（第一版占位，本版补全为完整条目）
 * 写作口径：PRD §10.4 / §10.5.2，仿 samples/if.ts 深度、结构与语气。
 *
 * 关键坑：① 条件表的表头必须与数据库表头「一字不差」地一致；
 * ② 同一行条件 = 逻辑「与」(AND)，不同行 = 逻辑「或」(OR)；
 * ③ field 用列名时必须是数据库里的确切列名文本，否则 #VALUE!。
 */

/* ============================== DSUM 数据库求和 ============================== */

/** 销售明细表（数据库区域 A1:C5，含表头） */
const DSUM_DB_TSV =
  '姓名\t区域\t金额\t片区\n张三\t华东\t1000\n李四\t华北\t2000\n王五\t华东\t1500\n赵六\t华北\t800\n区域\t金额\t片区\t区域X\n华东\t>1200\t华北\t华东\n华北\t\t';

const dsum: FunctionEntry = {
  id: 'dsum',
  enName: 'DSUM',
  zhName: '数据库求和',
  zhCommon: ['条件求和', '数据库汇总', '按条件加总'],
  alias: ['条件表求和', '数据库加总', '区域条件汇总'],
  category: 'database',
  abbr: 'sjkqh',
  pinyin: 'shujukuqiuhe',
  keywords: ['条件求和', '数据库求和', '多条件汇总', '按区域筛选求和', 'D函数', '分类加总', '条件表'],
  difficulty: 4,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '条件表是 DSUM 的精髓：表头要和数据库表头一字不差；同一行=AND，不同行=OR。',
  },
  oneLiner: '用一张条件表来描述筛选条件并求和',
  summary:
    'SUMIFS 写条件要一个一个参数塞进去，条件一多就很长；DSUM 换个思路——你另外画一张「条件表」（和数据库同表头，下面写筛选条件），DSUM 按这张表去数据库里筛出匹配的行再求和。条件表同一行里的条件是「并且」(AND)，分行写就是「或者」(OR)，多条件组合比 SUMIFS 更直观也更灵活。',
  syntax: {
    patternCn: '=DSUM(数据库区域, 求和列, 条件区域)',
    patternEn: '=DSUM(database, field, criteria)',
    args: [
      {
        key: 'database',
        zh: '数据库区域',
        en: 'database',
        required: true,
        desc: '包含表头的数据区域（首行是列名）。',
        accepts: '如 A1:C5（含表头行）。',
        tip: '首行必须是列标题，且和条件表的表头对应。',
        example: 'A1:C5',
        pitfallRank: 2,
      },
      {
        key: 'field',
        zh: '求和列',
        en: 'field',
        required: true,
        desc: '要对哪一列求和，可用列名文本、列序号或该列任意单元格。',
        accepts: '"金额"（列名文本）· 3（第 3 列）· C1（引用该列表头）。',
        tip: '【最常填错】用列名文本时必须和数据库表头一字不差，否则 #VALUE!。',
        example: '"金额"',
        pitfallRank: 1,
      },
      {
        key: 'criteria',
        zh: '条件区域',
        en: 'criteria',
        required: true,
        desc: '条件表区域（首行是表头，下面是筛选条件）。',
        accepts: '如 A6:A7（表头「区域」+ 条件「华东」）。',
        tip: '条件表表头必须复制数据库的表头；同一行=AND，分行=OR。空条件区域会汇总全部。',
        example: 'A6:A7',
        pitfallRank: 3,
      },
    ],
  },
  returnValue: '返回满足条件的数据行中、指定列的数值之和。',
  examples: [
    {
      title: '示例 1：求「华东」区域的总金额',
      scene: '有一张销售明细，想汇总华东区所有人的金额合计。',
      dataTsv: DSUM_DB_TSV,
      dataAnchor: 'A1',
      formula: '=DSUM(A1:C5, "金额", A6:A7)',
      result: '2500（张三 1000 + 王五 1500，两者都是华东）',
      explanation:
        '数据库是 A1:C5（含表头）。条件表 A6:A7：F1 写「区域」（与数据库表头一致），F2 写「华东」。DSUM 筛出华东两行并对「金额」列求和。',
    },
    {
      title: '示例 2：多条件「华东 且 金额>1200」(同一行 = AND)',
      scene: '不仅要华东，还要金额大于 1200 的才计入。',
      dataTsv: DSUM_DB_TSV,
      dataAnchor: 'A1',
      formula: '=DSUM(A1:C5, "金额", A6:B7)',
      result: '1500（只有王五：华东 且 金额>1200）',
      explanation:
        '条件表 A6:B7：表头「区域」「金额」在同一行，F2=华东、G2=>1200。同一行的两个条件按「并且」处理，只命中王五。',
    },
    {
      title: '示例 3：华东「或」华北都算（分行 = OR）',
      scene: '想把华东和华北分别作为两个独立条件都纳入求和。',
      dataTsv: DSUM_DB_TSV,
      dataAnchor: 'A1',
      formula: '=DSUM(A1:C5, "金额", A6:A8)',
      result: '5300（全部四人：华东+华北，即整张表合计）',
      explanation:
        '条件表 A6:A8：F1=区域，F2=华东、F3=华北 写在两行。不同行表示「或者」，于是华东行和华北行都满足，等于汇总全部。',
    },
  ],
  pitfalls: [
    {
      title: '条件表的表头和数据库表头对不上 → 筛不出或算错',
      reason: 'DSUM 靠表头文字去匹配列。条件表写「片区」而数据库叫「区域」，Excel 找不到对应列，结果往往返回 0 或不报错但漏算。',
      fix: '条件表的表头直接从数据库区域复制粘贴，保证一字不差（含空格、标点）。',
      level: 'high',
    },
    {
      title: '同一行和分行的含义搞反：AND / OR 用错',
      reason: '同一行里的多个条件是「并且」(AND)，写在两行才是「或者」(OR)。有人想表达「或」却写在同一行，导致条件被当成「且」而漏数据。',
      fix: '要「同时满足」就放同一行；要「满足任一」就分行写。',
      level: 'high',
    },
    {
      title: 'field 用列名时写错字 → #VALUE!',
      reason: 'field 填 "金额" 必须和数据库表头完全一致；写成 "金額"（繁体）或 "金额 "（多空格）Excel 就认不出列。',
      fix: '直接引用该列的表头单元格（如 C1），或用与表头完全相同的文本。',
      level: 'mid',
      errorCode: '#VALUE!',
    },
    {
      title: '条件区域和数据库区域重叠或包含脏数据',
      reason: '条件表若和数据库区域重叠，Excel 可能把数据行误当条件；条件格里混进无关文字也会干扰匹配。',
      fix: '条件表单独放在空白区域（如 F 列起），只放表头 + 条件，别和数据库交叉。',
      level: 'mid',
    },
    {
      title: '条件格留空，本意「不设限」却把全部都算进去',
      reason: '条件表里某列留空，Excel 视为「该列任意值都满足」，结果会汇总整列而非你以为的筛选。',
      fix: '想筛选就写明确条件；想清空某个条件就删掉那一行/那格，别留半截空条件。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'sumifs',
      kind: 'alternative',
      why: '条件固定且不多时，SUMIFS 一行写完更直白，不用另拉条件表。',
    },
    {
      id: 'sumif',
      kind: 'alternative',
      why: '只有单条件求和，用 SUMIF 最简洁；DSUM 胜在多条件灵活组合。',
    },
    {
      id: 'sum',
      kind: 'companion',
      why: '没有任何筛选、整列直接加总，用 SUM 即可，不必上 DSUM。',
    },
    {
      id: 'round',
      kind: 'companion',
      why: 'DSUM 结果带小数时，用 ROUND 收成你要的位数。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'database', label: '数据库区域', type: 'ref', default: 'A1:C5', hint: '含表头的数据区域' },
      { key: 'field', label: '求和列', type: 'text', default: '"金额"', hint: '列名文本（与表头一致）或列序号（如 3）' },
      { key: 'criteria', label: '条件区域', type: 'ref', default: 'A6:A7', hint: '首行条件列名、第二行起条件值' },
    ],
    template: '=DSUM({database},{field},{criteria})',
    cases: [
      {
        label: '华东区域求和（单条件列 A6:A7）',
        type: 'ok',
        values: { database: 'A1:C5', field: '"金额"', criteria: 'A6:A7' },
        expect: '2500',
        note: '华东两行：张三 1000 + 王五 1500 = 2500。',
      },
      {
        label: '华东 且 金额>1200（A6:B7，同行 AND）',
        type: 'ok',
        values: { database: 'A1:C5', field: '"金额"', criteria: 'A6:B7' },
        expect: '1500',
        note: '仅王五（华东 且 1500>1200）命中。',
      },
      {
        label: '华东或华北（A6:A8，分行 OR），列序号 3',
        type: 'ok',
        values: { database: 'A1:C5', field: '3', criteria: 'A6:A8' },
        expect: '5300',
        note: '全部四行合计 1000+2000+1500+800 = 5300；field 用列序号 3 也行。',
      },
      {
        label: 'field 不存在 → #VALUE!',
        type: 'error',
        values: { database: 'A1:C5', field: '"不存在"', criteria: 'A6:A7' },
        expect: '#VALUE!',
        note: '求和列名必须和数据库表头一致。',
      },
      {
        label: '条件列名不匹配 → #VALUE!',
        type: 'error',
        values: { database: 'A1:C5', field: '"金额"', criteria: 'D6:D7' },
        expect: '#VALUE!',
        note: 'D 列条件表头「片区」不在数据库表头里。',
      },
      {
        label: '条件区域非法 → #REF!',
        type: 'error',
        values: { database: 'A1:C5', field: '"金额"', criteria: 'ZZZ' },
        expect: '#REF!',
        note: '区域写法不是 Excel 认识的引用。',
      },
      {
        label: '数据库区域非法 → #REF!',
        type: 'error',
        values: { database: 'XYZ', field: '"金额"', criteria: 'A6:A7' },
        expect: '#REF!',
        note: '区域写法不是 Excel 认识的引用。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

const pack: Record<string, FunctionEntry> = {
  daverage: daverageEntry,
  dcount: dcountEntry,
  dcounta: dcountaEntry,
  dget: dgetEntry,
  dmax: dmaxEntry,
  dmin: dminEntry,
  dproduct: dproductEntry,
  dstdev: dstdevEntry,
  dstdevp: dstdevpEntry,
  dvar: dvarEntry,
  dvarp: dvarpEntry,
  dsum,
};

export default pack;
