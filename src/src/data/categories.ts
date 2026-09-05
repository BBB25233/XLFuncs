import type { CategoryId } from '@/types';

/** 一个分类的元信息 */
export interface CategoryMeta {
  id: CategoryId;
  /** 中文分类名 */
  name: string;
  /** 排序（Excel 官方分类顺序） */
  order: number;
  /** 一句话说明：这类函数是干什么的 */
  note: string;
}

/** 12 个分类（10 个 Excel 官方 + 兼容性/已弃用、LAMBDA 与动态数组） */
export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  logical: { id: 'logical', name: '逻辑', order: 1, note: '做判断、做分支' },
  text: { id: 'text', name: '文本', order: 2, note: '拆、拼、改、格式化文字' },
  datetime: { id: 'datetime', name: '日期与时间', order: 3, note: '取日期、算间隔' },
  lookup: { id: 'lookup', name: '查找与引用', order: 4, note: '跨表取数、定位单元格' },
  math: { id: 'math', name: '数学与三角', order: 5, note: '求和、取整、条件汇总' },
  statistical: { id: 'statistical', name: '统计', order: 6, note: '计数、平均、极值' },
  financial: { id: 'financial', name: '财务', order: 7, note: '贷款、利率、现值终值' },
  information: { id: 'information', name: '信息', order: 8, note: '判断单元格里装的是什么' },
  engineering: { id: 'engineering', name: '工程', order: 9, note: '单位换算' },
  database: { id: 'database', name: '数据库', order: 10, note: '按条件区域汇总' },
  compatibility: { id: 'compatibility', name: '兼容性/已弃用', order: 11, note: '为旧版/兼容保留的函数' },
  lambda: { id: 'lambda', name: 'LAMBDA 与动态数组', order: 12, note: 'LAMBDA 与动态数组函数' },
};

/** 按 order 排好序的分类列表（首页渲染用） */
export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORY_META).sort(
  (a, b) => a.order - b.order,
);

/** 分类 id 数组（按 Excel 官方顺序） */
export const CATEGORY_IDS: CategoryId[] = CATEGORY_LIST.map((item) => item.id);
