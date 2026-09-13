import type { RouteObject } from 'react-router-dom';
import { createHashRouter } from 'react-router-dom';
import AppShell from '@/ui/layout/AppShell';
import HomePage from '@/ui/pages/HomePage';
import CategoryPage from '@/ui/pages/CategoryPage';
import SearchPage from '@/ui/pages/SearchPage';
import FunctionDetailPage from '@/ui/pages/FunctionDetailPage';
import DataPage from '@/ui/pages/DataPage';
import AboutPage from '@/ui/pages/AboutPage';
import SettingsPage from '@/ui/pages/SettingsPage';
import EmptyState from '@/ui/components/EmptyState';
import { catalogIndex } from '@/data';
import { IS_NATIVE } from '@/ui/native/platform';

/**
 * 全站使用 hash 路由（F26 / PRD §5.1）。
 * `#` 后面的内容不会发送给服务器，因此在任何纯静态托管上刷新、分享都 100% 可用，不会 404。
 */
/** 安卓壳专用路由；网页端为空数组，因此 #/settings 仍落到下面的通配 404 */
const nativeRoutes: RouteObject[] = IS_NATIVE
  ? [{ path: 'settings', element: <SettingsPage /> }]
  : [];

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:id', element: <CategoryPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'f/:id', element: <FunctionDetailPage /> },
      { path: 'data', element: <DataPage /> },
      { path: 'about', element: <AboutPage /> },
      ...nativeRoutes,
      {
        path: '*',
        element: (
          <EmptyState
            keyword="这个页面"
            suggestions={catalogIndex.slice(0, 3).map((item) => ({
              id: item.id,
              title: item.zhName === null ? item.enName : `${item.zhName} ${item.enName}`,
              oneLiner: item.oneLiner,
            }))}
            description="这个地址不存在，你可以回到首页重新找，或者直接看下面几个最常用的函数。"
          />
        ),
      },
    ],
  },
];

export const router = createHashRouter(routes);
