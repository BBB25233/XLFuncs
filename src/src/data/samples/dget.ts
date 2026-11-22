import type { FunctionEntry } from '@/types';

/** DGET · 数据库取值（database 类 B8 批次） */

const dgetEntry: FunctionEntry = {
  id: 'dget',
  enName: 'DGET',
  zhName: '数据库取值',
  zhCommon: [
    'DGET',
    '条件取值',
    '库取值'
  ],
  alias: [
    '条件取值'
  ],
  category: 'database',
  abbr: 'sjkqz',
  pinyin: 'shujukuquzhi',
  keywords: [
    'DGET',
    '数据库',
    '取值',
    '条件'
  ],
  difficulty: 2,
  usageLevel: 18,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'D 函数按「条件区域」从数据库表中筛选行，再对指定字段做取唯一值；条件支持通配符与比较运算符。'
  },
  oneLiner: '按条件从数据库取唯一匹配的值',
  summary: 'DGET 按条件精确取出一个值——要求筛选结果「恰好一行」，多于一行报 #NUM!，零行报 #VALUE!。相当于数据库版的精确查找。',
  syntax: {
    patternCn: '=DGET(数据库,字段,条件)',
    patternEn: '=DGET(database, field, criteria)',
    args: [
      {
        key: 'database',
        zh: '数据库',
        en: 'database',
        required: true,
        desc: '带标题行的数据区域（整张表含表头）。',
        accepts: '单元格区域。',
        ifOmitted: '必填。',
        example: 'A1:D5',
        tip: '首行必须是列标题。'
      },
      {
        key: 'field',
        zh: '字段',
        en: 'field',
        required: true,
        desc: '要统计的列，写标题文本或列序号。',
        accepts: '"销售额" 或 3。',
        ifOmitted: '必填。',
        example: '"销售额"'
      },
      {
        key: 'criteria',
        zh: '条件',
        en: 'criteria',
        required: true,
        desc: '带标题的条件区域（至少含一列标题+条件值）。',
        accepts: '单元格区域。',
        ifOmitted: '必填。',
        example: 'A7:B8',
        tip: '条件区和数据库共用标题名。'
      }
    ]
  },
  returnValue: '返回唯一匹配值；多行 #NUM!，无行 #VALUE!。',
  examples: [
    {
      title: '示例 1：按名称取唯一记录',
      scene: '想知道「白菜」这一条的销售额。',
      dataTsv: '名称\t类型\t销售额\t数量\t\t名称\n苹果\t水果\t1000\t10\t\t白菜\n橙子\t水果\t800\t8\n白菜\t蔬菜\t300\t20\n苹果\t水果\t1200\t12\n类型\n"水果"\n类型\n"蔬菜"\n类型\n"海鲜"',
      dataAnchor: 'A1',
      formula: '=DGET(A1:D5,"销售额",F1:F2)',
      result: '300',
      explanation: '按名称唯一命中「白菜」，取回 300。'
    },
    {
      title: '示例 2：按数值条件取唯一记录',
      scene: '数量正好是 12 的那一条（只有第二只苹果）。',
      dataTsv: '名称\t类型\t销售额\t数量\t\t数量\n苹果\t水果\t1000\t10\t\t12\n橙子\t水果\t800\t8\n白菜\t蔬菜\t300\t20\n苹果\t水果\t1200\t12\n类型\n"水果"\n类型\n"蔬菜"\n类型\n"海鲜"',
      dataAnchor: 'A1',
      formula: '=DGET(A1:D5,"销售额",F1:F2)',
      result: '1200',
      explanation: '按数量 =12 唯一命中第二只苹果，取回 1200。'
    }
  ],
  pitfalls: [
    {
      title: '条件区缺标题',
      reason: '条件区域必须带和数据库一致的列标题，否则筛选错乱。',
      fix: '条件表头和数据库表头一字不差。',
      level: 'high'
    },
    {
      title: '字段名写错',
      reason: 'field 拼错或不在表头里返回 #VALUE!。',
      fix: '用和表头完全相同的文本。',
      level: 'mid',
      errorCode: '#VALUE!'
    },
    {
      title: '数字当文本比大小',
      reason: '条件写 ">9" 若字段是文本会按字符比。',
      fix: '确保字段是数字格式。',
      level: 'low'
    }
  ],
  related: [
    {
      id: 'daverage',
      kind: 'companion',
      why: 'D 函数家族，DAVERAGE 求均值。'
    },
    {
      id: 'dcount',
      kind: 'companion',
      why: 'DCOUNT 计数（只数数字）。'
    },
    {
      id: 'dsum',
      kind: 'companion',
      why: 'DSUM 求和，最常用。'
    }
  ],
  calc: {
    enabled: true,
    ranges: { database: 'A1:D5', criteria: 'A8:A9' },
    fields: [
      { key: 'database', label: '数据库区域', type: 'ref', default: 'A1:D5', hint: '含表头的数据区域' },
      { key: 'field', label: '字段', type: 'text', default: '"销售额"', hint: '列名文本（与表头一致）或列序号（如 3）' },
      { key: 'criteria', label: '条件区域', type: 'ref', default: 'A8:A9', hint: '首行条件列名、其下条件值（需唯一匹配）' },
    ],
    template: '=DGET({database},{field},{criteria})',
    cases: [
      { label: '蔬菜唯一匹配取销售额（A8:A9）', type: 'ok', values: { database: 'A1:D5', field: '"销售额"', criteria: 'A8:A9' }, expect: '300', note: '只有白菜是蔬菜，销售额=300。' },
      { label: '无匹配行 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"销售额"', criteria: 'A10:A11' }, expect: '#VALUE!', note: '类型=海鲜 无匹配，DGET 报 #VALUE!。' },
      { label: '多匹配行 → #NUM!', type: 'error', values: { database: 'A1:D5', field: '"销售额"', criteria: 'A6:A7' }, expect: '#NUM!', note: '水果三行都满足，DGET 要求唯一，报 #NUM!。' },
      { label: '字段名写错 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"不存在"', criteria: 'A8:A9' }, expect: '#VALUE!', note: 'field 必须和表头一致。' },
      { label: '空条件区域 → #VALUE!', type: 'error', values: { database: 'A1:D5', field: '"销售额"', criteria: '' }, expect: '#VALUE!', note: '条件区域留空时报 #VALUE!。' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default dgetEntry;
