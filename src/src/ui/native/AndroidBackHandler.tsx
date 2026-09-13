import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IS_NATIVE } from '@/ui/native/platform';
import { isDrawerOpen, setDrawerOpen } from '@/ui/layout/drawerStore';

/**
 * 安卓系统返回键处理（仅在原生壳内注册；网页端不产生任何副作用）。
 * 三级逻辑：① 抽屉开着 → 关抽屉；② 能回退 → 回上一页；③ 已在首页 → 最小化到后台（不退出）。
 *
 * 注意：入口用 React.StrictMode 包裹，effect 会被双调用。这里用 cancelled 标志 +
 * await 后的二次校验 + 成对 remove()，保证最终只净剩 1 个监听、且卸载后不泄漏。
 */
export default function AndroidBackHandler(): ReactElement | null {
  const navigate = useNavigate();

  useEffect(() => {
    if (!IS_NATIVE) {
      return;
    }

    let cancelled = false;
    let remove: (() => void) | null = null;

    const onBack = (canGoBack: boolean): void => {
      // ① 抽屉打开时，返回键先关抽屉
      if (isDrawerOpen()) {
        setDrawerOpen(false);
        return;
      }

      // ② 站内还有历史可回退时，回上一页（react-router 会把栈索引写在 history.state.idx）
      const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
      if (historyIndex > 0 || canGoBack) {
        navigate(-1);
        return;
      }

      // ③ 已在首页：最小化到后台，不退出 App
      void (async () => {
        const { App } = await import('@capacitor/app');
        await App.minimizeApp();
      })();
    };

    void (async () => {
      const { App } = await import('@capacitor/app');
      if (cancelled) {
        return;
      }
      const handle = await App.addListener('backButton', (event) => {
        onBack(event.canGoBack);
      });
      if (cancelled) {
        // 组件已卸载（StrictMode 首次挂载被立即清理）：立刻注销，避免泄漏
        void handle.remove();
        return;
      }
      remove = (): void => {
        void handle.remove();
      };
    })();

    return () => {
      cancelled = true;
      if (remove !== null) {
        remove();
      }
    };
  }, [navigate]);

  return null;
}
