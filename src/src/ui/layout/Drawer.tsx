import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORY_LIST } from '@/data/categories';
import { countByCategory, TOTAL_COUNT } from '@/data';
import { IS_NATIVE } from '@/ui/native/platform';
import { setDrawerOpen, useDrawerOpen } from '@/ui/layout/drawerStore';

interface NavItem {
  to: string;
  label: string;
}

/** 主导航（首页 / 搜索 / 设置） */
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '首页' },
  { to: '/search', label: '搜索' },
  { to: '/settings', label: '设置' },
];

/** 当前路径是否命中该导航项：首页精确匹配，其余按前缀匹配（覆盖 /category/x 等子路径） */
function isActive(pathname: string, to: string): boolean {
  if (to === '/') {
    return pathname === '/';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * 安卓端侧滑抽屉导航。
 * 仅原生壳内渲染（网页端直接返回 null），因此网页端不会出现任何变化。
 */
export default function Drawer(): ReactElement | null {
  const open = useDrawerOpen();
  const { pathname } = useLocation();

  if (!IS_NATIVE || !open) {
    return null;
  }

  const close = (): void => {
    setDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="站点导航">
      <button
        type="button"
        aria-label="关闭菜单"
        onClick={close}
        className="drawer-mask absolute inset-0 bg-ink/10"
      />

      <aside className="drawer-panel absolute bottom-0 left-0 top-0 flex w-[280px] max-w-[80vw] flex-col bg-bg hairline-r">
        <div className="hairline-b px-4 py-4">
          <p className="text-h4 font-semibold text-ink">Excel 函数速查</p>
          <p className="mt-1 text-xs text-ink-3">
            {TOTAL_COUNT} 个函数 · {CATEGORY_LIST.length} 个分类
          </p>
        </div>

        <nav className="hairline-b flex flex-col py-2 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className={`flex h-[44px] items-center px-4 ${
                isActive(pathname, item.to) ? 'text-accent' : 'text-ink-2 hover:text-accent'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <p className="px-4 py-2 text-xs text-ink-3">函数分类</p>
          {CATEGORY_LIST.map((meta) => (
            <Link
              key={meta.id}
              to={`/category/${meta.id}`}
              onClick={close}
              className="flex h-[36px] items-center justify-between px-4 text-sm text-ink-2 hover:text-accent"
            >
              <span>{meta.name}</span>
              <span className="text-xs text-ink-3">{countByCategory(meta.id)}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
