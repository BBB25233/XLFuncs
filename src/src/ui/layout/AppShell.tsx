import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from '@/ui/layout/Header';
import Footer from '@/ui/layout/Footer';
import Drawer from '@/ui/layout/Drawer';
import AndroidBackHandler from '@/ui/native/AndroidBackHandler';
import { ToastHost } from '@/ui/components/Toast';
import { useCopyFallback, clearCopyFallback, COPY_FALLBACK_HINT } from '@/ui/clipboard/useCopy';
import { showToast } from '@/ui/hooks/useToast';
import { getSettings, saveSettings } from '@/storage/repository';
import { isStorageDegraded } from '@/storage/localStore';
import { MESSAGES } from '@/storage/keys';

/** 复制三级降级时的可见文本框（微信内置浏览器里的最终兜底） */
function CopyFallbackLayer(): ReactElement {
  const text = useCopyFallback();
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (text === null) {
      return;
    }
    const node = ref.current;
    if (node === null) {
      return;
    }
    node.focus();
    node.select();
    node.setSelectionRange(0, text.length);
  }, [text]);

  if (text === null) {
    return <span className="hidden" />;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/10 px-4 pb-4 sm:items-center">
      <div className="fade-in w-full max-w-content rounded-modal hairline bg-bg p-4">
        <p className="mb-3 text-sm text-ink-2">{COPY_FALLBACK_HINT}</p>
        <textarea
          ref={ref}
          readOnly
          value={text}
          rows={6}
          className="scroll-x w-full resize-none rounded-input hairline bg-bg-sub p-3 font-mono text-xs text-ink"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={clearCopyFallback}
            className="h-10 rounded-btn border border-line px-4 text-sm text-ink-2 hover:text-ink sm:h-9"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

/** 一次性「数据只存本机」引导条 */
function OnboardingBar(): ReactElement {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!getSettings().onboardingSeen) {
      setVisible(true);
    }
  }, []);

  const dismiss = (): void => {
    saveSettings({ ...getSettings(), onboardingSeen: true });
    setVisible(false);
  };

  if (!visible) {
    return <span className="hidden" />;
  }

  return (
    <div className="bg-bg-sub hairline-b">
      <div className="mx-auto flex max-w-content items-start gap-3 px-4 py-3 sm:px-8">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-badge border border-line text-[11px] text-warn">
          !
        </span>
        <p className="flex-1 text-xs leading-5 text-ink-2">{MESSAGES.clearBrowser}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs text-ink-3 hover:text-ink"
          aria-label="我知道了"
        >
          知道了
        </button>
      </div>
    </div>
  );
}

/** 页面骨架：顶栏 + 引导条 + 760px 居中内容区 + 页脚 + Toast + 复制兜底层 */
export default function AppShell(): ReactElement {
  useEffect(() => {
    // localStorage 不可用时（无痕模式 / 配额满）给出中文提示，绝不崩页面
    if (isStorageDegraded()) {
      showToast(
        '当前浏览器无法保存（无痕模式？），你的改动只在这次会话有效，请及时导出备份',
        'error',
      );
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <OnboardingBar />
      <Header />
      <main className="flex-1 px-4 pb-16 pt-6 sm:px-8">
        <Outlet />
      </main>
      <Footer />
      <Drawer />
      <AndroidBackHandler />
      <ToastHost />
      <CopyFallbackLayer />
      <ScrollRestoration />
    </div>
  );
}
