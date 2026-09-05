/* =========================================================================
 * Excel 函数速查 · 全站唯一类型真源
 * 所有类型只从这里导出，禁止在各层里重复定义。
 * 与 PRD §6.2 草案字段的差异见 ARCHITECTURE.md §8.2（以架构文档与 team-lead 决策为准）。
 * ========================================================================= */

/* =========================================================================
 * 0. 基础别名
 * ========================================================================= */

/** 12 个分类 id（第一版 v1.0 在 PRD §7.1 的 10 类基础上新增 compatibility / lambda） */
export type CategoryId =
  | 'logical'
  | 'text'
  | 'datetime'
  | 'lookup'
  | 'math'
  | 'statistical'
  | 'financial'
  | 'information'
  | 'engineering'
  | 'database'
  | 'compatibility'
  | 'lambda';

/** 三张统一业务样表 id（PRD §10.5.1） */
export type SampleTableId = 'employee' | 'sales' | 'attendance';

/** 内容发布状态：draft = 内容待补充（55 个占位函数） */
export type EntryStatus = 'published' | 'draft';

/** 踩坑频率 */
export type PitfallLevel = 'high' | 'mid' | 'low';

/** 相关函数的关系类型 */
export type RelatedKind = 'confusable' | 'alternative' | 'companion';

/** 难度星级 1–5 */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** Excel 最低可用版本代号 */
export type ExcelMinVersion =
  | 'all' // 全部版本（Excel 2003 起）
  | '2007' // Excel 2007 起
  | '2010' // Excel 2010 起（MODE.SNGL / RANK.EQ / PERCENTILE.INC / QUARTILE.INC / STDEV.S / VAR.S 等）
  | '2013' // Excel 2013 起（COMBINA / BASE / DECIMAL / ARABIC / CEILING.MATH / FLOOR.MATH 等）
  | '2016' // Excel 2016 起（FORECAST.LINEAR 等）
  | '2019' // Excel 2019 / 2021 / Microsoft 365
  | '365'; // 仅 Microsoft 365 / Excel 2021 及以上

/* =========================================================================
 * 1. 版本与兼容性（team-lead Q9 决策的落地字段）
 * ========================================================================= */

export interface VersionInfo {
  /** 精确的最低可用版本代号 */
  min: ExcelMinVersion;
  /**
   * 展示用文案，按 team-lead 口径措辞：
   * XLOOKUP / UNIQUE → '需 Microsoft 365 或 Excel 2021 及以上，旧版无此函数'
   * TEXTJOIN / CONCAT / IFS → '需 Excel 2019 / 2021 或 Microsoft 365，Excel 2016 及更早版本无此函数'
   */
  label: string;
  /**
   * 旧版替代写法 —— team-lead 明确要求：新函数必须给出。
   * 例：XLOOKUP → { expr: '=INDEX(B2:B9,MATCH(F2,A2:A9,0))', note: '用 INDEX+MATCH 组合，功能等价，全版本可用' }
   */
  legacyAlternative?: {
    /** 可直接复制的替代公式 */
    expr: string;
    /** 一句人话：什么时候用它、有没有功能损失 */
    note: string;
  };
  /** 附加提示，如 DATEDIF 的隐藏函数提示、UNIQUE / FILTER 的动态数组溢出提示 */
  notes?: string;
}

/* =========================================================================
 * 2. 参数说明 —— ArgItem
 * ========================================================================= */

export interface ArgItem {
  /** 参数占位 key，与 syntax.patternCn / patternEn 中的 {key} 一一对应 */
  key: string;
  /** 参数中文名，如 '查找值' */
  zh: string;
  /** 参数英文名，如 'lookup_value' */
  en: string;
  /** 是否必填。选填参数在语法行里必须用 [ ] 包起来 */
  required: boolean;
  /** ① 填什么：一句话说明 */
  desc: string;
  /** ② 能填什么：枚举常见取值，如 '0 精确匹配 / 1 模糊匹配 / TRUE / FALSE' */
  accepts?: string;
  /** ③ 不填会怎样：如 '省略等于模糊匹配，要求首列已升序排序' */
  ifOmitted?: string;
  /** ④ 填错会怎样 / 小技巧 */
  tip?: string;
  /** 该参数的一个填空样例，如 '$A$2:$C$100' */
  example?: string;
  /**
   * 踩坑排名：1 = 最常填错的参数。
   * PRD §10.5.2：参数超过 4 个时必须标注。
   */
  pitfallRank?: number;
}

