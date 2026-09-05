import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

/** 顶栏：站点名 + 数据管理 / 关于链接。搜索入口放在各页面顶部（移动端更顺手） */
export default function Header(): ReactElement {
  return (
    <header className="hairline-b bg-bg">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2 text-ink hover:text-ink">
          <span className="text-h4 font-semibold">Excel 函数速查</span>
          <span className="hidden text-xs text-ink-3 sm:inline">414 个函数</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
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
