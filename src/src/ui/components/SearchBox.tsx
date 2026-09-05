import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogIndex } from '@/data';
import { fallbackSuggestions, query } from '@/core/search';
import type { SearchEntry } from '@/types';
import EmptyState from '@/ui/components/EmptyState';

/**
 * 搜索框 + 即时下拉结果。
 *
 * 两条硬约束（§3.6）：
 * 1. 下拉每条必须显示「中文名 · 英文名 · 一句话用途」三要素，撞车时用户自己能分清
 * 2. 无结果走 EmptyState，给出 3 个相近函数
 * 支持键盘 ↑↓ 选择 + Enter 跳转。
 */

export interface SearchBoxProps {
  /** 初始关键词（搜索结果页复用时用） */
  initialValue?: string;
  /** 回车但没选中任何条目时的回调（跳到搜索结果页） */
  onSubmit?: (keyword: string) => void;
  /** 占位提示 */
  placeholder?: string;
}

function titleOf(entry: SearchEntry): string {
  return entry.zhName === null ? entry.enName : `${entry.zhName} ${entry.enName}`;
}

export default function SearchBox({
  initialValue = '',
  onSubmit,
  placeholder = '搜函数名、拼音首字母，或直接描述你要做什么（如：两个表匹配数据）',
}: SearchBoxProps): ReactElement {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>(initialValue);
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo<SearchEntry[]>(
    () => (keyword.trim() === '' ? [] : query(catalogIndex, keyword, 8)),
    [keyword],
  );

  const suggestions = useMemo<SearchEntry[]>(
    () => fallbackSuggestions(catalogIndex, 3),
    [],
  );

  // 点空白处收起下拉
  useEffect(() => {
    const onPointerDown = (event: MouseEvent): void => {
      if (boxRef.current !== null && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const target: EventTarget = globalThis as unknown as EventTarget;
    const listener = onPointerDown as EventListener;
    target.addEventListener('mousedown', listener);
    return () => {
      target.removeEventListener('mousedown', listener);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [keyword]);

  const go = (entry: SearchEntry): void => {
    setOpen(false);
    navigate(`/f/${entry.id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const picked = results[activeIndex];
      if (picked !== undefined) {
        go(picked);
        return;
      }
      setOpen(false);
      if (onSubmit !== undefined && keyword.trim() !== '') {
        onSubmit(keyword.trim());
      }
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="搜索函数"
          className="h-11 w-full rounded-input border border-line bg-bg pl-9 pr-3 text-body text-ink outline-none placeholder:text-ink-3 focus:border-accent"
        />
      </div>

      {!open || keyword.trim() === '' ? null : (
        <div className="fade-in absolute left-0 right-0 top-[52px] z-30 max-h-[60vh] overflow-y-auto rounded-card hairline bg-bg p-2">
          {results.length === 0 ? (
            <div className="p-2">
              <EmptyState
                keyword={keyword.trim()}
                suggestions={suggestions.map((item) => ({
                  id: item.id,
                  title: titleOf(item),
                  oneLiner: item.oneLiner,
                }))}
              />
            </div>
          ) : (
            <ul>
              {results.map((entry, index) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(entry)}
                    className={`block w-full rounded-btn px-3 py-2 text-left ${
                      index === activeIndex ? 'bg-bg-sub' : 'bg-bg'
                    }`}
                  >
                    <span className="text-sm font-semibold text-ink">{titleOf(entry)}</span>
                    <span className="ml-2 font-mono text-xs text-ink-3">{entry.enName}</span>
                    <p className="truncate text-xs text-ink-2">{entry.oneLiner}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
