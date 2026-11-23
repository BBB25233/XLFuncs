import type { FunctionEntry } from '@/types';

/** CELL · 单元格信息（information 类 B8 批次） */

const cellEntry: FunctionEntry = {
  id: 'cell',
  enName: 'CELL',
  zhName: '单元格信息',
  zhCommon: [
    'CELL',
    '单元格属性',
    '单元格格式信息'
  ],
  alias: [
    '单元格属性',
    '格式信息'
  ],
  category: 'information',
  abbr: 'dygxx',
  pinyin: 'danyuangexinxi',
  keywords: [
    'CELL',
    '单元格',
    '信息',
    '格式',
    '地址'
  ],
  difficulty: 3,
  usageLevel: 16,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'CELL 返回引用单元格的各种信息：地址、行号、列号、文件名、格式、内容类型等，由第一参数 info_type 指定。'
  },
  oneLiner: '取单元格的格式/位置等信息',
  summary: 'CELL 像个「单元格侦探」：给它一个信息类型（"address" 地址、"row" 行号、"col" 列号、"filename" 文件名、"format" 格式码…）和可选的引用，就能读出该格的元信息。常用于做自适应公式或排查格式问题。',
  syntax: {
    patternCn: '=CELL(信息类型,[引用])',
    patternEn: '=CELL(info_type,[reference])',
    args: [
      {
        key: 'info_type',
        zh: '信息类型',
        en: 'info_type',
        required: true,
        desc: '要查的信息种类，文本。',
        accepts: '"address"/"row"/"col"/"filename"/"format" 等。',
        ifOmitted: '必填。',
        example: '"row"',
        tip: '常用："address" 地址、"row" 行、"col" 列、"width" 列宽、"format" 格式。'
      },
      {
        key: 'reference',
        zh: '引用',
        en: 'reference',
        required: false,
        desc: '目标单元格/区域（区域只取左上角）。',
        accepts: '单元格、区域。',
        ifOmitted: '省略时取最后改动过的单元格。',
        example: 'A1'
      }
    ]
  },
  returnValue: '按信息类型返回文本或数字；类型非法则 #VALUE!。',
  examples: [
    {
      title: '示例 1：取行号',
      scene: '想知道某格在第几行。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=CELL("row",B5)',
      result: '5',
      explanation: '返回 B5 的行号 5。'
    },
    {
      title: '示例 2：取地址',
      scene: '返回带 $ 的绝对地址。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=CELL("address",C3)',
      result: '$C$3',
      explanation: '返回绝对引用地址。'
    }
  ],
  pitfalls: [
    {
      title: '省略引用取「最近改动格」',
      reason: '不填引用时，CELL 返回工作表上最后被改动单元格的信息，会随操作变化。',
      fix: '务必写明引用。',
      level: 'high'
    },
    {
      title: '易失函数',
      reason: 'CELL 是易失函数，改动单元格会重算，大表可能卡。',
      fix: '谨慎用于大表。',
      level: 'mid'
    },
    {
      title: '信息类型拼错',
      reason: '类型名要带引号且小写，写错会 #VALUE!。',
      fix: '核对 "address"/"row"/"col" 等。',
      level: 'low',
      errorCode: '#VALUE!'
    }
  ],
  related: [
    {
      id: 'info',
      kind: 'companion',
      why: 'INFO 取系统/环境信息，CELL 取单元格信息。'
    },
    {
      id: 'type',
      kind: 'companion',
      why: 'TYPE 取值的类型编号。'
    },
    {
      id: 'address',
      kind: 'companion',
      why: 'ADDRESS 由行列反推地址，和 CELL("address") 互补。'
    }
  ],
  calc: {
    enabled: true,
    ranges: {

    },
    fields: [
      { key: 'info_type', label: '信息类型', type: 'text', default: '"address"', placeholder: '如 "address"', hint: 'CELL 要查的信息种类，文本需带引号' },
      { key: 'ref', label: '引用', type: 'ref', default: 'A2', rangeKey: 'ref' },
    ],
    template: '=CELL({info_type},{ref})',
    cases: [
      { label: '默认：取地址', type: 'ok', values: {}, expect: '$A$2', note: 'info_type="address"，简化为固定返回 A2' },
      { label: '类型=空白', type: 'ok', values: { info_type: '"type"' }, expect: 'b', note: '示例表为空，A2 无内容 → b（空白）' },
      { label: '格式=常规', type: 'ok', values: { info_type: '"format"' }, expect: 'G', note: '常规格式码 G' },
      { label: '缺信息类型 → #VALUE!', type: 'error', values: { info_type: '' }, expect: '#VALUE!', note: 'info_type 必填' },
      { label: '未知类型 → #VALUE!', type: 'error', values: { info_type: '"xyz"' }, expect: '#VALUE!', note: '类型名不被识别' },
      { label: '数字当类型 → #VALUE!', type: 'error', values: { info_type: '123' }, expect: '#VALUE!', note: '类型必须是文本' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default cellEntry;