/* =========================================================================
 * 3. 示例 —— ExampleItem
 * ========================================================================= */

export interface ExampleItem {
  /** 场景标题，如 '示例 1：按工号查姓名（精确匹配）' */
  title: string;
  /** 场景描述：一段话讲清「什么情况下你会遇到这个问题」 */
  scene: string;
  /**
   * 优先引用三张统一样表之一（PRD §10.5.1）。
   * 与 dataTsv 二选一：有 tableId 就用样表，没覆盖到的场景才用 dataTsv。
   */
  tableId?: SampleTableId;
  /** 自定义小表：制表符分隔、\n 分行，含表头。仅当三张样表覆盖不到时使用 */
  dataTsv?: string;
  /** 数据在表格中的起始单元格，用于说明相对引用，如 'A1'（表头所在行） */
  dataAnchor: string;
  /** 公式原文，以 '=' 开头 */
  formula: string;
  /** 结果（文本描述），如 '在 F2 输入 A002 时，返回「李四」' */
  result: string;
  /** 一句话记忆点：这个公式在算什么 */
  explanation: string;
}

/* =========================================================================
 * 4. 注意事项 —— PitfallItem
 * ========================================================================= */

export interface PitfallItem {
  /** 错在哪（现象），如 '第 4 参数忘了写，结果不对但不报错' */
  title: string;
  /** 为什么会错 */
  reason: string;
  /** 怎么改（给可直接抄的公式） */
  fix: string;
  /** 踩坑频率，用于排序：high 优先展示 */
  level: PitfallLevel;
  /** 关联的错误码（若有），如 '#N/A'。用于在页面上以等宽红字高亮 */
  errorCode?: string;
}

/** 相关函数推荐 */
export interface RelatedItem {
  /** 目标函数的 id */
  id: string;
  /** 关系类型 */
  kind: RelatedKind;
  /** 一句「什么时候该用它而不是这个」 */
  why: string;
}

/* =========================================================================
 * 5. 在线试算 —— CalcSpec
 * ========================================================================= */

/** 试算表单字段类型 */
export type CalcFieldType =
  | 'text' // 自由文本（会自动补引号）
  | 'number' // 数字
  | 'select' // 下拉枚举
  | 'ref' // 区域引用，如 A2:C9
  | 'readonly'; // 只读展示

/** 试算表单的一个字段 */
export interface CalcField {
  /** 与 calc.template 中 {key} 对应的 key */
  key: string;
  /** 中文标签，如 '查找值' */
  label: string;
  type: CalcFieldType;
  /** type='select' 时的枚举项 */
  options?: { label: string; value: string }[];
  /** 默认值（字符串，数字也用字符串存，避免 0 与空串歧义） */
  default: string;
  /** 输入框占位提示 */
  placeholder?: string;
  /** 字段下方的一行小字说明 */
  hint?: string;
  /** type='ref' 时，指向 calc.ranges 中的语义名，如 'table_array' */
  rangeKey?: string;
}

/** 预置用例（含正确演示与错误演示） */
export interface CalcCase {
  /** 按钮文案，如 '❌ 第 4 参数改成 1（模糊匹配）' */
  label: string;
  /** ok = 正确示例；error = 错误演示 */
  type: 'ok' | 'error';
  /** 各参数取值（键为 CalcField.key） */
  values: Record<string, string>;
  /** 预期结果：成功时是结果值，错误时是错误码。仅用于自测与文档，不参与运行判断 */
  expect: string;
  /** 人话解释 / 修复建议 —— 结果区会原样展示这一段 */
  note: string;
}

/** 在线试算配置 */
export interface CalcSpec {
  /** 是否开放试算（55 个占位函数设为 false） */
  enabled: boolean;
  /** 试算使用的样表；省略则回退到 examples[0].dataTsv */
  sampleTableId?: SampleTableId;
  /**
   * 语义名 → 区域引用。
   * 例：{ table_array: 'A2:C9', lookup_col: 'A2:A9', return_col: 'B2:B9' }
   * 好处：换样表时只改这里，公式模板和计算实现都不用动。
   */
  ranges: Record<string, string>;
  /** 试算表单字段（顺序即渲染顺序） */
  fields: CalcField[];
  /** 公式拼装模板，占位符为 {key} */
  template: string;
  /** 预置用例：至少 1 个 ok + ≥3 个 error */
  cases: CalcCase[];
  /** 预留：将来若要接入第三方引擎，可在此声明引擎名，registry 按此分派 */
  engine?: 'builtin';
}

