import type { FunctionEntry } from '@/types';

/** 转成一列 · 把一片区域拉平成一列，还能顺手忽略空白和错误（lambda 类 B17 批次，Microsoft 365） */

const tocolEntry: FunctionEntry = {
  id: 'tocol',
  enName: 'TOCOL',
  zhName: '转成一列',
  zhCommon: ['TOCOL', '转一列', '二维转一维'],
  alias: ['拉平成一列', '区域转列', '降维'],
  category: 'lambda',
  abbr: 'zcyl',
  pinyin: 'zhuanchengyilie',
  keywords: ['TOCOL', '转成一列', '降维', '忽略空白', '动态数组'],
  difficulty: 2,
  usageLevel: 32,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把一片区域拉平成一列，还能顺手忽略空白和错误',
  summary: 'TOCOL(数组, [忽略项], [按列扫描]) 把二维区域压成一列。第二参数很实用：0=全部保留（默认）、1=忽略空白、2=忽略错误、3=空白和错误都忽略——这让它顺带成了「清洗数据」的利器。第三参数决定读取顺序：FALSE/省略=按行扫描（从左到右、逐行），TRUE=按列扫描（从上到下、逐列）。',
  syntax: {
    patternCn: '=TOCOL(数组, [忽略项], [按列扫描])',
    patternEn: '=TOCOL(array, [ignore], [scan_by_column])',
    args: [
      {
      key: 'array',
      zh: '数组',
      en: 'array',
      required: true,
      desc: '要转换的区域。',
      example: 'A2:C5'
    },
      {
      key: 'ignore',
      zh: '忽略项',
      en: 'ignore',
      required: false,
      desc: '0=全部保留（默认）；1=忽略空白；2=忽略错误；3=空白和错误都忽略。',
      example: '3',
      tip: '想要「干净的一列」通常填 3。'
    },
      {
      key: 'scan_by_column',
      zh: '按列扫描',
      en: 'scan_by_column',
      required: false,
      desc: 'FALSE（默认）=按行扫描；TRUE=按列扫描。',
      example: 'TRUE'
    }
    ]
  },
  returnValue: '返回单列数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：区域拉平成一列',
    scene: '把 2 行 3 列的数据拉成一列。',
    dataTsv: 'A\tB\tC\n1\t2\t3\n4\t5\t6',
    dataAnchor: 'A1',
    formula: '=TOCOL(A2:C3)',
    result: '{1; 2; 3; 4; 5; 6}',
    explanation: '默认按行扫描：先读完第一行再读第二行。'
  },
    {
    title: '示例 2：忽略空白与错误（清洗数据）',
    scene: '区域里混着空格和 #N/A，只想要有效数字。',
    dataTsv: 'A\tB\n1\t\n2\t3',
    dataAnchor: 'A1',
    formula: '=TOCOL(A2:B3, 3)',
    result: '{1; 2; 3}',
    explanation: '第二参数 3 = 空白和错误都忽略。这是把「脏区域」变成干净列表的最快写法。'
  }
  ],
  pitfalls: [
    {
    title: '想要按列读却忘了第三参数',
    reason: '默认是按行扫描，结果顺序和直觉不一样，数据会串位。',
    fix: '要按列读请显式写第三参数 TRUE。',
    level: 'high'
  },
    {
    title: '把 ignore 写成 TRUE/FALSE',
    reason: '第二参数是数字 0/1/2/3，不是布尔值，写 TRUE 会出错或取到错误语义。',
    fix: '用数字：0/1/2/3。',
    level: 'high'
  },
    {
    title: '溢出区域被占住',
    reason: '拉平后往往很长，下方容易被挡。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'torow',
    kind: 'companion',
    why: 'TOROW 是转成一行的版本。'
  },
    {
    id: 'wraprows',
    kind: 'companion',
    why: '拉平后常用 WRAPROWS 再折回多行。'
  },
    {
    id: 'vstack',
    kind: 'alternative',
    why: '把多段纵向拼接用 VSTACK。'
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

export default tocolEntry;
