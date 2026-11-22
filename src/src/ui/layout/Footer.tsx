import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

/** 页脚：数据管理 / 关于与免责 / 版本号 */
export default function Footer(): ReactElement {
  return (
    <footer className="hairline-t bg-bg">
      <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/data" className="text-ink-3 hover:text-ink">
            数据管理（备份 / 恢复）
          </Link>
          <span className="text-line">·</span>
          <Link to="/about" className="text-ink-3 hover:text-ink">
            关于与免责声明
          </Link>
          <span className="text-line">·</span>
          <span>作者 ID：BBB25</span>
        </div>
        <p>v1.4 · 框架 + 414 个函数 · 作者 ID：BBB25</p>
      </div>
    </footer>
  );
}