/* =========================================================================
 * 6. 附加板块（TEXT 的格式代码速查表等）
 * ========================================================================= */

export interface ExtraBlock {
  /** 板块标题，如 '常用格式代码速查' */
  title: string;
  /** 表格表头，如 ['代码', '作用', '示例结果'] */
  header: string[];
  /** 数据行，行数 ≥ 10（TEXT 专用要求） */
  rows: string[][];
  /** 表格后的一段补充说明 */
  note?: string;
}

/* =========================================================================
 * 7. 函数条目 —— FunctionEntry（核心数据结构）
 * ========================================================================= */

export interface FunctionEntry {
  /** 唯一标识，小写英文名，也是网址的一部分，如 'vlookup' */
  id: string;
  /** 英文名（全大写），如 'VLOOKUP' —— 这是唯一能敲进 Excel 的名字 */
  enName: string;
  /**
   * 中文助记名。
   * - 有通用中文叫法 → 填中文，页面主显示为「中文名 + 英文名小字」
   * - 中文版 Excel 不翻译 / 国内无通用叫法 → 填 null，页面主显示英文名，
   *   中文俗称全部进 zhCommon（见 ARCHITECTURE §3.4）
   * 改这一个字段即可在两种显示策略间一键切换。
   */
  zhName: string | null;
  /** 中文俗称 / 口语叫法，全部进搜索索引的 aliases，如 ['精确查找','高级查找','万能查找'] */
  zhCommon: string[];
  /** 别名 / 用途俗称，如 ['竖向查找','垂直查找','跨表匹配'] */
  alias: string[];
  /** 所属分类 */
  category: CategoryId;
  /** 拼音首字母，如 'zxcz'；zhName 为 null 时为 enName 小写（由脚本生成） */
  abbr: string;
  /** 中文名全拼，如 'zongxiangchazhao'（由脚本生成） */
  pinyin: string;
  /** 用途关键词，支撑「描述你要做什么」的自然语言搜索 */
  keywords: string[];
  /** 难度星级 */
  difficulty: Difficulty;
  /** 常用度排序权重，数字越大越靠前 */
  usageLevel: number;
  /** 最低可用版本与旧版替代写法（team-lead Q9 决策） */
  version: VersionInfo;
  /** 是否为 Excel 隐藏函数（DATEDIF）：无智能提示、函数列表搜不到 */
  hiddenFunction?: boolean;
  /** 是否为动态数组函数（UNIQUE / FILTER）：结果会溢出到多个单元格 */
  dynamicArray?: boolean;
  /** ① 一句话用途（≤20 字，动词开头，禁止「用于……」官方腔） */
  oneLiner: string;
  /** ① 补充：2–3 句说明「什么时候该用它」 */
  summary: string;
  /** ② 语法结构 */
  syntax: {
    /** 中文占位符行，如 '=VLOOKUP(找什么, 在哪找, 第几列, [匹配方式])' */
    patternCn: string;
    /** 英文原式行，如 '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])' */
    patternEn: string;
    /** ③ 参数逐项说明 */
    args: ArgItem[];
  };
  /** 返回什么（一句话） */
  returnValue: string;
  /** ④ 真实示例，≥2 个 */
  examples: ExampleItem[];
  /** ⑤ 常见错误与注意事项，≥3 条（优先收录「不报错但结果错」的坑） */
  pitfalls: PitfallItem[];
  /** ⑥ 相关函数，3–5 个，每个必须标注关系类型 + 一句「什么时候改用」 */
  related: RelatedItem[];
  /** 附加板块（TEXT 必须带一张 ≥10 行的格式代码速查表） */
  extraBlocks?: ExtraBlock[];
  /** ⑦ 在线试算配置 */
  calc: CalcSpec;
  meta: {
    /** 内容最后更新日期，YYYY-MM-DD */
    updatedAt: string;
    /** draft = 内容待补充 */
    status: EntryStatus;
    /** 是否被甲方编辑过 */
    customEdited: boolean;
  };
}

/* =========================================================================
 * 8. 目录 / 搜索索引（首屏只加载这一层）
 * ========================================================================= */

