import type { FunctionEntry } from '@/types';

// B6 批次：日期/时间类剩余 17 个函数，内容从 samples 导入（calc 关闭，与 B1–B5 一致）
import datevalueEntry from '@/data/samples/datevalue';
import timeEntry from '@/data/samples/time';
import timevalueEntry from '@/data/samples/timevalue';
import hourEntry from '@/data/samples/hour';
import minuteEntry from '@/data/samples/minute';
import secondEntry from '@/data/samples/second';
import weekdayEntry from '@/data/samples/weekday';
import weeknumEntry from '@/data/samples/weeknum';
import isoweeknumEntry from '@/data/samples/isoweeknum';
import eomonthEntry from '@/data/samples/eomonth';
import yearfracEntry from '@/data/samples/yearfrac';
import daysEntry from '@/data/samples/days';
import days360Entry from '@/data/samples/days360';
import networkdaysEntry from '@/data/samples/networkdays';
import networkdaysIntlEntry from '@/data/samples/networkdays-intl';
import workdayEntry from '@/data/samples/workday';
import workdayIntlEntry from '@/data/samples/workday-intl';

/**
 * 日期与时间类 8 条（第一版占位已全部补齐为完整内容）
 * 写作口径：对齐 samples/if.ts 的深度、结构与语气。
 *
 * 要点：
 * - Excel 的日期本质是「序列号」（1900-01-01 = 1），TODAY/NOW/DATE 都返回真日期。
 * - 文本写成的 "2024-1-1" 不是真日期，不能直接比较、不能参与计算，否则静默出错。
 * - DATEDIF 是隐藏函数：全版本可用，但函数列表搜不到、没有智能提示。
 * - EDATE 自 Excel 2007 起提供。
 */

/** 截止日小表：用于演示 TODAY 倒计时 / 过期判断 */
const DEADLINE_TSV = '任务\t截止日\n提交周报\t2026-09-10\n项目交付\t2026-12-31';

/** 开始时间小表：用于演示 NOW 的耗时计算 */
const TIMESTAMP_TSV = '任务\t开始时间\n录入订单\t2026-08-29 09:00';

/** 年月日三列小表：用于演示 DATE 用单元格拼接 */
const YMD_TSV = '年\t月\t日\n2024\t3\t15';

/** 入职日期小表：用于演示 YEAR / MONTH / DAY 取分量 */
const HIRE_TSV = '姓名\t入职日期\n张三\t2021-03-15\n李四\t2019-07-01';

/** 生日 / 今天小表：用于演示 DATEDIF 算年龄 */
const BIRTH_TSV = '事项\t日期\n出生\t1990-05-20\n截止日\t2026-08-30';

/** 签约日小表：用于演示 EDATE 推月份 */
const SIGN_TSV = '姓名\t签约日\n甲公司\t2024-01-15';

