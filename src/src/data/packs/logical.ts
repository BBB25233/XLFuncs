import type { FunctionEntry } from '@/types';
import ifEntry from '@/data/samples/if';
import trueEntry from '@/data/samples/true';
import falseEntry from '@/data/samples/false';
import xorEntry from '@/data/samples/xor';
import switchEntry from '@/data/samples/switch';

/** 逻辑类 6 条：IF（样板）+ IFS / IFERROR / AND / OR / NOT（完整条目） */

/** IFS 分级小表：姓名 + 分数 */
const IFS_SCORE_TSV = '姓名\t分数\n张三\t95\n李四\t82\n王五\t68\n赵六\t55';

/** IFS 客户档位小表：客户 + 金额 */
const IFS_AMT_TSV = '客户\t金额\n甲\t12000\n乙\t3000\n丙\t800\n丁\t50000';

/** IFERROR 查表小表：工号 + 姓名 + 部门 */
const IFERR_V_TSV = '工号\t姓名\t部门\nA001\t张三\t销售\nA002\t李四\t技术';

/** IFERROR 除法小表：项目 + 预算 + 实际 */
const IFERR_D_TSV = '项目\t预算\t实际\n差旅\t0\t5000\n餐饮\t3000\t2800';

/** AND 单条件区间小表 */
const AND_TSV = '姓名\t分数\n张三\t85\n李四\t59\n王五\t72\n赵六\t92';

/** AND 双条件达标小表：姓名 + 出勤 + 业绩 */
const AND_TSV2 = '姓名\t出勤\t业绩\n张三\t98\t120\n李四\t60\t90\n王五\t85\t60';

/** OR 状态小表 */
const OR_TSV = '姓名\t状态\n张三\t及格\n李四\t补考\n王五\t缺考\n赵六\t及格';

/** OR 单科小表：姓名 + 语文 + 数学 */
const OR_TSV2 = '姓名\t语文\t数学\n张三\t85\t90\n李四\t40\t55\n王五\t95\t30';

/** NOT 任务状态小表 */
const NOT_TSV = '任务\t状态\n甲\t完成\n乙\t进行中\n丙\t\t\n丁\t完成';

/** NOT 编号小表：编号 + 值 */
const NOT_TSV2 = '编号\t值\nA1\t100\nA2\t文本\nA3\t200\nA4\t\t';

