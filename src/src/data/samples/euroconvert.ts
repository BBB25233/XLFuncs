import type { FunctionEntry } from '@/types';

/** EUROCONVERT · 欧元转换（financial 类 B9 批次） */

const euroconvertEntry: FunctionEntry = {
  id: 'euroconvert',
  enName: 'EUROCONVERT',
  zhName: '欧元转换',
  zhCommon: ['EUROCONVERT', '欧元换算'],
  alias: ['欧洲货币换算'],
  category: 'financial',
  abbr: 'oyzh',
  pinyin: 'ouyuanzhuanhuan',
  keywords: ['euroconvert', '欧元', '换算'],
  difficulty: 3,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '欧元与欧盟货币互转',
  summary: 'EUROCONVERT 按固定汇率在欧元与欧元区成员国旧货币（如德国马克、法郎）之间换算。',
  syntax: {
    patternCn: '=EUROCONVERT(金额, 源货币, 目标货币, [完整精度], [基准日期])',
    patternEn: '=EUROCONVERT(number, source, target, [full_precision], [triangulation_precision])',
    args: [{ key: 'number', zh: '金额', en: 'number', required: true, desc: '要换算的金额' },
    { key: 'source', zh: '源货币', en: 'source', required: true, desc: '源货币代码，如 "DEM"' },
    { key: 'target', zh: '目标货币', en: 'target', required: true, desc: '目标货币代码，如 "EUR"' },
    { key: 'full', zh: '完整精度', en: 'full_precision', required: false, desc: 'TRUE 用完整精度' },
    { key: 'triang', zh: '三角精度', en: 'triangulation_precision', required: false, desc: '中间换算精度位数' }],
  },
  returnValue: '换算后金额',
  examples: [{ title: '示例：马克转欧元', scene: '100 德国马克', dataAnchor: 'B2', formula: '=EUROCONVERT(100,"DEM","EUR")', result: '约 51.13', explanation: '按固定历史汇率。' }],
  pitfalls: [{ title: '代码要引号', reason: '货币代码是文本须加引号。', fix: '源/目标用 "DEM" 等。', level: 'mid' }],
  related: [{ id: 'round', kind: 'companion', why: 'ROUND 与本品类相关' },
    { id: 'product', kind: 'companion', why: 'PRODUCT 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'number', label: '金额', type: 'number', default: '100' },
      { key: 'source', label: '源货币', type: 'text', default: '"DEM"' },
      { key: 'target', label: '目标货币', type: 'text', default: '"EUR"' },
    ],
    template: '=EUROCONVERT({number},{source},{target})',
    cases: [
      { label: '100 DEM → 51.129188 EUR', type: 'ok', values: {}, expect: '51.129188', note: '按固定汇率 1 EUR = 1.95583 DEM 换算。' },
      { label: '金额非数字', type: 'error', values: { number: 'abc' }, expect: '#VALUE!', note: 'number 必须是数字。' },
      { label: '未知源货币', type: 'error', values: { source: '"XYZ"' }, expect: '#VALUE!', note: '源货币须为 12 种 legacy 货币或 EUR。' },
      { label: '未知目标货币', type: 'error', values: { target: '"XYZ"' }, expect: '#VALUE!', note: '目标货币须为 12 种 legacy 货币或 EUR。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default euroconvertEntry;