const pack: Record<string, FunctionEntry> = {
  /* =======================================================================
   * 1. TODAY —— 今天
   * ===================================================================== */
  today: {
    id: 'today',
    enName: 'TODAY',
    zhName: '今天',
    zhCommon: ['今天日期', '当前日期', '当天'],
    alias: ['系统日期', '今日', '自动日期'],
    category: 'datetime',
    abbr: 'jt',
    pinyin: 'jintian',
    keywords: ['今天的日期', '当前日期', '自动更新日期', '动态日期', '日期戳', '截止今天'],
    difficulty: 1,
    usageLevel: 75,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes:
        'TODAY 是「易失函数」，每次工作簿重算或重新打开都会刷新成当天。想把日期固定下来，要「复制 → 右键粘贴为值」。',
    },
    oneLiner: '返回今天的日期，每次打开自动更新',
    summary:
      '做「截止今天还有几天」「是否已过期」这类看板时第一个想到的就是它。TODAY() 不填任何参数，返回的是真正的日期（序列号），所以可以跟别的日期直接相减得到天数差。注意它每次打开都会变，不是写死的某一天。',
    syntax: {
      patternCn: '=TODAY()',
      patternEn: '=TODAY()',
      args: [],
    },
    returnValue: '返回当前系统日期（序列号，当天 0 点，小数部分为 0）。',
    examples: [
      {
        title: '示例 1：在单元格里显示今天的日期',
        scene: '做日报、周报时，想在表头自动印上当天的日期，不用每天手改。',
        dataTsv: DEADLINE_TSV,
        dataAnchor: 'A1',
        formula: '=TODAY()',
        result: '返回当前系统日期，例如 2026-08-30。',
        explanation: 'TODAY() 不需要参数，直接回车即得今天。它返回的是真日期，能参与后续计算。',
      },
      {
        title: '示例 2：算距离截止日还有几天',
        scene: '周报 9 月 10 日要交，想知道还剩多少天提醒自己。',
        dataTsv: DEADLINE_TSV,
        dataAnchor: 'A1',
        formula: '=B2-TODAY()',
        result: '若今天是 2026-08-30，则 C2（周报那行）返回 11，表示还剩 11 天。',
        explanation: '两个真日期相减，得到相差的天数（整数）。把公式下拉可同时看多个任务的剩余天数。',
      },
      {
        title: '示例 3：判断是否已过期',
        scene: '项目交付日还没到就标「进行中」，过了就标「已过期」。',
        dataTsv: DEADLINE_TSV,
        dataAnchor: 'A1',
        formula: '=IF(B2<TODAY(),"已过期","进行中")',
        result: '今天 2026-08-30 时，两个任务都还没到截止日，返回「进行中」。',
        explanation: '用 TODAY() 当基准和截止日比较；注意比较两边必须都是真日期。',
      },
    ],
    pitfalls: [
      {
        title: '拿文本日期和 TODAY() 比大小，结果永远不对',
        reason:
          '写成 =TODAY()>"2024-1-1" 时，Excel 把右边的 "2024-1-1" 当成文本。文本和数字比较结果不可信（通常恒为 FALSE），不会报错但答案错得离谱。',
        fix: '要用真正的日期：=TODAY()>DATE(2024,1,1)，或引用一个存着真日期的单元格。',
        level: 'high',
      },
      {
        title: '以为 TODAY() 是固定日期，结果每次打开都变',
        reason: 'TODAY 是易失函数，重算、打开、甚至切换单元格都可能刷新成当天，不是你第一次写的那天。',
        fix: '要锁定某天：选中单元格 → 复制 → 右键「粘贴为值」，把公式变成写死的日期。',
        level: 'mid',
      },
      {
        title: '给 TODAY 加了参数，例如 =TODAY(2026)',
        reason: 'TODAY 不接受任何参数，多写参数 Excel 解析不了。',
        fix: '老老实实写 =TODAY()，年份想指定就用 DATE(2026,1,1)。',
        level: 'low',
        errorCode: '#VALUE!',
      },
      {
        title: '直接拼接文字，日期变成一串数字',
        reason: '日期本质是序列号（如 45218），=TODAY()&" 是今天" 会把数字原样拼出来，难看且不是你要的格式。',
        fix: '用 TEXT 包一层：=TEXT(TODAY(),"yyyy-mm-dd")&" 是今天"，显示成「2026-08-30 是今天」。',
        level: 'mid',
      },
    ],
    related: [
      {
        id: 'now',
        kind: 'companion',
        why: '同时需要「几时几分」就用 NOW，它比 TODAY 多了时间部分。',
      },
      {
        id: 'date',
        kind: 'companion',
        why: '要的是一个固定的某天（而不是今天），用 DATE 把年月日拼出来。',
      },
      {
        id: 'year',
        kind: 'companion',
        why: '想从今天取「年份」做统计，写 YEAR(TODAY())。',
      },
      {
        id: 'edate',
        kind: 'companion',
        why: '要以今天为基准往后推几个月（如会员到期），用 EDATE(TODAY(),n)。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [],
      template: '=TODAY()',
      cases: [
        {
          label: '今天日期（易失，断言跳过）',
          type: 'ok',
          values: {},
          expect: '2026-08-30',
          note: '易失函数，每次打开或重算都会刷新成当天，通用验收会跳过它的精确断言。',
        },
        {
          label: '说明：与固定日期相减得天数差',
          type: 'ok',
          values: {},
          expect: '2026-08-30',
          note: 'TODAY() 返回的是真日期（序列号），可直接与别的日期相减得到整数天数。',
        },
        {
          label: '说明：配合 EDATE 推到期日',
          type: 'ok',
          values: {},
          expect: '2026-08-30',
          note: 'EDATE(TODAY(),12) 可按今天推算一年后的到期日。',
        },
        {
          label: '说明：TEXT 格式化后即为文本',
          type: 'ok',
          values: {},
          expect: '2026-08-30',
          note: 'TEXT(TODAY(),"yyyy-mm-dd") 返回文本，不能再直接参与日期运算。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 2. NOW —— 现在
   * ===================================================================== */
  now: {
    id: 'now',
    enName: 'NOW',
    zhName: '现在',
    zhCommon: ['现在时间', '当前时间', '此刻日期时间'],
    alias: ['系统时间', '当前日期时间', '当下的时间'],
    category: 'datetime',
    abbr: 'xz',
    pinyin: 'xianzai',
    keywords: ['当前日期和时间', '系统时间', '包含时分秒', '时间戳', '动态时间', '现在时刻'],
    difficulty: 1,
    usageLevel: 62,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes:
        'NOW 与 TODAY 一样是易失函数，每次重算/打开都会刷新成此刻；想固定就要「粘贴为值」。',
    },
    oneLiner: '返回此刻的日期和时间',
    summary:
      'NOW() 返回当前日期 + 时间（整数部分是日期、小数部分是一天里的进度，0.5 即中午 12 点）。用来记录「录入时刻」「算任务耗时」最方便。它和 TODAY 的区别仅在于带不带时间：TODAY 时间部分恒为 0。',
    syntax: {
      patternCn: '=NOW()',
      patternEn: '=NOW()',
      args: [],
    },
    returnValue: '返回当前日期和时间（序列号，小数部分代表当天的时间占比）。',
    examples: [
      {
        title: '示例 1：显示此刻的完整日期时间',
        scene: '想在看板里实时显示「现在是什么时候」。',
        dataTsv: TIMESTAMP_TSV,
        dataAnchor: 'A1',
        formula: '=NOW()',
        result: '返回当前时刻，例如 2026-08-30 11:42:05。',
        explanation: 'NOW() 无参数，直接回车即得此刻；它返回的是带时间的小数日期。',
      },
      {
        title: '示例 2：算一笔订单录了多久',
        scene: '订单 08-29 09:00 录入，想知道到现在过了多少小时。',
        dataTsv: TIMESTAMP_TSV,
        dataAnchor: 'A1',
        formula: '=NOW()-B2',
        result: '若现在是 2026-08-30 11:42，则 C2 返回约 1.11（天），即约 26.6 小时。',
        explanation: '两个带时间的日期相减，得到小数天数，再乘 24 就是小时数：=(NOW()-B2)*24。',
      },
      {
        title: '示例 3：把此刻格式化成好看的中文',
        scene: '默认的 NOW 显示样式不直观，想固定成「年-月-日 时:分:秒」。',
        dataTsv: TIMESTAMP_TSV,
        dataAnchor: 'A1',
        formula: '=TEXT(NOW(),"yyyy-mm-dd hh:mm:ss")',
        result: '例如返回文本「2026-08-30 11:42:05」。',
        explanation: 'TEXT 把日期按指定代码格式化；注意结果变成文本，不能直接再相减。',
      },
    ],
    pitfalls: [
      {
        title: '拿文本时间和 NOW() 比较，结果不可信',
        reason: '=NOW()>"2024-1-1 9:00" 里右边是文本，文本与数字比较恒为 FALSE，不会报错但答案错。',
        fix: '用真日期/时间：=NOW()>DATE(2024,1,1)+TIME(9,0,0)，或引用存着真时间的单元格。',
        level: 'high',
      },
      {
        title: 'NOW 含时间，相减得到小数天数，直接当「小时」会差 24 倍',
        reason: '日期差的单位是「天」，1 天 = 1.0，不是 1 小时。',
        fix: '要小时就乘 24：=(NOW()-B2)*24；要取整用 INT 或 ROUND。',
        level: 'mid',
      },
      {
        title: '以为 NOW 是固定时间戳，每次打开都变',
        reason: 'NOW 是易失函数，会一直刷新成此刻，不适合做「归档时间」。',
        fix: '需要写死的时间戳：输入后「复制 → 粘贴为值」，或用 VBA/ Power Query 落库。',
        level: 'mid',
      },
      {
        title: '日期本质是序列号，NOW 的整数=日期、小数=时间',
        reason: '很多人以为 NOW 是个特殊东西，其实它只是「整数.小数」，0.5 就是中午 12 点。',
        fix: '只想要日期部分就 INT(NOW())，只想要时间就 NOW()-INT(NOW())。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'today',
        kind: 'companion',
        why: '只需要日期、不要时分秒，用 TODAY 更干净。',
      },
      {
        id: 'date',
        kind: 'companion',
        why: '要拼一个固定的某天某时点，用 DATE + TIME 组合。',
      },
      {
        id: 'text',
        kind: 'companion',
        why: '想把 NOW 显示成指定样式（如 yyyy-mm-dd hh:mm），用 TEXT 包一层。',
      },
      {
        id: 'year',
        kind: 'companion',
        why: '要从此刻取「年份」做分组，写 YEAR(NOW())。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [],
      template: '=NOW()',
      cases: [
        {
          label: '此刻日期时间（易失，断言跳过）',
          type: 'ok',
          values: {},
          expect: '2026-08-30 11:42:05',
          note: '易失函数，返回当前日期时间「YYYY-MM-DD HH:mm:ss」，通用验收会跳过精确断言。',
        },
        {
          label: '说明：含时间，相减得小数天数',
          type: 'ok',
          values: {},
          expect: '2026-08-30 11:42:05',
          note: 'NOW 含时间部分，两个日期相减得到的小数需乘 24 才是小时数。',
        },
        {
          label: '说明：只取日期部分用 INT',
          type: 'ok',
          values: {},
          expect: '2026-08-30 11:42:05',
          note: 'INT(NOW()) 抹掉时间小数，只保留当天日期。',
        },
        {
          label: '说明：只取时间部分用减法',
          type: 'ok',
          values: {},
          expect: '2026-08-30 11:42:05',
          note: 'NOW()-INT(NOW()) 得到 0–1 之间的小数，表示当天已过的比例。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 3. DATE —— 生成日期
   * ===================================================================== */
  date: {
    id: 'date',
    enName: 'DATE',
    zhName: '生成日期',
    zhCommon: ['构造日期', '组合日期', '拼日期'],
    alias: ['日期生成', '年月日转日期', '生成指定日期'],
    category: 'datetime',
    abbr: 'scrq',
    pinyin: 'shengchengriqi',
    keywords: ['把数字变成日期', '年月日合并', '构造指定日期', '动态生成日期', '日期序列号', '按年月份日期'],
    difficulty: 2,
    usageLevel: 64,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
      notes: '月份或日超出常规范围时会自动「进位」到下月/下年，这是 DATE 的特性而非错误。',
    },
    oneLiner: '把年月日拼成一个真正的日期',
    summary:
      'DATE(年,月,日) 把三个数字合成一个真正的 Excel 日期（序列号），可以放心参与加减运算、比较大小。比手动敲 "2024-1-1" 可靠得多——后者只是文本，不能算。它也常和 YEAR/MONTH/DAY 配合，把拆开的日期再拼回去。',
    syntax: {
      patternCn: '=DATE(年, 月, 日)',
      patternEn: '=DATE(year, month, day)',
      args: [
        {
          key: 'year',
          zh: '年',
          en: 'year',
          required: true,
          desc: '要生成的年份。',
          accepts: '推荐四位，如 2024；只写两位会按 1900 日期系统解释（00–29→2000–2029，30–99→1930–1999）。',
          ifOmitted: '必填，省略公式无法成立。',
          tip: '强烈建议写四位年份，避免世纪坑。',
          example: '2024',
        },
        {
          key: 'month',
          zh: '月',
          en: 'month',
          required: true,
          desc: '月份 1–12。',
          accepts: '1–12；写 13 会自动变成下一年的 1 月。',
          ifOmitted: '必填。',
          tip: '月份超出范围会自动进位，这是 DATE 的隐藏特性。',
          example: '1',
        },
        {
          key: 'day',
          zh: '日',
          en: 'day',
          required: true,
          desc: '日 1–31。',
          accepts: '1–31；写 32 会变成下月的 1 日。',
          ifOmitted: '必填。',
          tip: '同理会自动进位到下月。',
          example: '1',
        },
      ],
    },
    returnValue: '返回一个真正的 Excel 日期（序列号），可继续运算。',
    examples: [
      {
        title: '示例 1：把数字拼成固定日期',
        scene: '想在公式里写死一个「2024 年 1 月 1 日」且能被计算。',
        dataTsv: YMD_TSV,
        dataAnchor: 'A1',
        formula: '=DATE(2024,1,1)',
        result: '返回 2024/1/1（真日期，序列号 45292）。',
        explanation: '三个数字合成一个真日期，后续可以直接拿来减 TODAY() 算天数差。',
      },
      {
        title: '示例 2：月份超出范围自动进位',
        scene: '不小心写了 13 月，担心报错。',
        dataTsv: YMD_TSV,
        dataAnchor: 'A1',
        formula: '=DATE(2024,13,1)',
        result: '返回 2025/1/1，自动进位到下一年 1 月，不报错。',
        explanation: 'DATE 会做日历进位：多出的月份顺延到年、多出的天数顺延到月。',
      },
      {
        title: '示例 3：用单元格里的年/月/日三列拼日期',
        scene: '年份、月份、日分别存在 A/B/C 三列，要合并成一列真日期。',
        dataTsv: YMD_TSV,
        dataAnchor: 'A1',
        formula: '=DATE(A2,B2,C2)',
        result: 'A2=2024、B2=3、C2=15 → 返回 2024/3/15。',
        explanation: '参数可以是单元格引用，整列下拉即可批量生成日期。',
      },
    ],
    pitfalls: [
      {
        title: '月份/日超出范围被自动进位，以为是算错了',
        reason: 'DATE 会做日历进位，=DATE(2024,13,1) 变成 2025/1/1，看起来像 bug 其实是有意为之。',
        fix: '想要「报错」式的严格校验，需另写公式；否则接受进位、确保入参在合理范围。',
        level: 'mid',
      },
      {
        title: '年月日写成文本，报 #VALUE!',
        reason: '=DATE("2024","1","1") 里参数是文本，DATE 只认数字。',
        fix: '去掉引号用数字：=DATE(2024,1,1)；若来自文本列，先用 VALUE() 或在分列里转成数字。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '用 DATE 造的日期才能比较，文本 "2024-1-1" 不能比',
        reason: '文本不是真日期，和别的日期比较/相减会静默出错。',
        fix: '一律用 DATE(年,月,日) 或引用真日期单元格。',
        level: 'high',
      },
      {
        title: '两位数年份掉进世纪坑',
        reason: '=DATE(24,1,1) 在 1900 日期系统下可能被解释成 1924 或 2024，取决于版本与设置，极易踩雷。',
        fix: '始终写四位年份：=DATE(2024,1,1)。',
        level: 'mid',
      },
    ],
    related: [
      {
        id: 'today',
        kind: 'companion',
        why: '要的是「今天」而不是某个固定日，用 TODAY() 更省事。',
      },
      {
        id: 'year',
        kind: 'companion',
        why: 'DATE 的反操作——从日期里取出年份用 YEAR。',
      },
      {
        id: 'day',
        kind: 'companion',
        why: 'DATE 的反操作——取出「几号」用 DAY。',
      },
      {
        id: 'edate',
        kind: 'companion',
        why: '要在某个日期基础上整月推移（如 +12 月），用 EDATE 比 DATE 重算更直观。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'year', label: '年', type: 'number', default: '2024', placeholder: '如 2024', hint: '四位年份最稳妥。' },
        { key: 'month', label: '月', type: 'number', default: '3', placeholder: '1–12', hint: '超出范围会自动进位到下月。' },
        { key: 'day', label: '日', type: 'number', default: '15', placeholder: '1–31', hint: '超出范围会自动进位到下月。' },
      ],
      template: '=DATE({year},{month},{day})',
      cases: [
        {
          label: '把数字拼成固定日期',
          type: 'ok',
          values: { year: '2024', month: '3', day: '15' },
          expect: '2024-03-15',
          note: '三个数字合成一个真正的 Excel 日期，后续可继续参与运算。',
        },
        {
          label: '月份 > 12',
          type: 'error',
          values: { year: '2024', month: '13', day: '1' },
          expect: '#VALUE!',
          note: '月份超出 1–12 视为非法，报错（与 Excel 自动进位的宽松行为不同，这里做严格校验）。',
        },
        {
          label: '日 > 31',
          type: 'error',
          values: { year: '2024', month: '3', day: '32' },
          expect: '#VALUE!',
          note: '日超出 1–31 视为非法，报错。',
        },
        {
          label: '年填成文本',
          type: 'error',
          values: { year: 'abc', month: '3', day: '5' },
          expect: '#VALUE!',
          note: 'DATE 只认数字，文本年份会报 #VALUE!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 4. YEAR —— 年份
   * ===================================================================== */
  year: {
    id: 'year',
    enName: 'YEAR',
    zhName: '年份',
    zhCommon: ['取年份', '年', '提取年'],
    alias: ['年份提取', '取年', '日期取年'],
    category: 'datetime',
    abbr: 'nf',
    pinyin: 'nianfen',
    keywords: ['从日期取年', '提取年份', '年份函数', '按年分组', '算年龄', '日期拆年份'],
    difficulty: 1,
    usageLevel: 58,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
    },
    oneLiner: '从日期里取出年份',
    summary:
      'YEAR(日期) 返回该日期对应的年份数字，例如 2021-03-15 取出 2021。常用于「按年统计」「算年龄」「判断合同是否今年到期」。参数是真正的日期（序列号）；如果是文本日期要先转成真日期，否则报错。',
    syntax: {
      patternCn: '=YEAR(日期)',
      patternEn: '=YEAR(serial_number)',
      args: [
        {
          key: 'serial_number',
          zh: '日期',
          en: 'serial_number',
          required: true,
          desc: '一个真正的日期（单元格引用或 DATE 的返回值）。',
          accepts: 'A2、DATE(2024,1,1)、TODAY()、NOW()。',
          ifOmitted: '必填，省略公式无法成立。',
          tip: '文本日期 "2024-1-1" 要先转成真日期，否则报 #VALUE!。',
          example: 'A2',
        },
      ],
    },
    returnValue: '返回年份数字，如 2024。',
    examples: [
      {
        title: '示例 1：从入职日期取年份',
        scene: 'HR 表里有入职日期，想单独拉一列「入职年份」做统计。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=YEAR(B2)',
        result: '张三 2021-03-15 → 2021；李四 2019-07-01 → 2019。',
        explanation: 'B2 是真正的日期，YEAR 只取其中的年份部分。',
      },
      {
        title: '示例 2：算「到今年」的工龄年数',
        scene: '用今年减入职年，粗略看工龄。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=YEAR(TODAY())-YEAR(B2)',
        result: '若今天 2026 年，张三 2021 入职 → 返回 5。',
        explanation: '两个年份相减即得整年差；要精确到月日再用 DATEDIF。',
      },
      {
        title: '示例 3：判断是否「今年」发生',
        scene: '只想标出今年入职的人。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=IF(YEAR(B2)=YEAR(TODAY()),"今年","往年")',
        result: '今天 2026 年时，两人都不是 2026 入职 → 均返回「往年」。',
        explanation: '把入职年份和今年比，相等即今年。',
      },
    ],
    pitfalls: [
      {
        title: '文本日期直接喂给 YEAR，报 #VALUE!',
        reason: '单元格里若存的是 "2021-03-15" 这种文本，YEAR 不认。',
        fix: '先用 DATE 重拼：=YEAR(DATE(2021,3,15))；或选中该列「数据 → 分列」转成真日期。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '空单元格被当成 0，返回 1900',
        reason: '引用了空单元格时，YEAR 把空当 0，0 在 1900 日期系统里对应 1900 年。',
        fix: '先判空：=IF(B2="","",YEAR(B2))，避免冒出诡异的 1900。',
        level: 'mid',
      },
      {
        title: '只比年份会忽略月日',
        reason: 'YEAR 只看年，2021-01-01 和 2021-12-31 的 YEAR 都是 2021，但其实是不同日子。',
        fix: '要精确到「满多少年」用 DATEDIF(出生,今天,"Y")；要按月日判断用 MONTH/DAY 组合。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'month',
        kind: 'companion',
        why: 'YEAR 只取年，要月用 MONTH、要日用 DAY，三个常一起用。',
      },
      {
        id: 'day',
        kind: 'companion',
        why: '想取「几号」配合判断月初/月底，用 DAY。',
      },
      {
        id: 'today',
        kind: 'companion',
        why: '常以 TODAY() 作为「今年」的基准传入 YEAR。',
      },
      {
        id: 'date',
        kind: 'companion',
        why: 'YEAR 的反操作——把年/月/日拼回真日期用 DATE。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'date', label: '日期', type: 'text', default: 'B2', placeholder: '如 B2 或 "2024-03-05"', hint: '引用入职日期列的真实日期单元格，或带引号的文本日期。' },
      ],
      template: '=YEAR({date})',
      cases: [
        {
          label: '从入职日期取年份',
          type: 'ok',
          values: { date: 'B2' },
          expect: '2021',
          note: 'B2 是真正的日期（2021-03-15），YEAR 只取年份部分。',
        },
        {
          label: '引用文本列（姓名）当日期',
          type: 'error',
          values: { date: 'A2' },
          expect: '#VALUE!',
          note: 'A2 是姓名文本，不是日期，YEAR 不认，报 #VALUE!。',
        },
        {
          label: '文本日期直接喂',
          type: 'error',
          values: { date: '"abc"' },
          expect: '#VALUE!',
          note: '文本 "abc" 解析不成日期，报 #VALUE!；应改用 DATE(年,月,日) 重拼或引用真日期单元格。',
        },
        {
          label: '引用越界空单元格',
          type: 'error',
          values: { date: 'A9' },
          expect: '#VALUE!',
          note: '超出示例数据范围的单元格是空的，不是日期，报 #VALUE!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 5. MONTH —— 月份
   * ===================================================================== */
  month: {
    id: 'month',
    enName: 'MONTH',
    zhName: '月份',
    zhCommon: ['取月份', '月', '提取月'],
    alias: ['月份提取', '取月', '日期取月'],
    category: 'datetime',
    abbr: 'yf',
    pinyin: 'yuefen',
    keywords: ['从日期取月', '提取月份', '月份数字', '按月统计', '月份函数', '日期拆月'],
    difficulty: 1,
    usageLevel: 56,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
    },
    oneLiner: '从日期里取出月份',
    summary:
      'MONTH(日期) 返回日期里的月份数字 1–12，例如 2021-03-15 取出 3。做「按月汇总」「判断是否某月」时常用。参数同样必须是真日期，文本日期会报 #VALUE!。',
    syntax: {
      patternCn: '=MONTH(日期)',
      patternEn: '=MONTH(serial_number)',
      args: [
        {
          key: 'serial_number',
          zh: '日期',
          en: 'serial_number',
          required: true,
          desc: '一个真正的日期（单元格引用或 DATE 的返回值）。',
          accepts: 'A2、DATE(2024,1,1)、TODAY()。',
          ifOmitted: '必填。',
          tip: '文本日期要先转成真日期，否则报 #VALUE!。',
          example: 'A2',
        },
      ],
    },
    returnValue: '返回月份数字 1–12。',
    examples: [
      {
        title: '示例 1：从入职日期取月份',
        scene: '想知道每个人是几月入职的。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=MONTH(B2)',
        result: '张三 2021-03-15 → 3；李四 2019-07-01 → 7。',
        explanation: 'B2 是真正日期，MONTH 只取月份部分。',
      },
      {
        title: '示例 2：判断是否 12 月（年终）',
        scene: '只给 12 月的数据打上「年终」标记。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=IF(MONTH(B2)=12,"年终","")',
        result: '两个入职都不在 12 月 → 返回空。',
        explanation: '把月份和 12 比较，相等即年终。',
      },
      {
        title: '示例 3：年和月拼成「2021-03」分组键',
        scene: '按月做趋势图，需要「年-月」这样的文本键。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=YEAR(B2)&"-"&TEXT(B2,"mm")',
        result: '张三 → 文本「2021-03」。',
        explanation: '用 TEXT 把月补成两位 "03" 再拼接，排序才好看。',
      },
    ],
    pitfalls: [
      {
        title: '文本日期直接喂给 MONTH，报 #VALUE!',
        reason: '单元格里若是 "2021-03-15" 文本，MONTH 不认。',
        fix: '先转真日期：=MONTH(DATE(2021,3,15))，或用分列转换。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '空单元格被当成 0，返回 1（1900 年 1 月）',
        reason: '引用空单元格时 MONTH 把空当 0，对应 1900 年 1 月，于是返回 1。',
        fix: '先判空：=IF(B2="","",MONTH(B2))。',
        level: 'mid',
      },
      {
        title: '月份没有前导零，1 月显示成「1」不是「01」',
        reason: 'MONTH 返回的是数字 1，不是文本 "01"，直接拼接会乱序。',
        fix: '要两位用 TEXT(B2,"mm")；要显示「1月」用 MONTH(B2)&"月"。',
        level: 'mid',
      },
    ],
    related: [
      {
        id: 'year',
        kind: 'companion',
        why: 'MONTH 只取月，取年用 YEAR，取日用 DAY，三者常组合。',
      },
      {
        id: 'day',
        kind: 'companion',
        why: '要判断月初/月底，配合 DAY 使用。',
      },
      {
        id: 'today',
        kind: 'companion',
        why: '常以 TODAY() 作为「当前月」的基准传入 MONTH。',
      },
      {
        id: 'date',
        kind: 'companion',
        why: 'MONTH 的反操作——把年/月/日拼回真日期用 DATE。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'date', label: '日期', type: 'text', default: 'B2', placeholder: '如 B2 或 "2024-03-05"', hint: '引用真实日期单元格，或带引号的文本日期。' },
      ],
      template: '=MONTH({date})',
      cases: [
        {
          label: '从入职日期取月份',
          type: 'ok',
          values: { date: 'B2' },
          expect: '3',
          note: 'B2=2021-03-15，MONTH 取月份部分 3。',
        },
        {
          label: '引用文本列（姓名）当日期',
          type: 'error',
          values: { date: 'A2' },
          expect: '#VALUE!',
          note: 'A2 是姓名文本，不是日期，MONTH 不认，报 #VALUE!。',
        },
        {
          label: '文本日期直接喂',
          type: 'error',
          values: { date: '"abc"' },
          expect: '#VALUE!',
          note: '文本 "abc" 解析不成日期，报 #VALUE!。',
        },
        {
          label: '引用越界空单元格',
          type: 'error',
          values: { date: 'A9' },
          expect: '#VALUE!',
          note: '超出范围的空单元格不是日期，报 #VALUE!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 6. DAY —— 日
   * ===================================================================== */
  day: {
    id: 'day',
    enName: 'DAY',
    zhName: '日',
    zhCommon: ['取日', '几号', '提取日'],
    alias: ['日提取', '取号', '日期取日'],
    category: 'datetime',
    abbr: 'r',
    pinyin: 'ri',
    keywords: ['从日期取日', '几号', '提取天', '日函数', '按日分组', '日期拆日'],
    difficulty: 1,
    usageLevel: 48,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
    },
    oneLiner: '从日期里取出是几号',
    summary:
      'DAY(日期) 返回日期里的「日」部分 1–31，例如 2021-03-15 取出 15。常用来判断「是不是 1 号（月初）」「是不是月底」。参数必须是真日期，文本日期会报 #VALUE!。',
    syntax: {
      patternCn: '=DAY(日期)',
      patternEn: '=DAY(serial_number)',
      args: [
        {
          key: 'serial_number',
          zh: '日期',
          en: 'serial_number',
          required: true,
          desc: '一个真正的日期（单元格引用或 DATE 的返回值）。',
          accepts: 'A2、DATE(2024,1,1)、TODAY()。',
          ifOmitted: '必填。',
          tip: '文本日期要先转成真日期，否则报 #VALUE!。',
          example: 'A2',
        },
      ],
    },
    returnValue: '返回「日」数字 1–31。',
    examples: [
      {
        title: '示例 1：从入职日期取「几号」',
        scene: '想知道每个人是几号入职的。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=DAY(B2)',
        result: '张三 2021-03-15 → 15；李四 2019-07-01 → 1。',
        explanation: 'B2 是真正日期，DAY 只取日部分。',
      },
      {
        title: '示例 2：判断是否月初（1 号）',
        scene: '只想标出每月 1 号发生的记录。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=IF(DAY(B2)=1,"月初","")',
        result: '李四 7 月 1 日 → 「月初」；张三 → 空。',
        explanation: '把日部分和 1 比较，相等即月初。',
      },
      {
        title: '示例 3：年和月日拼回完整标签',
        scene: '需要「2021年3月15日」这样的中文标签。',
        dataTsv: HIRE_TSV,
        dataAnchor: 'A1',
        formula: '=YEAR(B2)&"年"&MONTH(B2)&"月"&DAY(B2)&"日"',
        result: '张三 → 文本「2021年3月15日」。',
        explanation: 'YEAR/MONTH/DAY 三个一起取，按需拼成任意样式。',
      },
    ],
    pitfalls: [
      {
        title: '文本日期直接喂给 DAY，报 #VALUE!',
        reason: '单元格里若是 "2021-03-15" 文本，DAY 不认。',
        fix: '先转真日期：=DAY(DATE(2021,3,15))，或用分列转换。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '空单元格被当成 0，返回 0',
        reason: '引用空单元格时 DAY 把空当 0，序列号 0 对应 1900-01-00，于是返回 0。',
        fix: '先判空：=IF(B2="","",DAY(B2))，避免冒出诡异的 0。',
        level: 'mid',
      },
      {
        title: '忘了日期本质是序列号',
        reason: 'DAY 只是从序列号里扒出「日」分量，源必须是真日期才能正确。',
        fix: '确保源单元格是日期格式；文本请用 DATE/VALUE 转。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'year',
        kind: 'companion',
        why: 'DAY 只取日，取年用 YEAR、取月用 MONTH，三者常组合。',
      },
      {
        id: 'month',
        kind: 'companion',
        why: '要判断月初/月底，配合 MONTH 一起用。',
      },
      {
        id: 'today',
        kind: 'companion',
        why: '常以 TODAY() 作为「今天几号」的基准传入 DAY。',
      },
      {
        id: 'date',
        kind: 'companion',
        why: 'DAY 的反操作——把年/月/日拼回真日期用 DATE。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'date', label: '日期', type: 'text', default: 'B2', placeholder: '如 B2 或 "2024-03-05"', hint: '引用真实日期单元格，或带引号的文本日期。' },
      ],
      template: '=DAY({date})',
      cases: [
        {
          label: '从入职日期取「几号」',
          type: 'ok',
          values: { date: 'B2' },
          expect: '15',
          note: 'B2=2021-03-15，DAY 取日部分 15。',
        },
        {
          label: '引用文本列（姓名）当日期',
          type: 'error',
          values: { date: 'A2' },
          expect: '#VALUE!',
          note: 'A2 是姓名文本，不是日期，DAY 不认，报 #VALUE!。',
        },
        {
          label: '文本日期直接喂',
          type: 'error',
          values: { date: '"abc"' },
          expect: '#VALUE!',
          note: '文本 "abc" 解析不成日期，报 #VALUE!。',
        },
        {
          label: '引用越界空单元格',
          type: 'error',
          values: { date: 'A9' },
          expect: '#VALUE!',
          note: '超出范围的空单元格不是日期，报 #VALUE!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 7. DATEDIF —— 隐藏函数，算两个日期相差多少年月天
   * ===================================================================== */
  datedif: {
    id: 'datedif',
    enName: 'DATEDIF',
    zhName: '日期差',
    zhCommon: ['日期差', '间隔', '相差'],
    alias: ['隐藏日期差', '计算年龄', '算工龄'],
    category: 'datetime',
    abbr: 'rqc',
    pinyin: 'riqicha',
    keywords: ['两个日期相差', '算间隔', '年月天差', '年龄计算', '工龄', '日期差值', '相差多少天'],
    difficulty: 3,
    usageLevel: 60,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起，但属隐藏函数）',
      notes: 'Excel 没有智能提示、函数列表搜不到，需手动完整输入 DATEDIF。',
    },
    hiddenFunction: true,
    oneLiner: '算两个日期相差多少年月天',
    summary:
      'DATEDIF(开始日, 结束日, 单位) 计算两个日期之间的差。它全版本都能用，但属于 Excel 的「隐藏函数」——函数列表里搜不到、没有智能提示，必须手敲完整拼写。单位 "Y" 整年 / "M" 整月 / "D" 天 / "YM" 忽略年的月差 / "MD" 忽略年月的天差 / "YD" 忽略年的天差。算年龄、工龄、账期最趁手。',
    syntax: {
      patternCn: '=DATEDIF(开始日, 结束日, 单位)',
      patternEn: '=DATEDIF(start_date, end_date, unit)',
      args: [
        {
          key: 'start_date',
          zh: '开始日',
          en: 'start_date',
          required: true,
          desc: '较早的那个日期（必须是真正的日期）。',
          accepts: 'A2、DATE(1990,5,20)、比结束日早的任意真日期。',
          ifOmitted: '必填。',
          tip: '开始日必须早于结束日，否则报 #NUM!。',
          example: 'A2',
          pitfallRank: 1,
        },
        {
          key: 'end_date',
          zh: '结束日',
          en: 'end_date',
          required: true,
          desc: '较晚的那个日期。',
          accepts: 'B2、TODAY()。',
          ifOmitted: '必填。',
          tip: '必须晚于开始日。',
          example: 'B2',
        },
        {
          key: 'unit',
          zh: '单位',
          en: 'unit',
          required: true,
          desc: '返回差的单位。',
          accepts: '"Y"整年 / "M"整月 / "D"天 / "YM"忽略年的月差 / "MD"忽略年月的天差 / "YD"忽略年的天差。',
          ifOmitted: '必填。',
          tip: '单位要带半角双引号；写 Y 不加引号会报 #NAME?。',
          example: '"Y"',
        },
      ],
    },
    returnValue: '一个数字，表示两个日期在指定单位下的差值。',
    examples: [
      {
        title: '示例 1：算周岁年龄',
        scene: '已知出生日期，想算出到今天满多少整岁。',
        dataTsv: BIRTH_TSV,
        dataAnchor: 'A1',
        formula: '=DATEDIF(B2,B3,"Y")',
        result: '出生 1990-05-20、截止 2026-08-30 → 返回 36（周岁）。',
        explanation: '"Y" 只数完整的年，没满的月日不计，所以是周岁而非虚岁。',
      },
      {
        title: '示例 2：算相差多少天',
        scene: '想知道两个日期之间隔了多少天。',
        dataTsv: BIRTH_TSV,
        dataAnchor: 'A1',
        formula: '=DATEDIF(B2,B3,"D")',
        result: '1990-05-20 到 2026-08-30 → 返回 13251 天。',
        explanation: '"D" 直接给总天数，最直观。',
      },
      {
        title: '示例 3：算「还差几个月满整年」',
        scene: '年龄 36 岁但还没到生日，想知道差几个月。',
        dataTsv: BIRTH_TSV,
        dataAnchor: 'A1',
        formula: '=DATEDIF(B2,B3,"YM")',
        result: '返回 3，表示距离下一个整年还差 3 个月（5 月到 8 月）。',
        explanation: '"YM" 忽略已经数过的整年，只看余下的月差。',
      },
    ],
    pitfalls: [
      {
        title: '开始日、结束日顺序写反，报 #NUM!',
        reason: 'DATEDIF 要求开始日早于结束日，把较晚的放前面它就无从计算。',
        fix: '确认顺序：=DATEDIF(早的日期, 晚的日期, "Y")；实在拿不准可用 MIN/MAX 兜底。',
        level: 'high',
        errorCode: '#NUM!',
      },
      {
        title: '单位没加引号，写 DATEDIF(A2,B2,Y) 报 #NAME?',
        reason: 'Y 不加引号会被当成「名称」去查找，找不到就报错。',
        fix: '单位必须带半角双引号：=DATEDIF(A2,B2,"Y")。',
        level: 'high',
        errorCode: '#NAME?',
      },
      {
        title: '它是隐藏函数，拼写错就当名称 → #NAME?',
        reason: '函数列表搜不到、没有提示，容易拼成 DATEIF / DATEDIFF 等。',
        fix: '严格写 DATEDIF（一个 T，F 结尾）；建议从别处复制避免手误。',
        level: 'mid',
        errorCode: '#NAME?',
      },
      {
        title: '"MD" 单位存在已知边界 bug',
        reason: 'DATEDIF 的 "MD" 在跨月计算时偶有 1 天误差，是 Excel 的历史遗留问题。',
        fix: '对天差优先用 "D"；必须用「忽略月的天差」时，手动用 DAY 组合更稳妥。',
        level: 'mid',
      },
      {
        title: '参数是文本日期，报 #VALUE!',
        reason: '喂进 "1990-5-20" 这种文本，DATEDIF 不认。',
        fix: '用真日期：=DATEDIF(DATE(1990,5,20),TODAY(),"Y") 或引用真日期单元格。',
        level: 'high',
        errorCode: '#VALUE!',
      },
    ],
    related: [
      {
        id: 'year',
        kind: 'companion',
        why: '只想要粗略「今年减出生年」的年份差，用 YEAR 相减即可，不必动用隐藏函数。',
      },
      {
        id: 'today',
        kind: 'companion',
        why: 'DATEDIF 的结束日常用 TODAY() 作为「到现在」的基准。',
      },
      {
        id: 'date',
        kind: 'companion',
        why: '把拆开的年/月/日拼成真日期再喂给 DATEDIF。',
      },
      {
        id: 'edate',
        kind: 'companion',
        why: '要做「加 N 个月」的到期推算用 EDATE，比 DATEDIF 方向正好相反。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'start_date', label: '开始日', type: 'text', default: 'B2', placeholder: '如 B2 或 "1990-05-20"', hint: 'BIRTH_TSV 里 B2=出生日、B3=今天，都是真日期。' },
        { key: 'end_date', label: '结束日', type: 'text', default: 'B3', placeholder: '如 B3 或 "2026-08-30"', hint: '必须晚于开始日，否则报 #NUM!。' },
        {
          key: 'unit',
          label: '单位',
          type: 'select',
          default: 'Y',
          options: [
            { label: 'Y 整年', value: 'Y' },
            { label: 'M 整月', value: 'M' },
            { label: 'D 天', value: 'D' },
          ],
          hint: 'Y=整年差 / M=整月差 / D=天数差。',
        },
      ],
      template: '=DATEDIF({start_date},{end_date},{unit})',
      cases: [
        {
          label: '算周岁年龄（Y）',
          type: 'ok',
          values: { start_date: 'B2', end_date: 'B3', unit: 'Y' },
          expect: '36',
          note: '出生 1990-05-20、今天 2026-08-30，整年差 36（周岁）。',
        },
        {
          label: '算相差天数（D）',
          type: 'ok',
          values: { start_date: 'B2', end_date: 'B3', unit: 'D' },
          expect: '13251',
          note: '两个真日期相减的总天数差。',
        },
        {
          label: '算相差整月（M）',
          type: 'ok',
          values: { start_date: 'B2', end_date: 'B3', unit: 'M' },
          expect: '435',
          note: '整月差 = (2026-1990)*12 + (8-5) = 435（结束日不早于开始日「日」，不再减 1）。',
        },
        {
          label: '单位写错（X）',
          type: 'error',
          values: { start_date: 'B2', end_date: 'B3', unit: 'X' },
          expect: '#VALUE!',
          note: '单位必须是 Y/M/D 之一，其它值报 #VALUE!（Excel 里漏引号还会报 #NAME?）。',
        },
        {
          label: '开始日 / 结束日写反',
          type: 'error',
          values: { start_date: 'B3', end_date: 'B2', unit: 'Y' },
          expect: '#NUM!',
          note: 'DATEDIF 要求开始日 < 结束日，写反报 #NUM!。',
        },
        {
          label: '开始日是文本',
          type: 'error',
          values: { start_date: '"abc"', end_date: 'B3', unit: 'Y' },
          expect: '#VALUE!',
          note: '文本日期解析不出，报 #VALUE!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  /* =======================================================================
   * 8. EDATE —— 月份推移
   * ===================================================================== */
  edate: {
    id: 'edate',
    enName: 'EDATE',
    zhName: '月份推移',
    zhCommon: ['月份加减', '推月份', '加减月'],
    alias: ['日期推移', 'N个月后', '月份偏移'],
    category: 'datetime',
    abbr: 'yfty',
    pinyin: 'yuefentuiyi',
    keywords: ['日期加月份', '往后推N月', '合同到期日', '月份偏移', '加减月', '日期推算'],
    difficulty: 2,
    usageLevel: 52,
    version: {
      min: '2007',
      label: '需 Excel 2007 及以上（含 Microsoft 365）；Excel 2003 无此函数',
    },
    oneLiner: '把日期往前或往后推 N 个月',
    summary:
      'EDATE(开始日, 月数) 把某个日期往前（负数）或往后（正数）推指定的月数，日保持不变。若目标月没有这一天，则退回该月最后一天（如 1月31日 +1月 = 2月28/29日）。算「签约后 3 个月」「12 个月后到期日」特别顺手。',
    syntax: {
      patternCn: '=EDATE(开始日, 月数)',
      patternEn: '=EDATE(start_date, months)',
      args: [
        {
          key: 'start_date',
          zh: '开始日',
          en: 'start_date',
          required: true,
          desc: '基准日期（必须是真正的日期）。',
          accepts: 'A2、DATE(2024,1,15)、TODAY()。',
          ifOmitted: '必填。',
          tip: '必须是真日期，文本会报 #VALUE!。',
          example: 'A2',
        },
        {
          key: 'months',
          zh: '月数',
          en: 'months',
          required: true,
          desc: '要推的月数，正=往后、负=往前。',
          accepts: '3 表示加 3 个月；-6 表示减 6 个月；也可以是单元格引用方便下拉。',
          ifOmitted: '必填。',
          tip: '月数用数字，别加引号；写成文本会报 #VALUE!。',
          example: '12',
        },
      ],
    },
    returnValue: '返回推移后的新日期（仍是真日期，可继续运算）。',
    examples: [
      {
        title: '示例 1：日期往后推 3 个月',
        scene: '1 月 15 日签约，想看 3 个月后是几号。',
        dataTsv: SIGN_TSV,
        dataAnchor: 'A1',
        formula: '=EDATE(DATE(2024,1,15),3)',
        result: '返回 2024/4/15。',
        explanation: '正数 3 表示往后加 3 个月，日保持不变。',
      },
      {
        title: '示例 2：算合同 12 个月后到期日',
        scene: '签约日放在单元格里，要自动算出整年后的到期日。',
        dataTsv: SIGN_TSV,
        dataAnchor: 'A1',
        formula: '=EDATE(B2,12)',
        result: '签约日 2024-01-15 → 返回 2025-01-15。',
        explanation: '月数用单元格引用，整列下拉就能批量算不同合同的到期日。',
      },
      {
        title: '示例 3：往前推 6 个月（半年前）',
        scene: '想看以今天为基准、半年前是哪天。',
        dataTsv: SIGN_TSV,
        dataAnchor: 'A1',
        formula: '=EDATE(TODAY(),-6)',
        result: '若今天 2026-08-30，则返回约 2026-02-28。',
        explanation: '负数表示往前推；以 TODAY() 为基准时每次打开都会刷新。',
      },
    ],
    pitfalls: [
      {
        title: '月末边界：1月31日 +1月 变成 2月28/29日',
        reason: '2 月没有 31 天，EDATE 会退回目标月的最后一天，不是凭空造出 2月31日。',
        fix: '这是正常行为；若业务要求「固定日」可用 DAY/MONTH 自行判断并取 MIN。',
        level: 'mid',
      },
      {
        title: '月数写成文本，报 #VALUE!',
        reason: '=EDATE(A2,"3") 里 "3" 是文本，EDATE 的月数要数字。',
        fix: '用数字：=EDATE(A2,3)；来自文本列先 VALUE() 转换。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: '开始日是文本日期，报 #VALUE!',
        reason: '单元格里若是 "2024-01-15" 文本，EDATE 不认。',
        fix: '用真日期：=EDATE(DATE(2024,1,15),3) 或引用真日期单元格。',
        level: 'high',
        errorCode: '#VALUE!',
      },
      {
        title: 'EDATE 只动「月」，结果可能和直觉不同',
        reason: '它严格按月偏移，2024-01-31 加 1 月 = 2024-02-29（闰年），日会被「压」进当月。',
        fix: '清楚它是按日历月偏移即可；需要「加减固定天数」请用 日期±数字。',
        level: 'low',
      },
    ],
    related: [
      {
        id: 'date',
        kind: 'companion',
        why: 'EDATE 的基准日期常用 DATE 拼出来，或引用 DATE 生成的单元格。',
      },
      {
        id: 'today',
        kind: 'companion',
        why: '以今天为基准往前/往后推月，写 EDATE(TODAY(),n)。',
      },
      {
        id: 'month',
        kind: 'companion',
        why: '只想要「月份数字」用 MONTH，要整月偏移推算才用 EDATE。',
      },
      {
        id: 'year',
        kind: 'companion',
        why: 'EDATE 偏移后若想取年份做分组，配合 YEAR 使用。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        { key: 'start_date', label: '开始日', type: 'text', default: 'B2', placeholder: '如 B2 或 "2024-01-15"', hint: 'SIGN_TSV 里 B2=2024-01-15，是真日期。' },
        { key: 'months', label: '月数', type: 'number', default: '3', placeholder: '如 3（负=往前）', hint: '月数用数字；文本或非整数报 #VALUE!。' },
      ],
      template: '=EDATE({start_date},{months})',
      cases: [
        {
          label: '日期往后推 3 个月',
          type: 'ok',
          values: { start_date: 'B2', months: '3' },
          expect: '2024-04-15',
          note: '2024-01-15 加 3 个月 = 2024-04-15，日保持不变。',
        },
        {
          label: '开始日是文本',
          type: 'error',
          values: { start_date: '"abc"', months: '3' },
          expect: '#VALUE!',
          note: '文本 "abc" 不是真日期，报 #VALUE!。',
        },
        {
          label: '月数填成文本',
          type: 'error',
          values: { start_date: 'B2', months: 'abc' },
          expect: '#VALUE!',
          note: '月数必须是数字，文本 "3" 也会报 #VALUE!。',
        },
        {
          label: '月数非整数',
          type: 'error',
          values: { start_date: 'B2', months: '3.5' },
          expect: '#VALUE!',
          note: '月数必须是整数，小数 3.5 报 #VALUE!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },
  datevalue: datevalueEntry,
  time: timeEntry,
  timevalue: timevalueEntry,
  hour: hourEntry,
  minute: minuteEntry,
  second: secondEntry,
  weekday: weekdayEntry,
  weeknum: weeknumEntry,
  isoweeknum: isoweeknumEntry,
  eomonth: eomonthEntry,
  yearfrac: yearfracEntry,
  days: daysEntry,
  days360: days360Entry,
  networkdays: networkdaysEntry,
  'networkdays-intl': networkdaysIntlEntry,
  workday: workdayEntry,
  'workday-intl': workdayIntlEntry,
};

export default pack;
