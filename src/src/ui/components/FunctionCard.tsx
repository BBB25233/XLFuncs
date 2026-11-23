import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { SearchEntry } from '@/types';
import { get, getCatalogRow } from '@/data';
import { CategoryBadge, DifficultyBadge, StatusBadge, VersionBadge } from '@/ui/components/Badge';

/**
 * 列表项卡片：中文名 + 英文名（等宽小字）+ 一句话用途 + 徽章。
 * 中文名只是助记名，所以英文名必须同时露出（P0-17）。
 * 每个条目都会标出「最低可用版本」（team-lead Q9）。
 *
 * 卡片底部还会露出 2–3 个关联函数（G）：关联数据来自 related.json 的轻量索引，
 * 因此这里不触发 packs 加载。注意根节点必须是 div —— 关联 chip 本身也是链接，
 * 放进外层 <Link> 会形成非法嵌套。
 */

export interface FunctionCardProps {
  entry: SearchEntry;
  /** 紧凑模式（搜索下拉里用） */
  dense?: boolean;
}

export default function FunctionCard({ entry, dense = false }: FunctionCardProps): ReactElement {
  const row = getCatalogRow(entry.id);
  const versionLabel = versionShortLabel(row?.minVersion ?? 'all');
  // 紧凑模式（首页快捷入口/搜索下拉）不放关联 chip，避免打断选词；
  // 分类页与搜索结果页则露出 3 条。
  const related = dense
    ? []
    : (entry.relatedIds ?? [])
        .map((id) => get(id))
        .filter((rel): rel is SearchEntry => rel !== null)
        .slice(0, 3);

  return (
    <div className={`rounded-card px-4 py-3 hover:bg-bg-sub ${dense ? '' : 'hairline'}`}>
      <Link to={`/f/${entry.id}`} className="block">
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
      {related.length === 0 ? null : (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-3">常一起用</span>
          {related.map((rel) => (
            <Link
              key={rel.id}
              to={`/f/${rel.id}`}
              className="rounded-full bg-bg-sub px-2 py-0.5 text-xs text-ink-2 hover:text-brand"
            >
              {rel.zhName === null ? rel.enName : `${rel.zhName} ${rel.enName}`}
            </Link>
          ))}
        </div>
      )}
    </div>
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