/** catalog.json 的一行 —— 60 条函数的「身份证」，唯一手工真源 */
export interface CatalogRow {
  id: string;
  enName: string;
  /** null = 英文名为主显示 */
  zhName: string | null;
  /** 中文俗称 */
  zhCommon: string[];
  alias: string[];
  /** 用途关键词，支撑「描述你要做什么」的自然语言搜索（含进搜索索引 aliases） */
  keywords: string[];
  category: CategoryId;
  difficulty: Difficulty;
  usageLevel: number;
  minVersion: ExcelMinVersion;
  /** 一句话用途（与 FunctionEntry.oneLiner 保持一致） */
  oneLiner: string;
  status: EntryStatus;
  /** —— 以下两个字段由 scripts/gen-pinyin.mjs 自动生成，请勿手改 —— */
  abbr?: string;
  pinyin?: string;
}

/**
 * 搜索索引条目（由 data/index.ts 在运行时从 CatalogRow 派生）。
 * 注意：索引数组由 data 层按 usageLevel 降序预排，
 * 因此 core/search.ts 只需按 score 稳定排序，即可满足 ARCHITECTURE §3.6 的
 * 「按 (score, usageLevel) 降序」要求，无需把 usageLevel 带进索引条目。
 */
export interface SearchEntry {
  id: string;
  enName: string;
  /** 可能为 null */
  zhName: string | null;
  /** 拼音首字母 */
  abbr: string;
  /** 中文名全拼 */
  pinyin: string;
  /** zhCommon + alias + keywords 的合集，用于第⑥级别名匹配 */
  aliases: string[];
  category: CategoryId;
  oneLiner: string;
  status: EntryStatus;
}

/* =========================================================================
 * 9. core 计算层类型
 * ========================================================================= */

/** 单元格的值 */
export type CellValue = string | number | boolean | null;

/** 一张试算用的二维表（已切片，不含表头） */
export interface Sheet {
  /** 数据区左上角单元格，如 'A2'（表头在上一行） */
  anchor: string;
  /** 列名 */
  header: string[];
  /** 数据行（不含表头） */
  rows: CellValue[][];
}

/**
 * 计算失败 —— 全站统一的错误结构。
 * 硬约束：错误必须返回 { error, reason, fix } 三件套。
 */
export interface CalcFailure {
  /** 错误码，如 '#N/A' */
  error: string;
  /** 人话：这个错误是什么意思、为什么会错 */
  reason: string;
  /** 人话：怎么改（能给的尽量给可直接抄的公式） */
  fix: string;
}

/** 计算成功 */
export interface CalcSuccess {
  ok: true;
  /** 原始值 */
  value: CellValue;
  /** 展示文本（已做数字/日期格式化） */
  display: string;
  /**
   * 静默错误警告：Excel 不报错但结果可能是错的。
   * 见 ARCHITECTURE §3.3 —— 忠实还原 Excel 行为，同时教育用户。
   */
  warning?: string;
}

/** 计算失败 */
export interface CalcFail {
  ok: false;
  value: CalcFailure;
}

/** 计算结果（判别联合） */
export type CalcOutcome = CalcSuccess | CalcFail;

/** 计算上下文 */
export interface CalcContext {
  /** 试算所用的数据表 */
  sheet: Sheet;
  /** 各参数取值（键为 CalcField.key，值为用户输入的原始字符串） */
  args: Record<string, string>;
  /** 该函数的 CalcSpec */
  spec: CalcSpec;
}

/** 一个函数的计算实现 */
export type CalcHandler = (ctx: CalcContext) => CalcOutcome;

/* =========================================================================
 * 10. storage 存储层类型
 * ========================================================================= */

/** 深 Partial：用于表达「只改了几个字段」的增量 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/** 单个函数的增量（数组整体替换，对象按 key 合并） */
export type FunctionOverride = DeepPartial<FunctionEntry>;

/** localStorage 中 efg:v1:overrides 的结构 */
export interface OverridesStore {
  schemaVersion: number;
  /** 函数 id → 增量 */
  functions: Record<string, FunctionOverride>;
}

/** 导出的备份文件结构 */
export interface BackupFile {
  schemaVersion: number;
  app: 'excel-function-guide';
  /** ISO 8601 UTC */
  exportedAt: string;
  kind: 'overrides';
  /** 函数 id → 增量 */
  functions: Record<string, FunctionOverride>;
}

/** 站点设置（localStorage efg:v1:settings） */
export interface SiteSettings {
  /** 上次导出备份的时间（ISO 8601 UTC），null = 从未导出 */
  lastExportAt: string | null;
  lastImportAt: string | null;
  /** 首屏「数据只存本机」的一次性引导条是否已看过 */
  onboardingSeen: boolean;
}
