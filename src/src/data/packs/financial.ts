import type { FunctionEntry } from '@/types';
import fvscheduleEntry from '@/data/samples/fvschedule';
import npvEntry from '@/data/samples/npv';
import xnpvEntry from '@/data/samples/xnpv';
import ppmtEntry from '@/data/samples/ppmt';
import ipmtEntry from '@/data/samples/ipmt';
import cumipmtEntry from '@/data/samples/cumipmt';
import cumprincEntry from '@/data/samples/cumprinc';
import effectEntry from '@/data/samples/effect';
import nominalEntry from '@/data/samples/nominal';
import slnEntry from '@/data/samples/sln';
import sydEntry from '@/data/samples/syd';
import dbEntry from '@/data/samples/db';
import ddbEntry from '@/data/samples/ddb';
import vdbEntry from '@/data/samples/vdb';
import amorlincEntry from '@/data/samples/amorlinc';
import amordegrcEntry from '@/data/samples/amordegrc';
import accrintEntry from '@/data/samples/accrint';
import accrintmEntry from '@/data/samples/accrintm';
import discEntry from '@/data/samples/disc';
import durationEntry from '@/data/samples/duration';
import mdurationEntry from '@/data/samples/mduration';
import intrateEntry from '@/data/samples/intrate';
import oddfpriceEntry from '@/data/samples/oddfprice';
import oddfyieldEntry from '@/data/samples/oddfyield';
import oddlpriceEntry from '@/data/samples/oddlprice';
import oddlyieldEntry from '@/data/samples/oddlyield';
import priceEntry from '@/data/samples/price';
import pricediscEntry from '@/data/samples/pricedisc';
import pricematEntry from '@/data/samples/pricemat';
import receivedEntry from '@/data/samples/received';
import tbilleqEntry from '@/data/samples/tbilleq';
import tbillpriceEntry from '@/data/samples/tbillprice';
import tbillyieldEntry from '@/data/samples/tbillyield';
import yieldEntry from '@/data/samples/yield';
import yielddiscEntry from '@/data/samples/yielddisc';
import yieldmatEntry from '@/data/samples/yieldmat';
import coupdaybsEntry from '@/data/samples/coupdaybs';
import coupdaysEntry from '@/data/samples/coupdays';
import coupdaysncEntry from '@/data/samples/coupdaysnc';
import coupncdEntry from '@/data/samples/coupncd';
import coupnumEntry from '@/data/samples/coupnum';
import couppcdEntry from '@/data/samples/couppcd';
import rriEntry from '@/data/samples/rri';
import pdurationEntry from '@/data/samples/pduration';
import xirrEntry from '@/data/samples/xirr';
import irrEntry from '@/data/samples/irr';
import mirrEntry from '@/data/samples/mirr';
import dollardeEntry from '@/data/samples/dollarde';
import dollarfrEntry from '@/data/samples/dollarfr';
import euroconvertEntry from '@/data/samples/euroconvert';
import ispmtEntry from '@/data/samples/ispmt';

/**
 * 财务类 5 条（第一版全部占位，本版补全为完整条目）
 * 写作口径：PRD §10.4 / §10.5.2，仿 samples/if.ts 深度、结构与语气。
 *
 * 共同约定（务必讲清的坑）：
 * ① 现金流符号 —— 你「收到」的钱为正（收入），你「付出」的钱为负（支出）。
 *    因此 PMT/NPER 等返回「每期要付出去的钱」时通常是负数，想正数显示就套一个负号 =-PMT(...)。
 * ② rate 一律是「每期利率」，不是年利率。按月还就 年利率÷12，按周还就 年利率÷52。
 * ③ rate 与 nper 必须用同一时间单位（月利率配月数、年利率配年数）。
 */

/* ============================== PMT 每期付款额 ============================== */

const PMT_PARAM_TSV = '参数\t数值\n年利率\t0.05\n还款期数(月)\t240\n贷款金额\t500000';

