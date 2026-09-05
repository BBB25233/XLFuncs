/**
 * 浏览器文件动作：下载文本为文件（Blob）、从 <input type=file> 读文本。
 * 这是 storage 层里唯一碰 Blob / File 的地方。
 */

/** 把一段文本下载成文件（Blob + createObjectURL，用完立刻 revoke） */
export function downloadText(fileName: string, content: string, mime: string): void {
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
