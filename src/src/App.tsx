import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/ui/router';

/**
 * 应用根组件：只负责挂载 hash 路由。
 * AppShell（顶栏 / 内容区 / 页脚 / Toast / 复制降级弹层）作为路由的根布局。
 */
export default function App(): ReactElement {
  return <RouterProvider router={router} />;
}
