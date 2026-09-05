import type { FunctionEntry } from '@/types';

/** INFO · 系统信息（information 类 B8 批次） */

const infoEntry: FunctionEntry = {
  id: 'info',
  enName: 'INFO',
  zhName: '系统信息',
  zhCommon: [
    'INFO',
    '环境信息',
    '系统参数'
  ],
  alias: [
    '环境信息',
    '系统参数'
  ],
  category: 'information',
  abbr: 'xtxx',
  pinyin: 'xitongxinxi',
  keywords: [
    'INFO',
    '系统',
    '环境',
    '操作系统',
    '版本'
  ],
  difficulty: 2,
  usageLevel: 10,
  version: {
    min: 'all',
    label: '所有 Excel 版本可用',
    notes: 'INFO 返回当前环境信息：操作系统("osversion")、Excel 版本("release")、内存("memavail")、重算模式("recalc")等。'
  },
  oneLiner: '读取 Excel 运行环境信息',
  summary: 'INFO 返回「这台电脑/这个 Excel 现在的环境」：操作系统、Excel 版本号、可用内存、自动还是手动重算。多用于做跨平台模板的兼容判断或排查环境差异。',
  syntax: {
    patternCn: '=INFO(类型文本)',
    patternEn: '=INFO(type_text)',
    args: [
      {
        key: 'type_text',
        zh: '类型文本',
        en: 'type_text',
        required: true,
        desc: '要查的环境项，文本。',
        accepts: '"osversion"/"release"/"memavail"/"recalc"/"system" 等。',
        ifOmitted: '必填。',
        example: '"release"',
        tip: '常用："release" Excel 版本、"osversion" 系统、"recalc" 重算模式(自动=A 手动=M)。'
      }
    ]
  },
  returnValue: '返回对应环境信息的文本；类型非法则 #VALUE!。',
  examples: [
    {
      title: '示例 1：Excel 版本',
      scene: '看看当前 Excel 版本。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=INFO("release")',
      result: '16.0',
      explanation: '返回 Excel 主版本号（如 16.0 对应 365/2019+）。'
    },
    {
      title: '示例 2：重算模式',
      scene: '确认是自动还是手动重算。',
      dataTsv: '',
      dataAnchor: '',
      formula: '=INFO("recalc")',
      result: 'A',
      explanation: 'A=自动重算，M=手动。'
    }
  ],
  pitfalls: [
    {
      title: '易失且随环境变',
      reason: 'INFO 结果依赖运行机器，换电脑可能不同。',
      fix: '别把它当固定常量用。',
      level: 'mid'
    },
    {
      title: '类型拼错',
      reason: '文本写错返回 #VALUE!。',
      fix: '核对 "release"/"osversion" 等。',
      level: 'low',
      errorCode: '#VALUE!'
    }
  ],
  related: [
    {
      id: 'cell',
      kind: 'companion',
      why: 'CELL 取单元格信息，INFO 取系统信息。'
    },
    {
      id: 'type',
      kind: 'companion',
      why: 'TYPE 取单元格值的类型。'
    }
  ],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {

    },
    fields: [
      { key: 'type_text', label: '类型文本', type: 'text', default: '"release"', placeholder: '如 "release"', hint: '要查的环境项，文本带引号' },
    ],
    template: '=INFO({type_text})',
    cases: [
      { label: 'Excel 版本', type: 'ok', values: {}, expect: '16.0', note: 'release → 16.0（简化）' },
      { label: '操作系统', type: 'ok', values: { type_text: '"system"' }, expect: 'pcdos', note: 'system → pcdos（简化）' },
      { label: '文件编号', type: 'ok', values: { type_text: '"numfile"' }, expect: '1', note: 'numfile → 1（简化）' },
      { label: '缺类型 → #VALUE!', type: 'error', values: { type_text: '' }, expect: '#VALUE!', note: '类型必填' },
      { label: '未知类型 → #VALUE!', type: 'error', values: { type_text: '"xyz"' }, expect: '#VALUE!', note: '类型不被识别' },
      { label: '数字当类型 → #VALUE!', type: 'error', values: { type_text: '123' }, expect: '#VALUE!', note: '类型须为文本' },
    ],
  },
  meta: {
    updatedAt: '2026-08-31',
    status: 'published',
    customEdited: false
  }
};

export default infoEntry;
