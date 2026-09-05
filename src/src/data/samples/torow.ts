import type { FunctionEntry } from '@/types';

/** 转成一行 · 把一片区域拉平成一行，同样能忽略空白和错误（lambda 类 B17 批次，Microsoft 365） */

const torowEntry: FunctionEntry = {
  id: 'torow',
  enName: 'TOROW',
  zhName: '转成一行',
  zhCommon: ['TOROW', '转一行', '二维转一维'],
  alias: ['拉平成一行', '区域转行', '降维'],
  category: 'lambda',
  abbr: 'zcyh',
  pinyin: 'zhuanchengyihang',
  keywords: ['TOROW', '转成一行', '降维', '忽略空白', '动态数组'],
  difficulty: 2,
  usageLevel: 22,
  version: {
    min: '365',
    label: 'Microsoft 365 订阅版可用（动态数组 / LAMBDA 专属）'
  },
  oneLiner: '把一片区域拉平成一行，同样能忽略空白和错误',
  summary: 'TOROW(数组, [忽略项], [按列扫描]) 是 TOCOL 的横向版本，把二维区域压成一行。参数语义与 TOCOL 完全一致：忽略项 0/1/2/3，第三参数控制读取方向。常用于把一列数据转成横向表头，或为 HSTACK 准备横向数据。',
  syntax: {
    patternCn: '=TOROW(数组, [忽略项], [按列扫描])',
    patternEn: '=TOROW(array, [ignore], [scan_by_column])',
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
      desc: '0=全部保留；1=忽略空白；2=忽略错误；3=都忽略。',
      example: '3'
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
  returnValue: '返回单行数组（自动溢出）。',
  examples: [
    {
    title: '示例 1：区域拉平成一行',
    scene: '把 2 行 3 列拉成一行。',
    dataTsv: 'A\tB\tC\n1\t2\t3\n4\t5\t6',
    dataAnchor: 'A1',
    formula: '=TOROW(A2:C3)',
    result: '{1, 2, 3, 4, 5, 6}',
    explanation: '默认按行扫描，横向溢出。'
  },
    {
    title: '示例 2：列数据转成横向表头',
    scene: '把一列姓名转成横向排列。',
    dataTsv: '姓名\n张三\n李四\n王五',
    dataAnchor: 'A1',
    formula: '=TOROW(A2:A4)',
    result: '{张三, 李四, 王五}',
    explanation: '单列转单行，做动态表头、横向对比表很好用。'
  }
  ],
  pitfalls: [
    {
    title: 'ignore 参数写成布尔值',
    reason: '第二参数必须是数字 0/1/2/3。',
    fix: '用数字而非 TRUE/FALSE。',
    level: 'high'
  },
    {
    title: '读取方向不对导致串位',
    reason: '默认按行扫描，与「按列读」的结果顺序不同。',
    fix: '需要按列读时写第三参数 TRUE。',
    level: 'mid'
  },
    {
    title: '溢出区域被占住',
    reason: '横向溢出的右侧单元格有内容。',
    fix: '清空溢出区域。',
    level: 'mid',
    errorCode: '#SPILL!'
  }
  ],
  related: [
    {
    id: 'tocol',
    kind: 'companion',
    why: 'TOCOL 是转成一列的版本。'
  },
    {
    id: 'wrapcols',
    kind: 'companion',
    why: '拉平后常用 WRAPCOLS 折回多列。'
  },
    {
    id: 'hstack',
    kind: 'alternative',
    why: '横向拼接多个数组用 HSTACK。'
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

export default torowEntry;