const pmt: FunctionEntry = {
  id: 'pmt',
  enName: 'PMT',
  zhName: '每期付款额',
  zhCommon: ['月供', '每期还款', '分期付款'],
  alias: ['还款额', '分期计算', '年金支付'],
  category: 'financial',
  abbr: 'mqfke',
  pinyin: 'meiqifukuane',
  keywords: ['月供计算', '贷款还款', '每期付款', '分期月供', '年金', '等额本息', '还贷金额'],
  difficulty: 4,
  usageLevel: 40,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '利率、期数、本金三者单位要一致；结果默认是负数（你付出去的钱），用 -PMT(...) 显示正数。',
  },
  oneLiner: '已知利率和期数，算每期还多少',
  summary:
    '算分期（房贷、车贷、年金）每月该还多少钱时第一个想到它。给它利率、期数和贷款本金，它返回每期固定还款额。注意它返回的是负数——因为那是你「付出」的钱；想要正数显示，外面套一个负号 =-PMT(...)。',
  syntax: {
    patternCn: '=PMT(利率, 期数, 现值, [未来值], [付款类型])',
    patternEn: '=PMT(rate, nper, pv, [fv], [type])',
    args: [
      {
        key: 'rate',
        zh: '利率',
        en: 'rate',
        required: true,
        desc: '每期利率。',
        accepts: '年利率÷12（按月还）· 年利率÷52（按周还）· 直接引用写了「5%」的单元格。',
        ifOmitted: '必填；留空公式不成立。',
        tip: '【最常填错】这里必须是「每期利率」，不是年利率。年利率 5% 按月还要写 5%/12。',
        example: 'B2/12',
        pitfallRank: 1,
      },
      {
        key: 'nper',
        zh: '期数',
        en: 'nper',
        required: true,
        desc: '还款总期数。',
        accepts: '月数（如 240）· 年数×12。',
        tip: '单位要和 rate 一致：月利率就配月数，年利率就配年数。',
        example: '240',
        pitfallRank: 2,
      },
      {
        key: 'pv',
        zh: '现值',
        en: 'pv',
        required: true,
        desc: '当前价值，通常是贷款本金（你拿到手的钱，填正数）。',
        accepts: '贷款总额（正数）· 引用本金单元格。',
        tip: '贷款本金填正数（你收钱）；若填负数，返回的月供会变成正数。',
        example: '500000',
        pitfallRank: 3,
      },
      {
        key: 'fv',
        zh: '未来值',
        en: 'fv',
        required: false,
        desc: '还完最后一期后还想剩下的钱，一般贷款是 0（恰好还清）。',
        ifOmitted: '省略等于 0，即全部还清、不欠不剩。',
        tip: '想留尾款（如最后再付一笔）才需要填。',
        example: '0',
      },
      {
        key: 'type',
        zh: '付款类型',
        en: 'type',
        required: false,
        desc: '0 = 每期期末付款（默认）；1 = 每期期初付款。',
        accepts: '0 期末（默认） / 1 期初。',
        ifOmitted: '省略按 0（期末）处理，房贷车贷都是期末。',
        tip: '月初就扣本金的「先付」业务才填 1，月供会略低一点点。',
        example: '0',
      },
    ],
  },
  returnValue: '返回每期付款额；按「支出为负」的现金流约定，结果通常是负数。',
  examples: [
    {
      title: '示例 1：房贷月供（含利率换算，结果转正数显示）',
      scene: '贷款 50 万，年利率 5%，分 20 年（240 期）按月等额本息还款，想知道每月还款额。',
      dataTsv: PMT_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=-PMT(B2/12, B3, B4)',
      result: '月供约 3,301.35 元（B2/12 是月利率，B3 是 240 期，B4 是 50 万本金）',
      explanation:
        'PMT 返回的月供是负数（你每月掏钱出去），前面加负号把显示翻成正的。B2 单元格本身是 5%，除以 12 才是月利率。',
    },
    {
      title: '示例 2：纯数值速算（借 1 万、月利 0.5%、12 期）',
      scene: '不想拉表格，直接心算一笔小额分期的月供。',
      dataTsv: PMT_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=-PMT(0.005, 12, 10000)',
      result: '月供约 859.46 元',
      explanation: '0.005 就是 0.5% 的月利率；12 是期数；10000 是本金（正数）。直接把负号套在外面得到正数月供。',
    },
    {
      title: '示例 3：月初先付（type=1）比月末少还一点',
      scene: '同样的条件，但业务要求每月 1 号就扣款（期初付款），对比月末扣款差多少。',
      dataTsv: PMT_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=-PMT(B2/12, B3, B4, 0, 1)',
      result: '月供约 3,297.68 元，比示例 1 的 3,301.35 略低',
      explanation: '第 5 个参数填 1 表示「期初付款」：钱早付一期，占用时间短，所以月供比期末（type=0）稍小。',
    },
  ],
  pitfalls: [
    {
      title: '把年利率直接当 rate 填进去（月供算成几十倍）',
      reason: 'PMT 的 rate 是「每期利率」，不是年利率。用年利率 5% 当 rate，等于按 500% 的年利在算。',
      fix: '按月还就写 年利率/12，如 =-PMT(0.05/12, 240, 500000)；按周还写 /52。',
      level: 'high',
    },
    {
      title: '结果是个负数，以为公式写错了',
      reason: '现金流约定「收入为正、支出为负」，月供是你「付出去」的钱，所以 PMT 返回负数。这是对的，不是报错。',
      fix: '想显示正数就在外面套负号：=-PMT(利率,期数,本金)。',
      level: 'high',
    },
    {
      title: 'rate 用月利率、nper 却填了年数（单位不统一）',
      reason: 'rate 和 nper 必须同一时间单位。月利率 0.00417 配 240（月）才对；若 nper 填 20（年），期数少算 12 倍。',
      fix: '要么都用「月」（月利率 + 月数），要么都用「年」（年利率 + 年数）。',
      level: 'high',
    },
    {
      title: '把 5% 写成 5 当利率',
      reason: '手填数字 5 在 Excel 里就是 5（即 500%），不是 5%。只有单元格写成 5% 才会被当成 0.05。',
      fix: '手填就写 0.05；或引用一个显示「5%」的单元格（其内容就是 0.05）。',
      level: 'mid',
    },
    {
      title: '期数 nper 填 0 或负数，公式报错',
      reason: '期数必须 > 0，否则要除以期数时无从算起。',
      fix: '检查期数单元格是否漏填或被 0 除；nper 必须是正整数。',
      level: 'mid',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'pv',
      kind: 'companion',
      why: '反过来：已知月供和利率，算现在最多能贷多少本金，用 PV。',
    },
    {
      id: 'fv',
      kind: 'companion',
      why: '方向相反：每月存一笔、算到期总额用 FV；PMT 是算每月该付多少。',
    },
    {
      id: 'rate',
      kind: 'companion',
      why: '已知月供反推真实利率（常被用来识破「低月供」陷阱）用 RATE。',
    },
    {
      id: 'nper',
      kind: 'companion',
      why: '反过来：想还清某笔债要还多少期，用 NPER。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.05', hint: '每期利率，不是年利率；月还写 年利率/12' },
      { key: 'nper', label: '期数', type: 'number', default: '240', hint: '还款总期数，与 rate 同单位' },
      { key: 'pv', label: '现值', type: 'number', default: '500000', hint: '贷款本金（正数）' },
      { key: 'fv', label: '未来值', type: 'number', default: '0', hint: '留空=0（恰好还清）' },
      {
        key: 'type',
        label: '付款类型',
        type: 'select',
        default: '0',
        options: [
          { value: '0', label: '期末（默认）' },
          { value: '1', label: '期初' },
        ],
      },
    ],
    template: '=PMT({rate},{nper},{pv},{fv},{type})',
    cases: [
      {
        label: '零利率分期：12 期还 1200',
        type: 'ok',
        values: { rate: '0', nper: '12', pv: '1200', fv: '0', type: '0' },
        expect: '-100',
        note: 'rate=0 走简化式：-(pv+fv)/nper = -(1200)/12 = -100（负数代表你付出去）。',
      },
      {
        label: '月利 0.5%、12 期、本金 10000',
        type: 'ok',
        values: { rate: '0.005', nper: '12', pv: '10000', fv: '0', type: '0' },
        expect: '860.664297',
        note: '标准 PMT 公式，结果默认负数（每月付出去的钱）。',
      },
      {
        label: '期数 nper=0 → #DIV/0!',
        type: 'error',
        values: { rate: '0.05', nper: '0', pv: '500000', fv: '0', type: '0' },
        expect: '#DIV/0!',
        note: '没有期数无从计算每期付款。',
      },
      {
        label: '利率与期数都为 0 → #DIV/0!',
        type: 'error',
        values: { rate: '0', nper: '0', pv: '500000', fv: '0', type: '0' },
        expect: '#DIV/0!',
        note: 'rate=0 且 nper=0 同时成立，分母为 0。',
      },
      {
        label: '利率填非数字 → #VALUE!',
        type: 'error',
        values: { rate: 'abc', nper: '240', pv: '500000', fv: '0', type: '0' },
        expect: '#VALUE!',
        note: 'rate 必须是数字。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================== RATE 利率 ============================== */

const RATE_PARAM_TSV = '参数\t数值\n总期数\t60\n每期还款\t-1100\n贷款金额\t50000';

const rate: FunctionEntry = {
  id: 'rate',
  enName: 'RATE',
  zhName: '利率',
  zhCommon: ['实际利率', '反算利率', '内部收益率'],
  alias: ['真实利率', '月利率反推', '利率测算'],
  category: 'financial',
  abbr: 'll',
  pinyin: 'lilv',
  keywords: ['利率计算', '反算利率', '实际年化', '内部收益率', '真实费率', '分期真实成本', '收益率'],
  difficulty: 4,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '返回的是「每期利率」，年化要再乘以期数（月利率×12）。pmt 与 pv 必须一正一负才有解。',
  },
  oneLiner: '已知每期还多少，反算实际利率',
  summary:
    '销售说「每月只要还 1100，60 期还清，一共才 5 万」——实际年化到底多高？给你期数、每期还款和本金，RATE 反推出每期利率，再乘期数就是真实年化。它是财务函数里最「挑输入」的一个：pmt 和 pv 必须一正一负，否则会报 #NUM!。',
  syntax: {
    patternCn: '=RATE(期数, 每期付款, 现值, [未来值], [付款类型], [预估值])',
    patternEn: '=RATE(nper, pmt, pv, [fv], [type], [guess])',
    args: [
      {
        key: 'nper',
        zh: '期数',
        en: 'nper',
        required: true,
        desc: '还款总期数。',
        accepts: '月数 · 年数（与 pmt 同单位）。',
        tip: '和 pmt 同一时间单位：月还就填月数。',
        example: '60',
        pitfallRank: 2,
      },
      {
        key: 'pmt',
        zh: '每期付款',
        en: 'pmt',
        required: true,
        desc: '每期支出的钱（你付出去，填负数）。',
        accepts: '负数（如 -1100）。',
        tip: '【最常填错】每期付款是你「付出去」的钱，必须为负；与 pv 一正一负才有解。',
        example: '-1100',
        pitfallRank: 1,
      },
      {
        key: 'pv',
        zh: '现值',
        en: 'pv',
        required: true,
        desc: '现在拿到手的钱（本金，填正数）。',
        accepts: '正数（如 50000）。',
        tip: 'pv 与 pmt 符号相反：pv 正、pmt 负。两个同号会 #NUM!。',
        example: '50000',
        pitfallRank: 3,
      },
      {
        key: 'fv',
        zh: '未来值',
        en: 'fv',
        required: false,
        desc: '期末还想剩的钱，一般 0。',
        ifOmitted: '省略等于 0（恰好还清）。',
        example: '0',
      },
      {
        key: 'type',
        zh: '付款类型',
        en: 'type',
        required: false,
        desc: '0 = 期末（默认）；1 = 期初。',
        accepts: '0 / 1。',
        ifOmitted: '省略按 0（期末）。',
        example: '0',
      },
      {
        key: 'guess',
        zh: '预估值',
        en: 'guess',
        required: false,
        desc: '给 Excel 一个猜测的利率起点，帮它更快收敛。',
        accepts: '小数，如 0.1 表示 10%（默认就是 0.1）。',
        ifOmitted: '省略默认 0.1（10%）。利率很高或很怪时建议手动给。',
        tip: '结果离谱或报 #NUM!，多半是 guess 太远，改小一点再试。',
        example: '0.1',
      },
    ],
  },
  returnValue: '返回每期利率（小数）。年化 = 结果 × 每年期数（月利率×12）。',
  examples: [
    {
      title: '示例 1：分期「5 万、月还 1100、60 期」的真实月利率',
      scene: '商家说免息，但要先算清楚每月 1100、还 60 期、到手 5 万，真实月利率和年化是多少。',
      dataTsv: RATE_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=RATE(A2, A3, A4)',
      result: '月利率约 0.49%（A2=60 期，A3=-1100 每期还款为负，A4=50000 本金为正）',
      explanation: 'pmt 填负（你付钱）、pv 填正（你收钱），两者符号相反才有解。结果约 0.96% 是月利率。',
    },
    {
      title: '示例 2：把月利率乘 12 得到真实年化',
      scene: '上例拿到月利率后，想知道名义年化（注意这不是复利口径的 APR，是比较口径）。',
      dataTsv: RATE_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=RATE(A2, A3, A4) * 12',
      result: '名义年化约 5.87%',
      explanation: 'RATE 返回的是每期利率，乘以每年 12 期得到年化。若要看复利口径，用 =(1+RATE(...))^12-1。',
    },
  ],
  pitfalls: [
    {
      title: 'pmt 和 pv 填成同号 → #NUM!',
      reason: 'RATE 靠「现金一进一出」才能解出利率。两笔都正（或都负）相当于没有现金流方向，方程无解。',
      fix: 'pv 填正数（你收本金）、pmt 填负数（你每期还款）；或反过来 pv 负、pmt 正。',
      level: 'high',
      errorCode: '#NUM!',
    },
    {
      title: '结果是个「每期利率」，被当成年化',
      reason: 'RATE 返回的是单期利率（月还就是月利率）。直接读 0.49% 当成年化，会严重低估成本。',
      fix: '月还就 ×12 看年化；周还就 ×52。别把月利率当成年利率。',
      level: 'high',
    },
    {
      title: 'guess 给得太离谱或根本无解 → #NUM!',
      reason: '利率方程可能有多解或无解，Excel 从 guess 出发迭代；guess 离真实值太远会发散。',
      fix: '把 guess 调小（如 0.01）或调大再试；确认 pmt/pv 符号相反、nper>0。',
      level: 'mid',
      errorCode: '#NUM!',
    },
    {
      title: '期数 nper 填 0',
      reason: '没有期数就无从迭代求解利率。',
      fix: 'nper 必须是正整数（总还款期数）。',
      level: 'low',
      errorCode: '#NUM!',
    },
  ],
  related: [
    {
      id: 'pmt',
      kind: 'companion',
      why: '反过来：已知利率算每月还多少用 PMT，RATE 是反推利率。',
    },
    {
      id: 'nper',
      kind: 'companion',
      why: '相邻：已知利率和每期还款，算要还多少期用 NPER。',
    },
    {
      id: 'pv',
      kind: 'companion',
      why: '相邻：已知利率和每期还款，算现在值多少用 PV。',
    },
    {
      id: 'fv',
      kind: 'companion',
      why: '相邻：已知利率和每期还款，算到期总额用 FV。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'nper', label: '期数', type: 'number', default: '60', hint: '总还款期数，需 > 0' },
      { key: 'pmt', label: '每期付款', type: 'number', default: '-1100', hint: '每期支出填负数' },
      { key: 'pv', label: '现值', type: 'number', default: '50000', hint: '本金填正数' },
      { key: 'fv', label: '未来值', type: 'number', default: '0', hint: '留空=0' },
      {
        key: 'type',
        label: '付款类型',
        type: 'select',
        default: '0',
        options: [
          { value: '0', label: '期末（默认）' },
          { value: '1', label: '期初' },
        ],
      },
      { key: 'guess', label: '预估值', type: 'number', default: '0.1', hint: '迭代初值，默认 0.1' },
    ],
    template: '=RATE({nper},{pmt},{pv},{fv},{type},{guess})',
    cases: [
      {
        label: '5 万、月还 1100、60 期 → 真实月利率',
        type: 'ok',
        values: { nper: '60', pmt: '-1100', pv: '50000', fv: '0', type: '0', guess: '0.1' },
        expect: '0.009596',
        note: '牛顿迭代收敛到约 0.49% 的月利率（每期利率）。',
      },
      {
        label: '期数 nper=0 → #NUM!',
        type: 'error',
        values: { nper: '0', pmt: '-1100', pv: '50000', fv: '0', type: '0', guess: '0.1' },
        expect: '#NUM!',
        note: '期数必须 > 0 才能迭代。',
      },
      {
        label: 'pmt 与 pv 同号（都负）→ #NUM!',
        type: 'error',
        values: { nper: '60', pmt: '-1100', pv: '-50000', fv: '0', type: '0', guess: '0.1' },
        expect: '#NUM!',
        note: '现金无方向，方程无解，迭代不收敛。',
      },
      {
        label: '期数填非数字 → #VALUE!',
        type: 'error',
        values: { nper: 'abc', pmt: '-1100', pv: '50000', fv: '0', type: '0', guess: '0.1' },
        expect: '#VALUE!',
        note: 'nper 必须是数字。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================== NPER 期数 ============================== */

const NPER_PARAM_TSV = '参数\t数值\n每期利率\t0.003333\n每期存入\t-1000\n目标金额\t100000';

const nper: FunctionEntry = {
  id: 'nper',
  enName: 'NPER',
  zhName: '期数',
  zhCommon: ['还款期数', '攒钱期数', '还清年数'],
  alias: ['期数计算', '还多少期', '存款月数'],
  category: 'financial',
  abbr: 'qs',
  pinyin: 'qishu',
  keywords: ['期数计算', '还款期数', '攒钱多久', '还清时间', '存款月数', '投资期限', '回本周期'],
  difficulty: 4,
  usageLevel: 28,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '结果通常是小数（如 94.7 期），实际业务要向上取整 CEILING 成整数期。',
  },
  oneLiner: '算要还多少期才能还清',
  summary:
    '「每月存 1000、年利率 4%，想攒到 10 万要存几个月？」「每月还 3000，还要还多少期才能结清？」给它利率、每期收支和目标值，NPER 算出需要的期数。结果常带小数，落地时记得用 CEILING 向上取整成整期。',
  syntax: {
    patternCn: '=NPER(利率, 每期付款, 现值, [未来值], [付款类型])',
    patternEn: '=NPER(rate, pmt, pv, [fv], [type])',
    args: [
      {
        key: 'rate',
        zh: '利率',
        en: 'rate',
        required: true,
        desc: '每期利率。',
        accepts: '年利率÷12（按月）· 引用写了「4%」的单元格再 /12。',
        tip: '【最常填错】填「每期利率」，不是年利率。',
        example: '0.04/12',
        pitfallRank: 1,
      },
      {
        key: 'pmt',
        zh: '每期付款',
        en: 'pmt',
        required: true,
        desc: '每期收支（存钱为负、取钱为正，看现金流方向）。',
        accepts: '负数（你每月存/付）· 正数（你每月收）。',
        tip: '攒钱场景每期是「付出」，填负数；与 pv/fv 方向配套。',
        example: '-1000',
        pitfallRank: 2,
      },
      {
        key: 'pv',
        zh: '现值',
        en: 'pv',
        required: true,
        desc: '现在的起点金额（通常为 0；若是还债则填剩余本金正数）。',
        accepts: '0（从零开始攒）· 正数（还欠的本金）。',
        example: '0',
        pitfallRank: 3,
      },
      {
        key: 'fv',
        zh: '未来值',
        en: 'fv',
        required: false,
        desc: '目标总额（想攒到/还清到的金额）。',
        accepts: '正数（目标金额，如 100000）。',
        ifOmitted: '省略等于 0，即「还到不欠」为止。',
        tip: '攒钱目标填正数（你最终要拿到手）。',
        example: '100000',
      },
      {
        key: 'type',
        zh: '付款类型',
        en: 'type',
        required: false,
        desc: '0 = 期末（默认）；1 = 期初。',
        accepts: '0 / 1。',
        ifOmitted: '省略按 0（期末）。',
        example: '0',
      },
    ],
  },
  returnValue: '返回需要的期数（常为小数）；落地时向上取整成整数期。',
  examples: [
    {
      title: '示例 1：每月存 1000、年利率 4%，攒到 10 万要几个月',
      scene: '定投计划：每月工资日存 1000，年化 4%，想知道多久能攒够 10 万。',
      dataTsv: NPER_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=NPER(B2, B3, B4, B5)',
      result: '约 94.7 个月（B2 月利率≈0.003333，B3=-1000 每月存为负，B4=0 起点，B5=100000 目标）',
      explanation: '每期存钱是你「付出」，pmt 填负；目标 10 万是未来拿到手，fv 填正。结果 94.7 期≈7年11个月。',
    },
    {
      title: '示例 2：把小数期数向上取整成整月',
      scene: '94.7 个月没法执行，要存满 95 个月才稳够 10 万。',
      dataTsv: NPER_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=CEILING(NPER(B2, B3, B4, B5), 1)',
      result: '95 个月',
      explanation: 'NPER 返回的是数学上的小数期数；用 CEILING(...,1) 向上取整成整数月，确保目标金额一定达成。',
    },
  ],
  pitfalls: [
    {
      title: 'rate 又填成年利率了',
      reason: 'NPER 的 rate 是每期利率。填 4% 当 rate，等于按 4% 的「每期」在算，月数少算十几倍。',
      fix: '按月存就写 0.04/12；与 pmt 单位一致。',
      level: 'high',
    },
    {
      title: '忘了把结果向上取整，按 94.7 期执行会差一点',
      reason: 'NPER 是连续数学解，带小数；少存那 0.3 期，目标金额会差几百块没攒满。',
      fix: '外包 CEILING(...,1) 取整数期；或用 ROUNDUP。',
      level: 'high',
    },
    {
      title: 'pmt 与 fv 符号同向导致结果异常或 #NUM!',
      reason: '现金流方向要自洽：每月存钱（付出）为负，目标金额（拿到手）为正。两个都正或两个都负，方程无解。',
      fix: '攒钱：pmt 负、fv 正；还债：pv 正、pmt 负。',
      level: 'mid',
      errorCode: '#NUM!',
    },
    {
      title: 'rate 填 0 且 pmt 也为 0 → #DIV/0!',
      reason: '利率和每期收支都为 0，没有增长也没有投入，无法算出期数。',
      fix: '至少保证 rate 或 pmt 其一非 0。',
      level: 'low',
      errorCode: '#DIV/0!',
    },
  ],
  related: [
    {
      id: 'pmt',
      kind: 'companion',
      why: '反过来：已知期数算每期还多少用 PMT。',
    },
    {
      id: 'rate',
      kind: 'companion',
      why: '相邻：已知每期还款和期数，反推利率用 RATE。',
    },
    {
      id: 'fv',
      kind: 'companion',
      why: '相邻：已知利率和期数，算到期总额用 FV。',
    },
    {
      id: 'pv',
      kind: 'companion',
      why: '相邻：已知利率和期数，算现在值多少用 PV。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.003333', hint: '每期利率' },
      { key: 'pmt', label: '每期付款', type: 'number', default: '-1000', hint: '每月存/付填负数' },
      { key: 'pv', label: '现值', type: 'number', default: '0', hint: '起点金额，通常 0' },
      { key: 'fv', label: '未来值', type: 'number', default: '100000', hint: '目标金额' },
      {
        key: 'type',
        label: '付款类型',
        type: 'select',
        default: '0',
        options: [
          { value: '0', label: '期末（默认）' },
          { value: '1', label: '期初' },
        ],
      },
    ],
    template: '=NPER({rate},{pmt},{pv},{fv},{type})',
    cases: [
      {
        label: '零利率：攒 10000、每月存 1000 → 10 期',
        type: 'ok',
        values: { rate: '0', pmt: '-1000', pv: '0', fv: '10000', type: '0' },
        expect: '10',
        note: 'rate=0 走简化式：-(pv+fv)/pmt = -(10000)/(-1000) = 10。',
      },
      {
        label: '月利 10%、pmt=1、pv=0、fv=1 → 约 7.27 期',
        type: 'ok',
        values: { rate: '0.1', pmt: '1', pv: '0', fv: '1', type: '0' },
        expect: '7.272541',
        note: 'rate≠0 标准式取对数：log(2)/log(1.1) ≈ 7.272541。',
      },
      {
        label: '利率与每期付款都为 0 → #DIV/0!',
        type: 'error',
        values: { rate: '0', pmt: '0', pv: '0', fv: '10000', type: '0' },
        expect: '#DIV/0!',
        note: 'rate=0 且 pmt=0 同时成立，分母为 0。',
      },
      {
        label: '对数域非正（fv+pmt*t 与分母异号）→ #NUM!',
        type: 'error',
        values: { rate: '0.1', pmt: '1', pv: '0', fv: '-2', type: '0' },
        expect: '#NUM!',
        note: '比值 ≤ 0，无法取对数，期数无解。',
      },
      {
        label: '利率填非数字 → #VALUE!',
        type: 'error',
        values: { rate: 'abc', pmt: '-1000', pv: '0', fv: '10000', type: '0' },
        expect: '#VALUE!',
        note: 'rate 必须是数字。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================== PV 现值 ============================== */

const PV_PARAM_TSV = '参数\t数值\n每期利率\t0.00375\n还款期数\t360\n每月还款\t-3000';

const pv: FunctionEntry = {
  id: 'pv',
  enName: 'PV',
  zhName: '现值',
  zhCommon: ['现在值多少', '贷款额度', '本金现值'],
  alias: ['现值计算', '最多能贷', '当前价值'],
  category: 'financial',
  abbr: 'xz',
  pinyin: 'xianzhi',
  keywords: ['现值计算', '现在值多少', '贷款额度', '最多能贷', '年金现值', '贴现', '本金测算'],
  difficulty: 4,
  usageLevel: 32,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '「未来的一笔钱，今天值多少」就叫贴现。pmt 通常为负（你每期付出），PV 返回的正数是你当前能拿到的价值。',
  },
  oneLiner: '未来的一笔钱，今天值多少',
  summary:
    '「每月能还 3000、年利率 4.5%、还 30 年，现在银行最多肯贷我多少？」给它利率、期数和每期还款，PV 算出这笔未来现金流「今天」的价值（也就是你能贷到的本金）。本质是贴现：把未来的钱折算成现在的购买力。',
  syntax: {
    patternCn: '=PV(利率, 期数, 每期付款, [未来值], [付款类型])',
    patternEn: '=PV(rate, nper, pmt, [fv], [type])',
    args: [
      {
        key: 'rate',
        zh: '利率',
        en: 'rate',
        required: true,
        desc: '每期利率。',
        accepts: '年利率÷12（按月）· 引用利率单元格。',
        tip: '【最常填错】填「每期利率」，不是年利率。',
        example: '0.045/12',
        pitfallRank: 1,
      },
      {
        key: 'nper',
        zh: '期数',
        en: 'nper',
        required: true,
        desc: '总期数。',
        accepts: '月数（如 360）· 年数×12。',
        tip: '与 rate 同单位：月利率配月数。',
        example: '360',
        pitfallRank: 2,
      },
      {
        key: 'pmt',
        zh: '每期付款',
        en: 'pmt',
        required: true,
        desc: '每期收支（还款为负、收租为正）。',
        accepts: '负数（如 -3000，你每月付出）。',
        tip: '你每月还款是「付出」，填负数；PV 因此返回正数（你拿到手的本金）。',
        example: '-3000',
        pitfallRank: 3,
      },
      {
        key: 'fv',
        zh: '未来值',
        en: 'fv',
        required: false,
        desc: '期末还想剩的钱，一般 0。',
        ifOmitted: '省略等于 0。',
        example: '0',
      },
      {
        key: 'type',
        zh: '付款类型',
        en: 'type',
        required: false,
        desc: '0 = 期末（默认）；1 = 期初。',
        accepts: '0 / 1。',
        ifOmitted: '省略按 0（期末）。',
        example: '0',
      },
    ],
  },
  returnValue: '返回现值（正数，代表你当前能拿到的本金价值）。',
  examples: [
    {
      title: '示例 1：月还 3000、年利率 4.5%、30 年，最多能贷多少',
      scene: '房贷预审：每月还款能力 3000，想看按当前利率 30 年期能贷到多少本金。',
      dataTsv: PV_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=-PV(B2, B3, B4)',
      result: '约 590,819 元（B2 月利率≈0.00375，B3=360 期，B4=-3000 每月还款为负）',
      explanation: 'PV 本身返回的现值是正数（你拿到的本金）；公式里 pmt 填负，所以结果直接就是正数，可不套负号。',
    },
    {
      title: '示例 2：纯数值速算一笔年金的现值',
      scene: '不拉表，直接看「月利率 1%、存 60 期、每期 500」现在值多少。',
      dataTsv: PV_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=PV(0.01, 60, -500)',
      result: '约 22,477 元',
      explanation: '0.01 是每期利率、60 是期数、-500 是你每期付出；PV 把未来 60 笔 500 贴现成今天约 2.25 万。',
    },
  ],
  pitfalls: [
    {
      title: 'rate 用成年利率，现值差出十几倍',
      reason: 'PV 的 rate 是每期利率。4.5% 直接当 rate，等于按年化当「每期」在贴现。',
      fix: '按月还写 0.045/12；与 nper 单位一致。',
      level: 'high',
    },
    {
      title: 'pmt 符号与预期相反，现值变负',
      reason: '每期还款是你「付出」，pmt 应为负；若填正，PV 会返回负数（代表你反方向的价值），容易被当成算错。',
      fix: '还款/存钱填负；想显示正现值用 -PV(...) 或保持 pmt 为负。',
      level: 'high',
    },
    {
      title: 'rate 与 nper 单位不一致',
      reason: '月利率必须配月数、年利率配年数，否则贴现期数错乱。',
      fix: '统一时间单位。',
      level: 'mid',
    },
    {
      title: 'rate 为 0 时结果退化为 pmt×nper',
      reason: '零利率没有贴现，PV 直接等于每期金额×期数，可能让你误以为公式没生效。',
      fix: '这是正确行为；确认利率单元格是否真的为 0。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'pmt',
      kind: 'companion',
      why: '反过来：已知现值和利率，算每期还多少用 PMT。',
    },
    {
      id: 'fv',
      kind: 'companion',
      why: '方向相反：PV 是未来折到现在，FV 是现在滚到未来。',
    },
    {
      id: 'rate',
      kind: 'companion',
      why: '相邻：已知现值和每期还款，反推利率用 RATE。',
    },
    {
      id: 'nper',
      kind: 'companion',
      why: '相邻：已知现值和每期还款，算要多少期用 NPER。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.05', hint: '每期利率' },
      { key: 'nper', label: '期数', type: 'number', default: '240', hint: '总期数' },
      { key: 'pmt', label: '每期付款', type: 'number', default: '-3000', hint: '每期付出填负数' },
      { key: 'fv', label: '未来值', type: 'number', default: '0', hint: '留空=0' },
      {
        key: 'type',
        label: '付款类型',
        type: 'select',
        default: '0',
        options: [
          { value: '0', label: '期末（默认）' },
          { value: '1', label: '期初' },
        ],
      },
    ],
    template: '=PV({rate},{nper},{pmt},{fv},{type})',
    cases: [
      {
        label: '零利率：12 期、每期付 100 → 现值 1200',
        type: 'ok',
        values: { rate: '0', nper: '12', pmt: '-100', fv: '0', type: '0' },
        expect: '1200',
        note: 'rate=0 走简化式：-(fv+pmt*nper) = -(-1200) = 1200（正数本金）。',
      },
      {
        label: '月利 1%、60 期、每期 500 → 现值',
        type: 'ok',
        values: { rate: '0.01', nper: '60', pmt: '-500', fv: '0', type: '0' },
        expect: '22477.519203',
        note: '标准 PV 贴现公式。',
      },
      {
        label: '利率与期数都为 0 → #DIV/0!',
        type: 'error',
        values: { rate: '0', nper: '0', pmt: '-3000', fv: '0', type: '0' },
        expect: '#DIV/0!',
        note: 'rate=0 且 nper=0 同时成立，分母为 0。',
      },
      {
        label: '利率填非数字 → #VALUE!',
        type: 'error',
        values: { rate: 'abc', nper: '240', pmt: '-3000', fv: '0', type: '0' },
        expect: '#VALUE!',
        note: 'rate 必须是数字。',
      },
      {
        label: '每期付款填非数字 → #VALUE!',
        type: 'error',
        values: { rate: '0.05', nper: '240', pmt: 'xyz', fv: '0', type: '0' },
        expect: '#VALUE!',
        note: 'pmt 必须是数字。',
      },
    ],
  },
  meta: {
    updatedAt: '2026-08-30',
    status: 'published',
    customEdited: false,
  },
};

/* ============================== FV 终值 ============================== */

const FV_PARAM_TSV = '参数\t数值\n每期利率\t0.0025\n存款期数\t120\n每月存入\t-1000';

const fv: FunctionEntry = {
  id: 'fv',
  enName: 'FV',
  zhName: '终值',
  zhCommon: ['到期金额', '存款总额', '攒钱结果'],
  alias: ['终值计算', '到期总额', '本息和'],
  category: 'financial',
  abbr: 'zz',
  pinyin: 'zhongzhi',
  keywords: ['终值计算', '到期金额', '存款总额', '定投收益', '本息和', '复利终值', '攒钱结果'],
  difficulty: 4,
  usageLevel: 30,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: '「现在每月存、未来到期有多少」就是它。pmt 填负（你每月付出），FV 返回的正数是到期你拿到手的总额。',
  },
  oneLiner: '每期存一笔，到期后有多少钱',
  summary:
    '「每月工资日存 1000、年利率 3%、存 10 年，到期连本带利有多少？」给它利率、期数和每期存款，FV 算出到期时的总金额（含复利）。和 PV 一对反函数：PV 是未来折到现在，FV 是现在滚到未来。',
  syntax: {
    patternCn: '=FV(利率, 期数, 每期付款, [现值], [付款类型])',
    patternEn: '=FV(rate, nper, pmt, [pv], [type])',
    args: [
      {
        key: 'rate',
        zh: '利率',
        en: 'rate',
        required: true,
        desc: '每期利率。',
        accepts: '年利率÷12（按月）· 引用利率单元格。',
        tip: '【最常填错】填「每期利率」，不是年利率。',
        example: '0.03/12',
        pitfallRank: 1,
      },
      {
        key: 'nper',
        zh: '期数',
        en: 'nper',
        required: true,
        desc: '总存款期数。',
        accepts: '月数（如 120）· 年数×12。',
        tip: '与 rate 同单位：月利率配月数。',
        example: '120',
        pitfallRank: 2,
      },
      {
        key: 'pmt',
        zh: '每期付款',
        en: 'pmt',
        required: true,
        desc: '每期存入（你付出，填负数）。',
        accepts: '负数（如 -1000）。',
        tip: '每月存钱是「付出」，填负数；FV 因此返回正数（到期拿到手）。',
        example: '-1000',
        pitfallRank: 3,
      },
      {
        key: 'pv',
        zh: '现值',
        en: 'pv',
        required: false,
        desc: '一开始就已经有的本金（可选）。',
        ifOmitted: '省略等于 0，即从零开始存。',
        tip: '开户时已有本金就填这里（正数）。',
        example: '0',
      },
      {
        key: 'type',
        zh: '付款类型',
        en: 'type',
        required: false,
        desc: '0 = 期末（默认）；1 = 期初。',
        accepts: '0 / 1。',
        ifOmitted: '省略按 0（期末）。',
        example: '0',
      },
    ],
  },
  returnValue: '返回到期总额（正数，含复利）。',
  examples: [
    {
      title: '示例 1：月存 1000、年利率 3%、10 年，到期多少',
      scene: '定投 10 年（120 个月），每月存 1000，年化 3%，看到期连本带利。',
      dataTsv: FV_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=-FV(B2, B3, B4)',
      result: '约 139,741 元（B2 月利率 0.0025，B3=120 期，B4=-1000 每月存为负）',
      explanation: 'pmt 填负（你每月付出），FV 返回正数总额；前面套负号纯为显示正数。本金 12 万 + 利息约 1.97 万。',
    },
    {
      title: '示例 2：带上初始本金（pv）一起滚',
      scene: '开户时已经存了 2 万，再每月存 1000，同样 10 年，到期多少。',
      dataTsv: FV_PARAM_TSV,
      dataAnchor: 'A1',
      formula: '=-FV(B2, B3, B4, 20000)',
      result: '约 166,546 元（初始 2 万也参与复利）',
      explanation: '第 4 个参数 pv 填已有的 20000（正数），它和每月存款一起按利率滚到到期。',
    },
  ],
  pitfalls: [
    {
      title: 'rate 用成年利率，终值虚高十几倍',
      reason: 'FV 的 rate 是每期利率。3% 直接当 rate，复利按「每期 3%」滚，结果严重夸大。',
      fix: '按月存写 0.03/12；与 nper 单位一致。',
      level: 'high',
    },
    {
      title: 'pmt 填正，终值变负',
      reason: '每月存钱是你「付出」，pmt 应为负；填正会让 FV 返回负数，像算错了。',
      fix: '存款/还款填负；或直接 -FV(...) 翻正显示。',
      level: 'high',
    },
    {
      title: 'rate 与 nper 单位不一致',
      reason: '月利率配月数、年利率配年数，混用会让计息期数错乱。',
      fix: '统一时间单位。',
      level: 'mid',
    },
    {
      title: '忽视 type，期初存款的终值被算少',
      reason: '月初就存款（期初）比月末多计息一期；默认 type=0 会低估收益。',
      fix: '月初扣款的业务把 type 填 1。',
      level: 'low',
    },
  ],
  related: [
    {
      id: 'pv',
      kind: 'companion',
      why: '反函数：PV 把未来折到现在，FV 把现在滚到未来。',
    },
    {
      id: 'pmt',
      kind: 'companion',
      why: '相邻：已知现值和利率，算每期存多少用 PMT。',
    },
    {
      id: 'rate',
      kind: 'companion',
      why: '相邻：已知每期存款和期数，反推利率用 RATE。',
    },
    {
      id: 'nper',
      kind: 'companion',
      why: '相邻：已知利率和每期存款，算要存多少期用 NPER。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'rate', label: '利率', type: 'number', default: '0.0025', hint: '每期利率' },
      { key: 'nper', label: '期数', type: 'number', default: '120', hint: '总存款期数' },
      { key: 'pmt', label: '每期付款', type: 'number', default: '-1000', hint: '每期存入填负数' },
      { key: 'pv', label: '现值', type: 'number', default: '0', hint: '已有本金，留空=0' },
      {
        key: 'type',
        label: '付款类型',
        type: 'select',
        default: '0',
        options: [
          { value: '0', label: '期末（默认）' },
          { value: '1', label: '期初' },
        ],
      },
    ],
    template: '=FV({rate},{nper},{pmt},{pv},{type})',
    cases: [
      {
        label: '零利率：12 期、每期存 100 → 终值 1200',
        type: 'ok',
        values: { rate: '0', nper: '12', pmt: '-100', pv: '0', type: '0' },
        expect: '1200',
        note: 'rate=0 走简化式：-(pv+pmt*nper) = -(-1200) = 1200（正数总额）。',
      },
      {
        label: '月利 1%、60 期、每期 500 → 终值',
        type: 'ok',
        values: { rate: '0.01', nper: '60', pmt: '-500', pv: '0', type: '0' },
        expect: '40834.834928',
        note: '标准 FV 复利公式。',
      },
      {
        label: '利率与期数都为 0 → #DIV/0!',
        type: 'error',
        values: { rate: '0', nper: '0', pmt: '-1000', pv: '0', type: '0' },
        expect: '#DIV/0!',
        note: 'rate=0 且 nper=0 同时成立，分母为 0。',
      },
      {
        label: '利率填非数字 → #VALUE!',
        type: 'error',
        values: { rate: 'abc', nper: '120', pmt: '-1000', pv: '0', type: '0' },
        expect: '#VALUE!',
        note: 'rate 必须是数字。',
      },
      {
        label: '每期付款填非数字 → #VALUE!',
        type: 'error',
        values: { rate: '0.0025', nper: '120', pmt: 'xyz', pv: '0', type: '0' },
        expect: '#VALUE!',
        note: 'pmt 必须是数字。',
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
  pmt,
  rate,
  nper,
  pv,
  fv,
  fvschedule: fvscheduleEntry,
  npv: npvEntry,
  xnpv: xnpvEntry,
  ppmt: ppmtEntry,
  ipmt: ipmtEntry,
  cumipmt: cumipmtEntry,
  cumprinc: cumprincEntry,
  effect: effectEntry,
  nominal: nominalEntry,
  sln: slnEntry,
  syd: sydEntry,
  db: dbEntry,
  ddb: ddbEntry,
  vdb: vdbEntry,
  amorlinc: amorlincEntry,
  amordegrc: amordegrcEntry,
  accrint: accrintEntry,
  accrintm: accrintmEntry,
  disc: discEntry,
  duration: durationEntry,
  mduration: mdurationEntry,
  intrate: intrateEntry,
  oddfprice: oddfpriceEntry,
  oddfyield: oddfyieldEntry,
  oddlprice: oddlpriceEntry,
  oddlyield: oddlyieldEntry,
  price: priceEntry,
  pricedisc: pricediscEntry,
  pricemat: pricematEntry,
  received: receivedEntry,
  tbilleq: tbilleqEntry,
  tbillprice: tbillpriceEntry,
  tbillyield: tbillyieldEntry,
  yield: yieldEntry,
  yielddisc: yielddiscEntry,
  yieldmat: yieldmatEntry,
  coupdaybs: coupdaybsEntry,
  coupdays: coupdaysEntry,
  coupdaysnc: coupdaysncEntry,
  coupncd: coupncdEntry,
  coupnum: coupnumEntry,
  couppcd: couppcdEntry,
  rri: rriEntry,
  pduration: pdurationEntry,
  xirr: xirrEntry,
  irr: irrEntry,
  mirr: mirrEntry,
  dollarde: dollardeEntry,
  dollarfr: dollarfrEntry,
  euroconvert: euroconvertEntry,
  ispmt: ispmtEntry,
};

export default pack;
