import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MacroEntry } from '@/types';
import type { MacroBundle } from '@/data/macro/bundle';
import { KIND_NAME, searchMacros } from '@/data/macro';

/**
 * 宏内搜索框（首页 / 速查表 / 详情页共用）。
 *
 * 为什么三处都放：
 * - 宏内容 271 条，靠分组浏览找一条具体写法太慢，搜索是主路径；
 * - 三处必须共用同一套打分（`searchMacros` → `core/search` 六级），
 *   否则同一个词在不同页面给出不同结果，用户会以为坏了。
 *
 * 交互：输入即出下拉（最多 8 条）、↑↓ 选择、Enter 跳转、Esc 清空；
 * 同时通过 `onKeywordChange` 让页面自己过滤列表。
 */

export interface MacroSearchBoxProps {
  bundle: MacroBundle;
  /** 关键词变化时通知页面（用于过滤下方的列表 / 表格） */
  onKeywordChange?: (keyword: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 紧凑模式：详情页顶部使用，宽度更小 */
  compact?: boolean;
}

function titleOf(entry: MacroEntry): string {
  return entry.zhName === null ? entry.enName : `${entry.zhName} ${entry.enName}`;
}

export default function MacroSearchBox({
  bundle,
  onKeywordChange,
  placeholder = '搜宏：删空行、Range、1004、JSA…',
  autoFocus = false,
  compact = false,
}: MacroSearchBoxProps): ReactElement {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchMacros(bundle, keyword, 8), [bundle, keyword]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent): void => {
      if (boxRef.current !== null && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  const change = (value: string): void => {
    setKeyword(value);
    setActive(0);
    setOpen(value.trim() !== '');
    onKeywordChange?.(value);
  };

  const go = (entry: MacroEntry | undefined): void => {
    if (entry === undefined) {
      return;
    }
    setOpen(false);
    setKeyword('');
    onKeywordChange?.('');
    navigate(`/macro/${entry.id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      change('');
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active] ?? results[0]);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${compact ? '' : 'max-w-xl'}`}>
      <div className="flex h-10 items-center gap-2 rounded-input border border-line bg-bg px-3 focus-within:border-accent">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 shrink-0 fill-none stroke-ink-3" strokeWidth="1.6">
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.2 13.2 17 17" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(event) => change(event.target.value)}
          onFocus={() => setOpen(keyword.trim() !== '')}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="搜索宏内容"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
        />
        {keyword === '' ? null : (
          <button
            type="button"
            onClick={() => change('')}
            aria-label="清空搜索"
            className="shrink-0 rounded-badge px-1 text-xs text-ink-3 hover:text-ink"
          >
            清空
          </button>
        )}
      </div>

      {open && keyword.trim() !== '' ? (
        <div className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-card border border-line bg-bg shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-ink-3">没有匹配的宏条目，换个说法试试（如「筛选」「错误 1004」）。</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((entry, index) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(entry)}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left ${
                      index === active ? 'bg-bg-sub' : ''
                    }`}
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="text-sm text-ink">{titleOf(entry)}</span>
                      <span className="text-xs text-ink-3">{KIND_NAME[entry.kind]}</span>
                    </span>
                    <span className="text-xs text-ink-3">{entry.oneLiner}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
