import type { ReactElement } from 'react';
import type { MacroHost, MacroKind } from '@/types';
import { KIND_NAME } from '@/data/macro';

/**
 * 宏条目的徽章：类型 / 宿主 / 难度。
 * 与函数页的 Badge 保持同一套视觉（20px 高、细描边、次要文字色）。
 */

const BASE =
  'inline-flex h-5 shrink-0 items-center rounded-badge border border-line bg-bg-sub px-2 text-xs text-ink-2';

export function MacroKindBadge({ kind }: { kind: MacroKind }): ReactElement {
  return <span className={BASE}>{KIND_NAME[kind]}</span>;
}

/** 宿主：只标实测过的。'excel' → Excel，同时有 wps 才显示 WPS */
export function MacroHostBadge({ host }: { host: MacroHost[] }): ReactElement {
  const hasWps = host.includes('wps');
  return (
    <span className={BASE}>
      Excel
      {hasWps ? ' / WPS' : ''}
    </span>
  );
}

export function MacroLevelBadge({ level }: { level: 1 | 2 | 3 }): ReactElement {
  const label = level === 1 ? '入门' : level === 2 ? '进阶' : '专家';
  return <span className={BASE}>{label}</span>;
}
