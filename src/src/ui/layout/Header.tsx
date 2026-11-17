import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { IS_NATIVE } from '@/ui/native/platform';
import { setDrawerOpen } from '@/ui/layout/drawerStore';

/** 顶栏：安卓端为「汉堡按钮 + 标题」，网页端为站点名 + 数据管理 / 关于链接 */
export default function Header(): ReactElement {
  // 安卓壳：左侧汉堡按钮打开抽屉导航。网页端不进入此分支，顶栏保持原样。
  if (IS_NATIVE) {
    return (
      <header className="hairline-b bg-bg">
        <div className="mx-auto flex max-w-content items-center gap-2 px-4 sm:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="打开菜单"
            className="flex h-[44px] w-[44px] items-center justify-center rounded-btn text-ink-2"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Link to="/" className="text-h4 font-semibold text-ink">
            Excel 函数速查
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="hairline-b bg-bg">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2 text-ink hover:text-ink">
          <span className="text-h4 font-semibold">Excel 函数速查</span>
          <span className="hidden text-xs text-ink-3 sm:inline">414 个函数</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/interpreter" className="text-ink-2 hover:text-accent">
            公式解释
          </Link>
          <Link to="/data" className="text-ink-2 hover:text-accent">
            数据管理
          </Link>
          <Link to="/about" className="text-ink-2 hover:text-accent">
            关于
          </Link>
        </nav>
      </div>
    </header>
  );
}
