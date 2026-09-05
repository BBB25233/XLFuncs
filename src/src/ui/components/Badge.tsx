import type { ReactElement } from 'react';
import type { Difficulty, EntryStatus } from '@/types';
import { CATEGORY_META } from '@/data/categories';
import type { CategoryId } from '@/types';

/**
 * 徽章：分类 / 难度 / 状态 / 版本。
 * 高度 20px、4px 圆角、1px 描边、13px 次要文字色、无阴影（PRD §8.7）。
 */

const BASE =
  'inline-flex h-5 shrink-0 items-center rounded-badge border border-line bg-bg-sub px-2 text-xs text-ink-2';

export function CategoryBadge({ id }: { id: CategoryId }): ReactElement {
  const meta = CATEGORY_META[id];
  return <span className={BASE}>{meta.name}</span>;
}

export function DifficultyBadge({ level }: { level: Difficulty }): ReactElement {
  return <span className={BASE}>{'★'.repeat(level)}</span>;
}

export function StatusBadge({ status }: { status: EntryStatus }): ReactElement {
  if (status === 'published') {
    return <span className={BASE}>已上线</span>;
  }
  return <span className={`${BASE} text-ink-3`}>内容待补充</span>;
}

/** 版本徽章：用琥珀色，提醒旧版用户注意 */
export function VersionBadge({ label }: { label: string }): ReactElement {
  return <span className={`${BASE} text-warn`}>{label}</span>;
}

export default CategoryBadge;
