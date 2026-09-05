import { useCallback, useEffect, useState } from 'react';
import { showToast } from '@/ui/hooks/useToast';

/**
 * 剪贴板唯一出口（F25，team-lead 提为 P0）。
 *
 * 三级降级策略（禁止向用户暴露「剪贴板 API 调用失败」这类技术文案）：
 *   ① navigator.clipboard.writeText(text)      → 成功：Toast「已复制，去 Excel 里按 Ctrl+V」
 *   ② 失败 → 隐藏 textarea + select() + document.execCommand('copy')
 *   ③ 仍失败 → 弹出可见文本框（已全选）+ 提示「已为你选中，长按后点『拷贝』」
 */

/** 复制成功后的默认提示（§8.5 统一口径，一字不改） */
export const COPY_SUCCESS_HINT = '已复制，去 Excel 里按 Ctrl+V';

/** 三级降级时的兜底文案 */
export const COPY_FALLBACK_HINT = '已为你选中，长按后点「拷贝」';

/* ------------------------------------------------------------------ *
 * 兜底弹层的模块级状态
 * ------------------------------------------------------------------ */

let fallbackText: string | null = null;
const fallbackListeners = new Set<(text: string | null) => void>();

function setFallbackText(text: string | null): void {
  fallbackText = text;
  fallbackListeners.forEach((listener) => listener(text));
}

/** 订阅兜底文本，供 AppShell 渲染可见文本框 */
export function useCopyFallback(): string | null {
  const [text, setText] = useState<string | null>(fallbackText);

  useEffect(() => {
    fallbackListeners.add(setText);
    setText(fallbackText);
    return () => {
      fallbackListeners.delete(setText);
    };
  }, []);

  return text;
}

/** 关闭兜底文本框 */
export function clearCopyFallback(): void {
  setFallbackText(null);
}

/* ------------------------------------------------------------------ *
 * 两级静默尝试
 * ------------------------------------------------------------------ */

/** ① 现代剪贴板 API */
async function tryClipboardApi(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || navigator.clipboard === undefined) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** ② 隐藏 textarea + execCommand（微信内置浏览器 / 旧浏览器的主要通路） */
function tryExecCommand(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // 保持在视口内但不可见：iOS 上 display:none 的元素无法选中
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * 对外 hook
 * ------------------------------------------------------------------ */

export interface UseCopyResult {
  /** 复制文本；hint 省略时使用统一口径的成功文案 */
  copy: (text: string, hint?: string) => Promise<void>;
}

export function useCopy(): UseCopyResult {
  const copy = useCallback(async (text: string, hint?: string): Promise<void> => {
    if (text === '') {
      return;
    }

    const first = await tryClipboardApi(text);
    if (first) {
      showToast(hint ?? COPY_SUCCESS_HINT, 'success');
      return;
    }

    const second = tryExecCommand(text);
    if (second) {
      showToast(hint ?? COPY_SUCCESS_HINT, 'success');
      return;
    }

    // ③ 弹出可见文本框并全选，让用户长按拷贝
    setFallbackText(text);
    showToast(COPY_FALLBACK_HINT, 'info');
  }, []);

  return { copy };
}