const pack: Record<string, FunctionEntry> = {
  true: trueEntry,
  false: falseEntry,
  xor: xorEntry,
  switch: switchEntry,
  if: ifEntry,

  ifs: {
    id: 'ifs',
    enName: 'IFS',
    zhName: '多条件判断',
    zhCommon: ['多条件判断', '分支判断', '依次判断'],
    alias: ['多分支', '平铺条件', '层叠判断'],
    category: 'logical',
    abbr: 'dtjpd',
    pinyin: 'duotiaojianpanduan',
    keywords: ['多条件判断', '等级划分', '分段评分', '平铺条件', '替代嵌套IF'],
    difficulty: 2,
    usageLevel: 55,
    version: {
      min: '2019',
      label: '需 Excel 2019 / 2021 或 Microsoft 365，Excel 2016 及更早版本无此函数',
      legacyAlternative: {
        expr: '=IF(B2>=90,"优",IF(B2>=80,"良",IF(B2>=60,"及格","不及格")))',
        note: '用嵌套 IF 平铺实现同样的分段逻辑，全版本可用，但层数多时括号难数、难维护。',
      },
    },
    oneLiner: '依次判断多个条件，命中哪个返回哪个',
    summary:
      '做多档分级、分段评分时不用再一层层套 IF：把「条件, 结果」一对对往里写，从上往下命中第一个成立的条件就返回对应结果，后面的不再判断。最多支持 127 对，比嵌套 IF 清爽得多。',
    syntax: {
      patternCn: '=IFS(条件1, 结果1, [条件2, 结果2], …)',
      patternEn: '=IFS(logical_test1, value1, [logical_test2, value2], …)',
      args: [
        {
          key: 'logical_test1',
          zh: '条件1',
          en: 'logical_test1',
          required: true,
          desc: '从上往下第一个要判断的条件。',
          accepts: 'B2>=90 · B2="及格" · AND(...) · OR(...)。',
          ifOmitted: '必填，至少要有一对「条件 + 结果」。',
          tip: '条件按顺序判断，一旦某个条件成立就返回对应结果并停止，所以把最严格 / 最大的阈值放最前面。',
          example: 'B2>=90',
          pitfallRank: 1,
        },
        {
          key: 'value1',
          zh: '结果1',
          en: 'value1',
          required: true,
          desc: '条件1成立时返回的值。',
          accepts: '带引号的文字、数字、单元格引用，或另一个公式。',
          tip: '返回文字一定要加半角双引号，如 "优"。',
          example: '"优"',
        },
        {
          key: 'logical_test2',
          zh: '条件2',
          en: 'logical_test2',
          required: false,
          desc: '可选，继续往下写第二对条件。',
          accepts: '同条件1。',
          ifOmitted: '省略就只判断第一对。',
          tip: '成对出现：奇数位放条件、偶数位放结果，写漏一个值会直接报错。',
          example: 'B2>=80',
        },
        {
          key: 'value2',
          zh: '结果2',
          en: 'value2',
          required: false,
          desc: '可选，条件2成立时返回的值。',
          accepts: '同结果1。',
          ifOmitted: '省略但前面条件成对齐全时不影响。',
          tip: '与对应条件成对，数量必须相等。',
          example: '"良"',
        },
      ],
    },
    returnValue:
      '返回第一个成立条件对应的结果；若所有条件都不成立则报错 #N/A。',
    examples: [
      {
        title: '示例 1：用 IFS 做四档分级（优 / 良 / 及格 / 不及格）',
        scene: '期末成绩要分四档，嵌套 IF 要数括号，用 IFS 平铺更清楚。',
        dataTsv: IFS_SCORE_TSV,
        dataAnchor: 'A1',
        formula: '=IFS(B2>=90,"优",B2>=80,"良",B2>=60,"及格",TRUE,"不及格")',
        result: '张三 95 → 优；李四 82 → 良；王五 68 → 及格；赵六 55 → 不及格',
        explanation:
          '从上往下判断，命中第一个成立的条件就返回对应结果。最后用 TRUE 兜底，保证所有情况都有返回，否则赵六会出 #N/A。',
      },
      {
        title: '示例 2：按消费金额返回会员档位',
        scene: '给客户按累计金额打标签（钻石 / 黄金 / 白银 / 普通），档位从大到小。',
        dataTsv: IFS_AMT_TSV,
        dataAnchor: 'A1',
        formula: '=IFS(B2>=50000,"钻石",B2>=10000,"黄金",B2>=1000,"白银",TRUE,"普通")',
        result: '甲 12000 → 黄金；乙 3000 → 白银；丙 800 → 普通；丁 50000 → 钻石',
        explanation:
          '档位必须「从大到小」写。B2>=50000 要放在 B2>=10000 前面，否则 50000 会在第一步被 10000 那一档先截走，永远到不了「钻石」。',
      },
    ],
    pitfalls: [
      {
        title: '所有条件都不成立时返回 #N/A，而不是 FALSE / 空白',
        reason:
          'IFS 没有「否则」兜底参数。如果写到最后没有一个条件成立，Excel 直接甩你一个 #N/A，不像 IF 那样还能给个默认值。',
        fix: '在最后补一对 TRUE 兜底：=IFS(B2>=90,"优",B2>=80,"良",TRUE,"其他")。TRUE 永远成立，专门用来兜底。',
        level: 'high',
        errorCode: '#N/A',
      },
      {
        title: '条件顺序写反，大阈值被小阈值先截走',
        reason:
          'IFS 从上往下判断，命中第一个成立的条件就停。如果先写 B2>=60 再写 B2>=90，那么 95 分在第一步 B2>=60 就命中了，永远到不了「优」。',
        fix: '阈值从大到小排：=IFS(B2>=90,"优",B2>=80,"良",B2>=60,"及格")。',
        level: 'high',
      },
      {
        title: '漏写一个值，成对不齐全直接报错',
        reason:
          'IFS 要求「条件、结果」成对出现。只写了条件没写对应结果（或反之），公式会直接报错而无法计算。',
        fix: '每写一对数一下：奇数位是条件、偶数位是结果，数量必须相等。',
        level: 'mid',
        errorCode: '#N/A',
      },
      {
        title: 'Excel 2016 及更早版本没有 IFS（报 #NAME?）',
        reason: 'IFS 是 2019 年才加入的函数，老版本 Excel 不认识它，敲进去会直接 #NAME?。',
        fix: '老版本改用嵌套 IF：=IF(B2>=90,"优",IF(B2>=80,"良",IF(B2>=60,"及格","不及格")))。',
        level: 'mid',
        errorCode: '#NAME?',
      },
    ],
    related: [
      {
        id: 'if',
        kind: 'alternative',
        why: '条件在 3 层以内、或用的是老版本 Excel 时，嵌套 IF 仍然最顺手。',
      },
      {
        id: 'iferror',
        kind: 'companion',
        why: 'IFS 各对里常写公式，配合 IFERROR 可避免某对算错时整体变 #N/A。',
      },
      {
        id: 'and',
        kind: 'companion',
        why: '单个条件需要多个子条件同时成立时，把 AND(...) 塞进对应位置。',
      },
      {
        id: 'or',
        kind: 'companion',
        why: '任一子条件成立时用 OR(...)，同样嵌进对应条件对里。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        {
          key: 'logical_test1',
          label: '条件1',
          type: 'text',
          default: 'B2>=90',
          placeholder: '如 B2>=90',
          hint: '支持 B2>=90、B2="及格"、AND(...) 等。',
        },
        {
          key: 'value1',
          label: '结果1',
          type: 'text',
          default: '"优"',
          placeholder: '如 "优"',
          hint: '文字要加半角双引号。',
        },
        {
          key: 'logical_test2',
          label: '条件2',
          type: 'text',
          default: 'B2>=80',
          placeholder: '如 B2>=80',
          hint: '可选，继续往下写第二对条件。',
        },
        {
          key: 'value2',
          label: '结果2',
          type: 'text',
          default: '"良"',
          placeholder: '如 "良"',
          hint: '可选，条件2成立时返回的值。',
        },
        {
          key: 'else_value',
          label: '兜底值',
          type: 'text',
          default: '"不及格"',
          placeholder: '如 "不及格"',
          hint: '所有条件都不成立时返回的值；留空则报 #N/A。',
        },
      ],
      template: '=IFS({logical_test1},{value1},{logical_test2},{value2},{else_value})',
      cases: [
        {
          label: '✅ 命中第一个条件',
          type: 'ok',
          values: {
            logical_test1: 'B2>=90',
            value1: '"优"',
            logical_test2: 'B2>=80',
            value2: '"良"',
            else_value: '"不及格"',
          },
          expect: '优',
          note: 'B2=95 满足「>=90」，整除第一个条件，返回「优」。',
        },
        {
          label: '❌ 全不成立且无兜底 → #N/A',
          type: 'error',
          values: {
            logical_test1: 'B2>1000',
            logical_test2: 'B2>1000',
            else_value: '',
          },
          expect: '#N/A',
          note: '所有条件都不成立且没有兜底值，IFS 直接返回 #N/A。',
        },
        {
          label: '❌ 双等号 B2==60',
          type: 'error',
          values: {
            logical_test1: 'B2==60',
            value1: '"优"',
            logical_test2: 'B2>=80',
            value2: '"良"',
            else_value: '"不及格"',
          },
          expect: '#NAME?',
          note: 'Excel 判断相等只用单个等号，双等号 == 不是 Excel 语法，报 #NAME?。',
        },
        {
          label: '❌ 中缀 AND B2>60 AND B2<80',
          type: 'error',
          values: {
            logical_test1: 'B2>60 AND B2<80',
            value1: '"优"',
            logical_test2: 'B2>=80',
            value2: '"良"',
            else_value: '"不及格"',
          },
          expect: '#NAME?',
          note: 'Excel 没有中缀 AND 运算符，多条件必须用 AND(...) 包起来，否则 #NAME?。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  iferror: {
    id: 'iferror',
    enName: 'IFERROR',
    zhName: '防错显示',
    zhCommon: ['防错', '错误兜底', '报错替换'],
    alias: ['错误捕获', '容错显示', '出错提示'],
    category: 'logical',
    abbr: 'fcxs',
    pinyin: 'fangcuoxianshi',
    keywords: ['屏蔽错误', '错误替换', 'VLOOKUP防错', '除零保护', '友好显示'],
    difficulty: 2,
    usageLevel: 82,
    version: {
      min: '2007',
      label: '全版本可用（Excel 2007 起）',
    },
    oneLiner: '算错了就显示你指定的内容',
    summary:
      '任何公式都可能因为找不到值、除以零、引用空单元格而甩出 #N/A、#DIV/0! 之类的错误。IFERROR 把「原公式」和「出错时显示什么」打包：算对了就返回原结果，算错了就返回你指定的兜底内容，表格瞬间干净。',
    syntax: {
      patternCn: '=IFERROR(原公式, 出错时显示)',
      patternEn: '=IFERROR(value, value_if_error)',
      args: [
        {
          key: 'value',
          zh: '原公式',
          en: 'value',
          required: true,
          desc: '你要保护的那个公式或单元格，如 VLOOKUP(...) 或 A2/B2。',
          accepts: '任意会返回值的表达式（含引用、运算、嵌套函数）。',
          tip: '直接把整条公式嵌进去，不要先算好再引用，否则错误已经发生、包不住了。',
          example: 'VLOOKUP(F2,A2:C9,3,0)',
          pitfallRank: 1,
        },
        {
          key: 'value_if_error',
          zh: '出错时显示',
          en: 'value_if_error',
          required: true,
          desc: '公式报错时显示的内容。',
          accepts: '带引号的文字、数字、""（空白），甚至另一个公式。',
          tip: '想显示空白就写 ""；想显示「未找到」就写 "未找到"。',
          example: '"未找到"',
        },
      ],
    },
    returnValue:
      '原公式没报错就返回原结果；一旦报错（任何错误类型都算）就返回你指定的兜底值。',
    examples: [
      {
        title: '示例 1：除法被 0 除时显示「无预算」',
        scene: '算预算执行率 = 实际 / 预算，预算为 0 时必然 #DIV/0!，用 IFERROR 变成一句人话。',
        dataTsv: IFERR_D_TSV,
        dataAnchor: 'A1',
        formula: '=IFERROR(C2/B2,"无预算")',
        result: '差旅 = 5000/0 → #DIV/0! → 显示「无预算」；餐饮 = 2800/3000 → 0.933',
        explanation:
          '预算为 0 时除法必然报错，IFERROR 把它变成「无预算」，而不是刺眼的 #DIV/0!。',
      },
      {
        title: '示例 2：VLOOKUP 找不到时显示「未找到」而不是 #N/A',
        scene: '根据工号查姓名，表里没有的工号会报 #N/A，用 IFERROR 接住更友好。',
        dataTsv: IFERR_V_TSV,
        dataAnchor: 'A1',
        formula: '=IFERROR(VLOOKUP("A003",A2:C4,2,0),"未找到")',
        result: '查 A003（表里没有）→ 显示「未找到」；查 A001 → 返回「张三」',
        explanation:
          'VLOOKUP 找不到时本应报 #N/A，被 IFERROR 接住换成你要的文字，页面不再一片红。',
      },
    ],
    pitfalls: [
      {
        title: 'IFERROR 会吞掉所有错误，包括你真正的公式 bug',
        reason:
          'IFERROR 不区分错误类型，不管是 #N/A 还是 #REF! 还是你写错的公式，它一律按「出错」处理并替换。原本能帮你发现问题的报错被悄悄藏起来了。',
        fix: '只想处理「找不到」就用 IFNA；排查阶段先别套 IFERROR，让错误暴露出来。',
        level: 'high',
      },
      {
        title: '把整条公式写在 IFERROR 外面，错误已经发生了',
        reason:
          '如果写成 =IFERROR(A2,0)+B2/C2，错误发生在 B2/C2，它不在 IFERROR 的保护范围内，照样报错。',
        fix: '把会出错的那一段整段嵌进第一个参数：=IFERROR(A2+B2/C2,0)。',
        level: 'mid',
      },
      {
        title: '兜底值写成 0，把「没找到」和「真是 0」混为一谈',
        reason:
          '很多教程让 IFERROR(...,0)，但 0 和「未找到」是不同业务含义，汇总时会被当成真数据累加。',
        fix: '用 "" 或显式文字兜底：=IFERROR(VLOOKUP(...),"未找到")，区分「空」和「零」。',
        level: 'mid',
      },
      {
        title: 'Excel 2003 没有 IFERROR（报 #NAME?）',
        reason: 'IFERROR 从 2007 才开始有，更早的版本敲它会 #NAME?。',
        fix: '老版本改用 =IF(ISERROR(原公式),兜底,原公式)，不过原公式要写两遍。',
        level: 'low',
        errorCode: '#NAME?',
      },
    ],
    related: [
      {
        id: 'iserror',
        kind: 'alternative',
        why: 'Excel 2003 没有 IFERROR，用 =IF(ISERROR(原公式),兜底,原公式) 替代，不过原公式要写两遍。',
      },
      {
        id: 'if',
        kind: 'companion',
        why: 'IF 看条件真假，IFERROR 看公式是否报错，二者配合可做「算错就走另一套逻辑」。',
      },
      {
        id: 'vlookup',
        kind: 'companion',
        why: 'VLOOKUP 找不到值必报 #N/A，几乎是最常用 IFERROR 包裹的场景。',
      },
      {
        id: 'xlookup',
        kind: 'alternative',
        why: 'XLOOKUP 自带第 4 参数直接兜底找不到的情况，很多场景可以省掉 IFERROR。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        {
          key: 'value',
          label: '原公式',
          type: 'text',
          default: 'C2',
          placeholder: '如 B2/C2 或 C2',
          hint: '可填单元格引用、B2/C2 这类简单算式或带引号文本。',
        },
        {
          key: 'value_if_error',
          label: '出错时显示',
          type: 'text',
          default: '"无预算"',
          placeholder: '如 "无预算"',
          hint: '公式报错时显示的内容，文字需加半角双引号。',
        },
      ],
      template: '=IFERROR({value},{value_if_error})',
      cases: [
        {
          label: '✅ 正常返回数字',
          type: 'ok',
          values: {
            value: 'B2+C2',
          },
          expect: '5000',
          note: 'B2=0、C2=5000，0+5000=5000，原公式没报错，正常返回数字。',
        },
        {
          label: '✅ 除零被兜住 → 无预算',
          type: 'ok',
          values: {
            value: 'C2/B2',
          },
          expect: '无预算',
          note: 'C2/B2=5000/0 报 #DIV/0!，被 IFERROR 兜成「无预算」。',
        },
        {
          label: '✅ 坏引用被兜住 → 无预算',
          type: 'ok',
          values: {
            value: 'Z2',
          },
          expect: '无预算',
          note: 'Z2 不在示例范围内（#REF!），被 IFERROR 兜成「无预算」。',
        },
        {
          label: '✅ 字面量除零被兜住 → 无预算',
          type: 'ok',
          values: {
            value: '1/0',
          },
          expect: '无预算',
          note: '1/0 除零报 #DIV/0!，被 IFERROR 兜成「无预算」。',
        },
        {
          label: '❌ 兜底值忘加引号',
          type: 'error',
          values: {
            value: 'C2/B2',
            value_if_error: '无预算',
          },
          expect: '#NAME?',
          note: '兜底值「无预算」没加引号，IFERROR 自己也无法解析，报 #NAME?。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  and: {
    id: 'and',
    enName: 'AND',
    zhName: '与',
    zhCommon: ['并且', '同时满足', '多条件与'],
    alias: ['同时成立', '全部满足', '逻辑与'],
    category: 'logical',
    abbr: 'y',
    pinyin: 'yu',
    keywords: ['多条件判断', '同时满足', '条件组合', 'IF配套', '区间判断'],
    difficulty: 1,
    usageLevel: 70,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
    },
    oneLiner: '所有条件都成立才返回 TRUE',
    summary:
      '当「好几件事必须同时为真」才做某件事时，用 AND 把条件捆成一捆：只有全部成立才返回 TRUE，有一个不成立就是 FALSE。最常见是塞进 IF 里做多条件判断。',
    syntax: {
      patternCn: '=AND(条件1, [条件2], …)',
      patternEn: '=AND(logical1, [logical2], …)',
      args: [
        {
          key: 'logical1',
          zh: '条件1',
          en: 'logical1',
          required: true,
          desc: '第一个要判断的条件。',
          accepts: 'B2>=60 · B2="及格" · A2>B2。',
          ifOmitted: '必填，至少要有一个条件。',
          tip: '最多可放 255 个条件，全部成立才返回 TRUE。',
          example: 'B2>=60',
          pitfallRank: 1,
        },
        {
          key: 'logical2',
          zh: '条件2',
          en: 'logical2',
          required: false,
          desc: '更多条件，全部成立才返回 TRUE。',
          accepts: '同条件1。',
          ifOmitted: '省略就只判断条件1。',
          tip: '条件之间用逗号分隔，不是用「AND」这个词连接。',
          example: 'B2<80',
        },
      ],
    },
    returnValue: '所有条件都成立返回 TRUE，否则返回 FALSE。',
    examples: [
      {
        title: '示例 1：判断分数是否落在 60–80 区间',
        scene: '想筛出「中等」档（60 到 80 之间），单个比较不够，要用 AND 把两个边界捆起来。',
        dataTsv: AND_TSV,
        dataAnchor: 'A1',
        formula: '=AND(B2>=60,B2<80)',
        result: '张三 85 → FALSE（≥80）；王五 72 → TRUE；赵六 92 → FALSE',
        explanation:
          'AND 把「≥60 且 <80」捆成一个判断，两个都成立才返回 TRUE。',
      },
      {
        title: '示例 2：出勤和业绩都达标才算通过',
        scene: '奖金发放要求出勤 ≥80 且业绩 ≥100，缺一不可。',
        dataTsv: AND_TSV2,
        dataAnchor: 'A1',
        formula: '=AND(B2>=80,C2>=100)',
        result: '张三(98,120) → TRUE；李四(60,90) → FALSE；王五(85,60) → FALSE',
        explanation:
          '出勤和业绩都过线才 TRUE，任一不达标即 FALSE，常作为准入判断。',
      },
    ],
    pitfalls: [
      {
        title: '把多个条件写成 B2>60 AND B2<80',
        reason:
          'Excel 没有中缀的 AND 运算符，B2>60 AND B2<80 会被当成乱码报 #NAME?。',
        fix: '用函数包起来：=AND(B2>60,B2<80)，条件之间用逗号。',
        level: 'high',
        errorCode: '#NAME?',
      },
      {
        title: '参数里混进空单元格或文字，结果悄悄变 FALSE',
        reason:
          'AND 只认 TRUE/FALSE。如果某个条件引用的单元格是空白或文字（不能直接算真假），Excel 会把它当成 FALSE 处理，导致整体变 FALSE 却不报错。',
        fix: '确认每个条件引用的都是数字 / 逻辑值；先用 ISNUMBER 排查来源列。',
        level: 'mid',
      },
      {
        title: '错误值会「传染」AND，直接返回错误',
        reason:
          '只要有一个参数是 #N/A、#DIV/0! 等错误值，整个 AND 就跟着报错，而不是返回 FALSE。这点和「返回 FALSE」的直觉相反。',
        fix: '用 IFERROR(AND(...),FALSE) 兜底，或先确保各条件本身不出错。',
        level: 'mid',
      },
    ],
    related: [
      {
        id: 'or',
        kind: 'confusable',
        why: 'AND 是「全部成立」，OR 是「任一成立」，选错关系整个判断就反了。',
      },
      {
        id: 'if',
        kind: 'companion',
        why: 'AND 通常塞进 IF 的第一个参数做多条件判断：=IF(AND(...),达成,未达成)。',
      },
      {
        id: 'not',
        kind: 'companion',
        why: '要表达「不满足某条件」时用 NOT 取反，如 NOT(A2="完成")。',
      },
      {
        id: 'ifs',
        kind: 'companion',
        why: '多档分级且每层都要多个子条件时，把 AND(...) 写进 IFS 的各对条件里。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        {
          key: 'logical1',
          label: '条件1',
          type: 'text',
          default: 'B2>=60',
          placeholder: '如 B2>=60',
          hint: '支持 B2>=60、B2="及格"、AND(...) 等。',
        },
        {
          key: 'logical2',
          label: '条件2',
          type: 'text',
          default: 'B2<80',
          placeholder: '如 B2<80',
          hint: '可选，两个条件都成立才返回 TRUE。',
        },
      ],
      template: '=AND({logical1},{logical2})',
      cases: [
        {
          label: '✅ 两条件都成立 → TRUE',
          type: 'ok',
          values: {
            logical1: 'B4>=60',
            logical2: 'B4<80',
          },
          expect: 'TRUE',
          note: 'B4=72 落在 60–80 区间，两个条件都成立，AND 返回 TRUE。',
        },
        {
          label: '✅ 有一条件不成立 → FALSE',
          type: 'ok',
          values: {
            logical1: 'B2>=60',
            logical2: 'B2<80',
          },
          expect: 'FALSE',
          note: 'B2=85 不满足 <80，AND 返回 FALSE。',
        },
        {
          label: '❌ 双等号 B2==60',
          type: 'error',
          values: {
            logical1: 'B2==60',
            logical2: 'B2<80',
          },
          expect: '#NAME?',
          note: '双等号 == 不是 Excel 语法，报 #NAME?。',
        },
        {
          label: '❌ 中缀 AND B2>=60 AND B2<80',
          type: 'error',
          values: {
            logical1: 'B2>=60 AND B2<80',
            logical2: 'B2<80',
          },
          expect: '#NAME?',
          note: 'Excel 没有中缀 AND 运算符，应写成 AND(...)，否则 #NAME?。',
        },
        {
          label: '❌ 坏单元格引用 Z2',
          type: 'error',
          values: {
            logical1: 'Z2>=60',
            logical2: 'B2<80',
          },
          expect: '#REF!',
          note: 'Z2 不在示例数据范围内，引用无效，报 #REF!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  or: {
    id: 'or',
    enName: 'OR',
    zhName: '或',
    zhCommon: ['或者', '任一满足', '多条件或'],
    alias: ['任一成立', '满足其一', '逻辑或'],
    category: 'logical',
    abbr: 'h',
    pinyin: 'huo',
    keywords: ['多条件判断', '任一满足', '条件组合', 'IF配套', '范围判断'],
    difficulty: 1,
    usageLevel: 65,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
    },
    oneLiner: '任一条件成立就返回 TRUE',
    summary:
      '当「只要有一件事为真」就算通过时，用 OR 把条件摊开：任意一个成立就返回 TRUE，全部不成立才返回 FALSE。和 AND 互补，常一起塞进 IF。',
    syntax: {
      patternCn: '=OR(条件1, [条件2], …)',
      patternEn: '=OR(logical1, [logical2], …)',
      args: [
        {
          key: 'logical1',
          zh: '条件1',
          en: 'logical1',
          required: true,
          desc: '第一个要判断的条件。',
          accepts: 'B2="及格" · B2>=90 · A2>B2。',
          ifOmitted: '必填，至少要有一个条件。',
          tip: '最多可放 255 个条件，任一成立即返回 TRUE。',
          example: 'B2="及格"',
          pitfallRank: 1,
        },
        {
          key: 'logical2',
          zh: '条件2',
          en: 'logical2',
          required: false,
          desc: '更多条件，任一成立就返回 TRUE。',
          accepts: '同条件1。',
          ifOmitted: '省略就只判断条件1。',
          tip: '条件之间用逗号分隔，不是用「OR」这个词连接。',
          example: 'B2="补考"',
        },
      ],
    },
    returnValue: '任一条件成立返回 TRUE，全部不成立才返回 FALSE。',
    examples: [
      {
        title: '示例 1：状态是「及格」或「补考」就算需关注',
        scene: '想挑出还没彻底结束的人，状态命中「及格」或「补考」任一即 TRUE。',
        dataTsv: OR_TSV,
        dataAnchor: 'A1',
        formula: '=OR(B2="及格",B2="补考")',
        result: '张三(及格) → TRUE；李四(补考) → TRUE；王五(缺考) → FALSE；赵六(及格) → TRUE',
        explanation:
          '只要命中「及格」或「补考」任一状态就 TRUE，用来筛出还需要关注的人。',
      },
      {
        title: '示例 2：单科有一门上 90 即选中',
        scene: '「偏科特长生」筛选：语文或数学任一 ≥90 就算。',
        dataTsv: OR_TSV2,
        dataAnchor: 'A1',
        formula: '=OR(B2>=90,C2>=90)',
        result: '张三(85,90) → TRUE（数学90）；李四(40,55) → FALSE；王五(95,30) → TRUE（语文95）',
        explanation:
          '单科有一门上 90 即 TRUE，常用于「至少一项突出」的筛选。',
      },
    ],
    pitfalls: [
      {
        title: '写成 B2="及格" OR B2="补考"',
        reason: '同 AND，Excel 没有中缀 OR 运算符，直接写会报 #NAME?。',
        fix: '=OR(B2="及格",B2="补考")，条件之间用逗号。',
        level: 'high',
        errorCode: '#NAME?',
      },
      {
        title: '把 OR 当「两列取其一显示」用',
        reason:
          'OR 只返回 TRUE/FALSE，并不会挑出「哪个条件的值」给你。很多人误以为 OR(A2,B2) 会返回 A2 或 B2 中非空的那一个。',
        fix: '要取非空值用 =IF(A2<>"",A2,B2) 或 IFERROR，OR 只负责判断。',
        level: 'mid',
      },
      {
        title: '错误值传染 OR，直接报错',
        reason:
          '任一参数是错误值时，OR 直接跟着报错，而不是返回 FALSE。',
        fix: '用 IFERROR(OR(...),FALSE) 兜底，或先确保各条件本身不出错。',
        level: 'mid',
      },
    ],
    related: [
      {
        id: 'and',
        kind: 'confusable',
        why: 'OR 是「任一成立」，AND 是「全部成立」，关系选反结果全错。',
      },
      {
        id: 'if',
        kind: 'companion',
        why: '塞进 IF 做「满足任一即通过」：=IF(OR(...),通过,不通过)。',
      },
      {
        id: 'not',
        kind: 'companion',
        why: '要对 OR 的结果取反（都不成立才算通过）用 NOT(OR(...))。',
      },
      {
        id: 'ifs',
        kind: 'companion',
        why: 'IFS 各对条件里可嵌入 OR(...) 表达「某档命中多种情况之一」。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        {
          key: 'logical1',
          label: '条件1',
          type: 'text',
          default: 'B2="及格"',
          placeholder: '如 B2="及格"',
          hint: '支持 B2="及格"、B2>=90 等。',
        },
        {
          key: 'logical2',
          label: '条件2',
          type: 'text',
          default: 'B2="补考"',
          placeholder: '如 B2="补考"',
          hint: '可选，任一条件成立即返回 TRUE。',
        },
      ],
      template: '=OR({logical1},{logical2})',
      cases: [
        {
          label: '✅ 任一条件成立 → TRUE',
          type: 'ok',
          values: {
            logical1: 'B2="及格"',
          },
          expect: 'TRUE',
          note: 'B2=及格，满足第一个条件，OR 返回 TRUE。',
        },
        {
          label: '✅ 都不成立 → FALSE',
          type: 'ok',
          values: {
            logical1: 'B4="及格"',
            logical2: 'B4="补考"',
          },
          expect: 'FALSE',
          note: 'B4=缺考，两个条件都不成立，OR 返回 FALSE。',
        },
        {
          label: '❌ 双等号 B2=="及格"',
          type: 'error',
          values: {
            logical1: 'B2=="及格"',
          },
          expect: '#NAME?',
          note: '双等号 == 不是 Excel 语法，报 #NAME?。',
        },
        {
          label: '❌ 中缀 OR B2="及格" OR B2="补考"',
          type: 'error',
          values: {
            logical1: 'B2="及格" OR B2="补考"',
          },
          expect: '#NAME?',
          note: 'Excel 没有中缀 OR 运算符，应写成 OR(...)，否则 #NAME?。',
        },
        {
          label: '❌ 坏单元格引用 Z2',
          type: 'error',
          values: {
            logical1: 'Z2="及格"',
          },
          expect: '#REF!',
          note: 'Z2 不在示例数据范围内，引用无效，报 #REF!。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },

  not: {
    id: 'not',
    enName: 'NOT',
    zhName: '非',
    zhCommon: ['取反', '反相', '否定'],
    alias: ['逻辑非', '翻转真假', '条件反着判'],
    category: 'logical',
    abbr: 'f',
    pinyin: 'fei',
    keywords: ['结果取反', '条件否定', 'TRUE转FALSE', '状态反转', 'IF配套'],
    difficulty: 1,
    usageLevel: 45,
    version: {
      min: 'all',
      label: '全版本可用（Excel 2003 起）',
    },
    oneLiner: '把 TRUE 变 FALSE、FALSE 变 TRUE',
    summary:
      '只需要「反过来」判断时用 NOT：把 TRUE 翻成 FALSE、FALSE 翻成 TRUE。常和 IS 系列函数（ISBLANK、ISNUMBER、ISERROR）搭着用，表达「不是空白」「不是数字」这类否定条件。',
    syntax: {
      patternCn: '=NOT(条件)',
      patternEn: '=NOT(logical)',
      args: [
        {
          key: 'logical',
          zh: '条件',
          en: 'logical',
          required: true,
          desc: '一个能算出 TRUE/FALSE 的判断或逻辑值。',
          accepts: 'ISBLANK(A2) · A2="完成" · AND(...) · OR(...)。',
          ifOmitted: '必填。',
          tip: 'NOT 只翻真假，不能直接把数字变负（那是 -A2）。',
          example: 'ISBLANK(A2)',
          pitfallRank: 1,
        },
      ],
    },
    returnValue: '把传入的逻辑值取反：TRUE 变 FALSE，FALSE 变 TRUE。',
    examples: [
      {
        title: '示例 1：标记「未完成」的任务',
        scene: '状态列里只有「完成」算搞定，其余（含空白）都算还没搞定。',
        dataTsv: NOT_TSV,
        dataAnchor: 'A1',
        formula: '=NOT(B2="完成")',
        result: '甲(完成) → FALSE；乙(进行中) → TRUE；丙(空) → TRUE；丁(完成) → FALSE',
        explanation:
          'NOT 把「完成」翻成 FALSE，其余状态（含空白）都算 TRUE，用来挑出还没搞定的任务。',
      },
      {
        title: '示例 2：筛出「不是数字」的脏数据',
        scene: '编号列本该都是数字，混进文字或空白就是脏数据，用 NOT(ISNUMBER(...)) 定位。',
        dataTsv: NOT_TSV2,
        dataAnchor: 'A1',
        formula: '=NOT(ISNUMBER(B2))',
        result: 'A1(100) → FALSE；A2(文本) → TRUE；A3(200) → FALSE；A4(空) → TRUE',
        explanation:
          'ISNUMBER 判断是不是数字，NOT 把它反过来，TRUE 即「不是数字」，快速定位脏数据。',
      },
    ],
    pitfalls: [
      {
        title: '把 NOT 当成「取负数」',
        reason:
          'NOT(5) 并不是 -5。Excel 会把 5 当成 TRUE（非零即真），NOT(TRUE) 返回 FALSE，也就是 0。',
        fix: '要取负数写 -A2；NOT 只翻逻辑真假。',
        level: 'mid',
      },
      {
        title: 'NOT(A2="完成") 与「未完成」的空值边界',
        reason:
          'NOT(状态="完成") 在状态为空时返回 TRUE。如果你以为「未完成」不含空值，逻辑上就漏了。',
        fix: '明确要不要把空白算进来，需要排除空白就写 AND(A2<>"",A2<>"完成")。',
        level: 'mid',
      },
      {
        title: '错误值直接传染 NOT',
        reason: 'NOT 的参数是错误值时，结果也是错误而不是 FALSE。',
        fix: '用 IFERROR(NOT(...),TRUE) 之类兜底，或先确认来源不出错。',
        level: 'low',
      },
      {
        title: '直接写 NOT(A2) 而 A2 是文字',
        reason:
          'NOT 要求逻辑值。A2 是文字（如「完成」）不是 TRUE/FALSE，NOT 会报 #VALUE!。',
        fix: '先变成判断式：NOT(A2="完成")，而不是 NOT(A2)。',
        level: 'mid',
        errorCode: '#VALUE!',
      },
    ],
    related: [
      {
        id: 'and',
        kind: 'companion',
        why: 'NOT(AND(...)) 表达「不全部满足」，即至少有一个不满足。',
      },
      {
        id: 'or',
        kind: 'companion',
        why: 'NOT(OR(...)) 表达「全都不满足」，德摩根定律常在这对里用。',
      },
      {
        id: 'if',
        kind: 'companion',
        why: 'NOT 常作为 IF 的条件：=IF(NOT(ISBLANK(A2)),"有值","空")。',
      },
      {
        id: 'isblank',
        kind: 'companion',
        why: 'NOT(ISBLANK(A2)) 是「非空」最常用写法，比 A2<>"" 更稳。',
      },
    ],
    calc: {
      enabled: true,
      ranges: {},
      fields: [
        {
          key: 'logical_test',
          label: '条件',
          type: 'text',
          default: 'B2="完成"',
          placeholder: '如 B2="完成"',
          hint: '支持 B2="完成"、AND(...)、OR(...) 等。',
        },
      ],
      template: '=NOT({logical_test})',
      cases: [
        {
          label: '✅ 条件为假 → NOT 取反得 TRUE',
          type: 'ok',
          values: {
            logical_test: 'B3="完成"',
          },
          expect: 'TRUE',
          note: 'B3=进行中，"进行中"="完成" 为 FALSE，NOT 取反得 TRUE。',
        },
        {
          label: '✅ 条件为真 → NOT 取反得 FALSE',
          type: 'ok',
          values: {
            logical_test: 'B2="完成"',
          },
          expect: 'FALSE',
          note: 'B2=完成，条件为 TRUE，NOT 取反得 FALSE。',
        },
        {
          label: '❌ 直接写单元格 A2',
          type: 'error',
          values: {
            logical_test: 'A2',
          },
          expect: '#NAME?',
          note: 'A2 是文本、没有比较符，不是合法条件，报 #NAME?。', },
        {
          label: '❌ 文本忘加引号 B2=完成',
          type: 'error',
          values: {
            logical_test: 'B2=完成',
          },
          expect: '#NAME?',
          note: '返回文字「完成」忘了加引号，应写成 B2="完成"，否则 #NAME?。',
        },
        {
          label: '❌ 双等号 B2=="完成"',
          type: 'error',
          values: {
            logical_test: 'B2=="完成"',
          },
          expect: '#NAME?',
          note: '双等号 == 不是 Excel 语法，报 #NAME?。',
        },
      ],
    },
    meta: {
      updatedAt: '2026-08-30',
      status: 'published',
      customEdited: false,
    },
  },
};

export default pack;
