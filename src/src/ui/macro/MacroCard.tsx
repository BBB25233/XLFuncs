import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MacroEntry } from '@/types';
import { MacroHostBadge, MacroKindBadge, MacroLevelBadge } from '@/ui/macro/MacroBadges';

/**
 * 宏列表卡片：中文名 + 英文名（等宽）+ 一句话 + 三个徽章。
 * 与函数卡片保持同样的排版节奏，切换页面时不跳。
 */

export interface MacroCardProps {
  entry: MacroEntry;
  /** 紧凑模式：首页场景卡里用，隐藏徽章 */
  dense?: boolean;
}

export default function MacroCard({ entry, dense = false }: MacroCardProps): ReactElement {
  return (
    <Link
      to={`/macro/${entry.id}`}
      className={`block rounded-card px-4 py-3 hover:bg-bg-sub ${dense ? '' : 'hairline-b'}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-semibold text-ink">
          {entry.zhName === null ? '' : `${entry.zhName} `}
        </span>
        <span className="font-mono text-sm text-ink-2">{entry.enName}</span>
        {dense ? null : (
          <>
            <MacroKindBadge kind={entry.kind} />
            <MacroHostBadge host={entry.host} />
            <MacroLevelBadge level={entry.level} />
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-2">{entry.oneLiner}</p>
    </Link>
  );
}
