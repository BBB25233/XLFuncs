import type { FunctionEntry } from '@/types';

/**
 * IF · 条件判断（第一版 5 个样板函数之一）
 * 写作口径：PRD §10.4 / §10.5.2，增补件 §4
 *
 * 关于示例数据：三张统一样表（员工 / 销售 / 考勤）里没有「成绩」字段，
 * 因此按 team-lead 决策（B6 / U3）允许用 dataTsv 承载 4 行最小自定义小表。
 */

/** 成绩小表：4 行数据，表头占第 1 行，数据在第 2–5 行 */
const SCORE_TSV = '姓名\t分数\n张三\t85\n李四\t59\n王五\t72\n赵六\t60';

/**
 * 生成指定层数的嵌套 IF，用于演示「嵌套超过 64 层会报错」。
 * @param levels 嵌套层数
 */
function nestIf(levels: number): string {
  let expr = '"深"';
  for (let i = 0; i < levels; i += 1) {
    expr = `IF(B2>=60,${expr},"深")`;
  }
  return expr;
}

const ifEntry: FunctionEntry = {
  id: 'if',
  enName: 'IF',
  zhName: '条件判断',
  zhCommon: ['如果', '判断', '分支'],
  alias: ['打标签', '达标判断', '及格判断'],
  category: 'logical',
  abbr: 'tjpd',
  pinyin: 'tiaojianpanduan',
  keywords: [
    '条件判断',
    '达标判断',
    '及格不及格',
    '打标签',
    '多条件判断',
    '嵌套判断',
    '返回FALSE',
  ],
  difficulty: 1,
  usageLevel: 99,
  version: {
    min: 'all',
    label: '全版本可用（Excel 2003 起）',
    notes: 'Excel 最多允许嵌套 64 层 IF；超过 3 层建议改用 IFS（需 Excel 2019 及以上）或查表法。',
  },
  oneLiner: '满足条件就给一个结果，不满足给另一个',
  summary:
    '给数据「打标签」时第一个想到的就是它：成绩 ≥60 判及格、金额 >1 万标大额、日期过期标红色。条件成立返回第二个参数，不成立返回第三个参数；第三个参数可以省略，但省略后条件不成立时返回的是 FALSE，不是空白。',
  syntax: {
    patternCn: '=IF(条件, 成立时返回, [不成立时返回])',
    patternEn: '=IF(logical_test, [value_if_true], [value_if_false])',
    args: [
      {
        key: 'logical_test',
        zh: '条件',
        en: 'logical_test',
        required: true,
        desc: '一个能算出 TRUE 或 FALSE 的判断式。',
        accepts: 'B2>=60 · B2="及格" · AND(B2>=60,B2<80) · OR(B2<60,B2>90)。',
        ifOmitted: '这是必填参数，省略公式无法成立。',
        tip: '比较用单个等号 =，不是编程里的 ==。多个条件必须写成 AND(...) 或 OR(...)，不能直接写「A1>60 AND A1<80」。',
        example: 'B2>=60',
      },
      {
        key: 'value_if_true',
        zh: '成立时返回',
        en: 'value_if_true',
        required: true,
        desc: '条件成立时你要的结果。',
        accepts: '带引号的文字、数字、单元格引用，甚至另一个 IF（就是嵌套）。',
        ifOmitted: '省略且条件成立时，返回 0。',
        tip: '返回文字一定要加半角双引号，写 及格 而不是 "及格" 会报 #NAME?。',
        example: '"及格"',
        pitfallRank: 2,
      },
      {
        key: 'value_if_false',
        zh: '不成立时返回',
        en: 'value_if_false',
        required: false,
        desc: '条件不成立时你要的结果。',
        accepts: '同「成立时返回」。',
        ifOmitted: '【常见坑】省略且条件不成立时，返回 FALSE，不是空白。想显示空白要显式写 ""。',
        tip: '不想要任何显示就写 ""（一对紧挨的半角双引号），不要留空。',
        example: '"不及格"',
        pitfallRank: 1,
      },
    ],
  },
  returnValue: '返回你指定的那个值；条件不成立且省略第三参数时返回 FALSE。',
  examples: [
    {
      title: '示例 1：成绩 ≥ 60 判「及格」，否则「不及格」',
      scene: '期末成绩表出来了，要在一列里给每个人标上及格还是不及格。',
      dataTsv: SCORE_TSV,
      dataAnchor: 'A1',
      formula: '=IF(B2>=60,"及格","不及格")',
      result: '张三 85 分 → 及格；李四 59 分 → 不及格；赵六 60 分 → 及格',
      explanation: '先算条件 B2>=60，成立返回第一个值，不成立返回第二个。≥ 是「大于等于」，所以 60 分算及格。',
    },
    {
      title: '示例 2：嵌套三层做等级划分',
      scene: '及格不够用，要分优 / 良 / 及格 / 不及格四档，就得一层层往下判。',
      dataTsv: SCORE_TSV,
      dataAnchor: 'A1',
      formula: '=IF(B2>=90,"优",IF(B2>=80,"良",IF(B2>=60,"及格","不及格")))',
      result: '张三 85 → 良；王五 72 → 及格；李四 59 → 不及格',
      explanation:
        'IF 从外往里一层层判断，命中哪一层就返回哪一层的值，后面的不再计算。所以判断顺序要从大到小（先 ≥90 再 ≥80）。',
    },
    {
      title: '示例 3：与 AND / OR 组合做多条件判断',
      scene: '只想挑出「60 到 80 之间」的那一档，这时单个条件不够，要用 AND 把两个条件捆起来。',
      dataTsv: SCORE_TSV,
      dataAnchor: 'A1',
      formula: '=IF(AND(B2>=60,B2<80),"中等偏上","其他")',
      result: '王五 72 → 中等偏上；张三 85 → 其他；赵六 60 → 中等偏上',
      explanation:
        '多条件必须写成 AND(条件1,条件2)。直接写 B2>=60 AND B2<80 会报 #NAME?——这是从编程语言转过来的人最容易踩的坑。',
    },
  ],
  pitfalls: [
    {
      title: '条件写成 B2==60（编程习惯的双等号）',
      reason: 'Excel 里判断相等只用单个等号 =。双等号 == 不是 Excel 的语法，它会被当成未知内容。',
      fix: '写成 B2=60。判断不相等用 <>，如 B2<>60。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '返回的文字忘了加引号',
      reason: '不加引号的中文会被 Excel 当作「定义的名称」去找，找不到就报 #NAME?。',
      fix: '写成 "及格"。数字和 TRUE / FALSE 不用加引号，文字一律要加。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '多条件写成 IF(B2>60 AND B2<80, …)',
      reason: 'Excel 里没有「AND」这个中缀运算符。多条件必须用函数 AND() 或 OR() 包起来。',
      fix: '写成 IF(AND(B2>60,B2<80),"中等","其他")。条件之间用逗号隔开，不是用 AND 连接。',
      level: 'high',
      errorCode: '#NAME?',
    },
    {
      title: '嵌套层数过深（超过 64 层）',
      reason: 'Excel 对 IF 的嵌套层数有硬上限 64 层，超了公式直接不接受。而且十几层的 IF 已经没人看得懂了。',
      fix: '超过 3 层就改用 IFS（Excel 2019 及以上）或 LOOKUP 查表法，把等级对照表单独放一列。',
      level: 'low',
    },
    {
      title: '第三参数省略且条件不成立，返回 FALSE 而不是空白',
      reason:
        'IF 的第三参数可以省略，但省略不等于「什么都不显示」，Excel 会老老实实返回逻辑值 FALSE。很多人以为是公式写错了。',
      fix: '想显示空白就显式写 ""：=IF(B2>=60,"及格","")。',
      level: 'mid',
    },
  ],
  related: [
    {
      id: 'ifs',
      kind: 'alternative',
      why: '条件超过 3 层时改用 IFS，写法平铺、不用一层层数括号（需 Excel 2019 / 2021 或 Microsoft 365）。',
    },
    {
      id: 'and',
      kind: 'companion',
      why: '多条件同时成立用 AND，任一成立用 OR，别在 IF 里直接写「并且」「或者」。',
    },
    {
      id: 'iferror',
      kind: 'confusable',
      why: 'IFERROR 只看「公式有没有报错」，IF 只看「条件成不成立」，是两件事，别互相替代。',
    },
    {
      id: 'sumifs',
      kind: 'confusable',
      why: '要按条件汇总金额，直接用 SUMIFS，不要先套一列 IF 再求和——多此一举还容易错。',
    },
  ],
  calc: {
    enabled: true,
    ranges: {
      name_col: 'A2:A5',
      score_col: 'B2:B5',
    },
    fields: [
      {
        key: 'logical_test',
        label: '条件',
        type: 'text',
        default: 'B2>=60',
        placeholder: '如 B2>=60',
        hint: '支持 B2>=60、B2="及格"、AND(B2>=60,B2<80)、OR(...)。',
      },
      {
        key: 'value_if_true',
        label: '成立时返回',
        type: 'text',
        default: '"及格"',
        placeholder: '如 "及格"',
        hint: '文字要加半角双引号，数字不用。',
      },
      {
        key: 'value_if_false',
        label: '不成立时返回',
        type: 'text',
        default: '"不及格"',
        placeholder: '如 "不及格"',
        hint: '留空可以复现「返回 FALSE 而不是空白」这个坑。',
      },
    ],
    template: '=IF({logical_test},{value_if_true},{value_if_false})',
    cases: [
      {
        label: '✅ 正确写法',
        type: 'ok',
        values: {
          logical_test: 'B2>=60',
          value_if_true: '"及格"',
          value_if_false: '"不及格"',
        },
        expect: '及格',
        note: 'B2 是张三的 85 分，条件成立，返回「及格」。',
      },
      {
        label: '✅ AND 组合多条件',
        type: 'ok',
        values: {
          logical_test: 'AND(B2>=70,B2<90)',
          value_if_true: '"良好"',
          value_if_false: '"其他"',
        },
        expect: '良好',
        note: '85 分落在 70–90 之间，AND 的两个条件都成立，返回「良好」。',
      },
      {
        label: '❌ 双等号 B2==60',
        type: 'error',
        values: {
          logical_test: 'B2==60',
          value_if_true: '"及格"',
          value_if_false: '"不及格"',
        },
        expect: '#NAME?',
        note: '意思：Excel 不认识你写的东西。判断相等只用单个等号，写成 B2=60。',
      },
      {
        label: '❌ 返回文字忘了加引号',
        type: 'error',
        values: {
          logical_test: 'B2>=60',
          value_if_true: '及格',
          value_if_false: '"不及格"',
        },
        expect: '#NAME?',
        note: '意思：Excel 把「及格」当成一个名称去查找。文字一律加半角双引号，写成 "及格"。',
      },
      {
        label: '❌ 多条件直接写 AND',
        type: 'error',
        values: {
          logical_test: 'B2>=60 AND B2<80',
          value_if_true: '"中等"',
          value_if_false: '"其他"',
        },
        expect: '#NAME?',
        note: '意思：Excel 没有中缀的 AND 运算符。写成 AND(B2>=60,B2<80)，条件之间用逗号。',
      },
      {
        label: '❌ 第三参数留空',
        type: 'error',
        values: {
          logical_test: 'B3>=60',
          value_if_true: '"及格"',
          value_if_false: '',
        },
        expect: 'FALSE',
        note: 'Excel 不会报错，但这个结果可能不是你要的：B3 是李四的 59 分，条件不成立且第三参数省略，返回的是 FALSE 而不是空白。想显示空白要显式写 ""。',
      },
      {
        label: '❌ 嵌套超过 64 层',
        type: 'error',
        values: {
          logical_test: 'B2>=60',
          value_if_true: nestIf(65),
          value_if_false: '"不及格"',
        },
        expect: '#VALUE!',
        note: '意思：公式结构不合法。Excel 对 IF 的嵌套上限是 64 层，这里是 65 层。超过 3 层就应该改用 IFS 或查表法。',
      },
    ],
    engine: 'builtin',
  },
  meta: {
    updatedAt: '2025-01-15',
    status: 'published',
    customEdited: false,
  },
};

export default ifEntry;
