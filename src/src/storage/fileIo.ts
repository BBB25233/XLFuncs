/**
 * 浏览器 / 原生文件动作。
 * - 网页：下载文本为文件（Blob + createObjectURL）、从 <input type=file> 读文本。
 * - 安卓（Capacitor 原生壳内）：导出改走原生 Filesystem + Share —— WebView 不会
 *   触发 <a download> 的真实落盘下载。
 * 这是 storage 层里唯一碰 Blob / File / 原生文件接口的地方。
 */

import { Capacitor } from '@capacitor/core';

/** 把一段文本下载成文件：网页走 Blob 下载，安卓壳走原生写文件 + 系统分享 */
export function downloadText(fileName: string, content: string, mime: string): void {
  // 安卓原生壳：WebView 不支持 <a download> 真实落盘，改走原生文件接口
  if (Capacitor.isNativePlatform()) {
    void downloadTextNative(fileName, content);
    return;
  }

  // 网页（含 GitHub Release 单文件）：保持原有 Blob 下载逻辑不变
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 原生（安卓）导出：把文本写入应用缓存目录，再调起系统分享面板让用户保存/发送。
 * 两个插件都用**动态 import**，确保网页构建与运行时不会求值任何原生插件模块。
 */
async function downloadTextNative(fileName: string, content: string): Promise<void> {
  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const saved = await Filesystem.writeFile({
      path: fileName,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({
      title: fileName,
      text: fileName,
      files: [saved.uri],
    });
  } catch (err) {
    // 导出失败不阻塞界面，仅记录，避免原生异常影响其它功能
    console.warn('导出文件失败：', err);
  }
}

/**
 * 读取用户选择的文件文本。
 * 读取失败时抛出**中文**原因，由调用方转成提示，绝不让英文异常冒到界面上。
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }
      reject(new Error('读不到这个文件的内容，请确认文件没有损坏后重试'));
    };
    reader.onerror = (): void => {
      reject(new Error('读不到这个文件的内容，请确认文件没有损坏后重试'));
    };
    reader.readAsText(file, 'utf-8');
  });
}
