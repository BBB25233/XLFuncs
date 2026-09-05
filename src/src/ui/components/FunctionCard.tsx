import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { SearchEntry } from '@/types';
import { getCatalogRow } from '@/data';
import { CategoryBadge, DifficultyBadge, StatusBadge, VersionBadge } from '@/ui/components/Badge';

/**
 * 列表项卡片：中文名 + 英文名（等宽小字）+ 一句话用途 + 徽章。
 * 中文名只是助记名，所以英文名必须同时露出（P0-17）。
 * 每个条目都会标出「最低可用版本」（team-lead Q9）。
 */

export interface FunctionCardProps {
  entry: SearchEntry;
  /** 紧凑模式（搜索下拉里用） */
  dense?: boolean;
}

export default function FunctionCard({ entry, dense = false }: FunctionCardProps): ReactElement {
  const row = getCatalogRow(entry.id);
  const versionLabel = versionShortLabel(row?.minVersion ?? 'all');

  return (
    <Link
      to={`/f/${entry.id}`}
      className={`block rounded-card px-4 py-3 hover:bg-bg-sub ${dense ? '' : 'hairline'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`font-semibold text-ink ${dense ? 'text-sm' : 'text-h4'}`}>
          {entry.zhName === null ? '' : `${entry.zhName} `}
        </span>
        <span className="font-mono text-sm text-ink-2">{entry.enName}</span>
        <CategoryBadge id={entry.category} />
        <DifficultyBadge level={row?.difficulty ?? 1} />
        {entry.status === 'draft' ? <StatusBadge status="draft" /> : null}
        {versionLabel === '' ? null : <VersionBadge label={versionLabel} />}
      </div>
      <p className={`mt-1 text-ink-2 ${dense ? 'text-xs' : 'text-sm'}`}>{entry.oneLiner}</p>
    </Link>
  );
}

/** 版本代号的短标签；全版本可用时不显示（避免全页都是徽章） */
function versionShortLabel(min: string): string {
  switch (min) {
    case '365':
      return '需 365 / 2021';
    case '2019':
      return '需 2019 及以上';
    case '2007':
      return '需 2007 及以上';
    default:
      return '';
  }
}
