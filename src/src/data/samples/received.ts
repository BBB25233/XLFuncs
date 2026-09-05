import type { FunctionEntry } from '@/types';

/** RECEIVED · 赎回金额（financial 类 B9 批次） */

const receivedEntry: FunctionEntry = {
  id: 'received',
  enName: 'RECEIVED',
  zhName: '赎回金额',
  zhCommon: ['RECEIVED', '赎回额'],
  alias: ['到期总额'],
  category: 'financial',
  abbr: 'shje',
  pinyin: 'shuhuijine',
  keywords: ['received', '赎回', '债券'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算到期一次性收回总额',
  summary: 'RECEIVED 返回折价债券到期时一次性收回的总金额（含利息），是 PRICEDISC 的逆量。',
  syntax: {
    patternCn: '=RECEIVED(结算日, 到期日, 投资, 贴现率, [基准])',
    patternEn: '=RECEIVED(settlement, maturity, investment, discount, [basis])',
    args: [{ key: 'settlement', zh: '结算日', en: 'settlement', required: true, desc: '结算日期' },
    { key: 'maturity', zh: '到期日', en: 'maturity', required: true, desc: '到期日期' },
    { key: 'investment', zh: '投资', en: 'investment', required: true, desc: '购买价' },
    { key: 'discount', zh: '贴现率', en: 'discount', required: true, desc: '年化贴现率' },
    { key: 'basis', zh: '基准', en: 'basis', required: false, desc: '日计数基准，默认 0' }],
  },
  returnValue: '到期收回总额',
  examples: [{ title: '示例：赎回额', scene: '买入 95.2、贴现 5%', dataAnchor: 'B2', formula: '=RECEIVED(DATE(2024,1,1),DATE(2025,1,1),95.2,0.05,0)', result: '约 100.0', explanation: '折价的利差到期兑现。' }],
  pitfalls: [{ title: '单位一致', reason: 'investment 与结果同单位。', fix: '用同一面值单位。', level: 'low' }],
  related: [{ id: 'pricedisc', kind: 'companion', why: 'PRICEDISC 与本品类相关' },
    { id: 'disc', kind: 'companion', why: 'DISC 与本品类相关' },
    { id: 'intrate', kind: 'companion', why: 'INTRATE 与本品类相关' }],
  calc: {
    "enabled": true,
    "ranges": {},
    "fields": [
      {
        "key": "settlement",
        "label": "结算日",
        "type": "text",
        "default": "2024-01-01"
      },
      {
        "key": "maturity",
        "label": "到期日",
        "type": "text",
        "default": "2025-01-01"
      },
      {
        "key": "investment",
        "label": "投资",
        "type": "text",
        "default": "95.2"
      },
      {
        "key": "discount",
        "label": "贴现率",
        "type": "text",
        "default": "0.05"
      },
      {
        "key": "basis",
        "label": "基准",
        "type": "text",
        "default": "0"
      }
    ],
    "template": "=RECEIVED({settlement},{maturity},{investment},{discount},{basis})",
    "cases": [
      {
        "label": "标准案例",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "investment": "95.2",
          "discount": "0.05",
          "basis": "0"
        },
        "expect": "100.210526",
        "note": ""
      },
      {
        "label": "投资 90",
        "type": "ok",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "investment": "90",
          "discount": "0.05",
          "basis": "0"
        },
        "expect": "94.736842",
        "note": ""
      },
      {
        "label": "非法日期",
        "type": "error",
        "values": {
          "settlement": "abc",
          "maturity": "2025-01-01",
          "investment": "95.2",
          "discount": "0.05",
          "basis": "0"
        },
        "expect": "#VALUE!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "结算≥到期",
        "type": "error",
        "values": {
          "settlement": "2025-01-01",
          "maturity": "2025-01-01",
          "investment": "95.2",
          "discount": "0.05",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      },
      {
        "label": "投资≤0",
        "type": "error",
        "values": {
          "settlement": "2024-01-01",
          "maturity": "2025-01-01",
          "investment": "0",
          "discount": "0.05",
          "basis": "0"
        },
        "expect": "#NUM!",
        "note": "参数非法/数值域错误触发错误码"
      }
    ]
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default receivedEntry;
