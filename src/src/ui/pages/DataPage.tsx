import { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import {
  countOverridden,
  downloadBackup,
  importBackup,
  resetAll,
} from '@/storage/repository';
import { MESSAGES } from '@/storage/keys';
import { showToast } from '@/ui/hooks/useToast';

/**
 * 数据管理页（P0-10 / P0-11 / P0-12）。
 * 导出备份 / 导入恢复 / 恢复全部官方原文。
 * 所有改动只存在本机浏览器，因此「导出备份」是防丢数据的保命操作。
 */
export default function DataPage(): ReactElement {
  // 一个数字，导入 / 恢复后 +1，强制重新读取「改过几个」的计数
  const [tick, setTick] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const changedCount = countOverridden();
  const refresh = (): void => setTick((value) => value + 1);

  const onExport = (): void => {
    const outcome = downloadBackup();
    showToast(outcome.message, outcome.ok ? 'success' : 'error');
  };

  const onPickFile = (): void => {
    fileRef.current?.click();
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    // 清空 input，保证同一个文件能再次选择
    event.target.value = '';
    if (file === undefined) {
      return;
    }
    if (!window.confirm(MESSAGES.importConfirm)) {
      return;
    }
    const outcome = await importBackup(file);
    showToast(outcome.message, outcome.ok ? 'success' : 'error');
    if (outcome.ok) {
      refresh();
    }
  };

  const onResetAll = (): void => {
    if (!window.confirm('确定要恢复全部内容为团队初稿吗？你本机的所有修改都会清除。')) {
      return;
    }
    const outcome = resetAll();
    showToast(outcome.message, 'success');
    refresh();
  };

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-2 text-h2 text-ink">数据管理</h1>
      <p className="mb-6 text-sm text-ink-2">
        你在本机浏览器里改过的内容、导出的备份都在这个页面管理。所有数据只存在你这台设备的浏览器里，
        清理浏览器数据会丢失内容，请定期导出备份。
      </p>

      <div className="rounded-card hairline p-4">
        <p className="mb-4 text-sm text-ink-2">
          你当前改过 <span className="font-semibold text-ink">{changedCount}</span> 个函数。
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center rounded-btn border border-line px-4 text-sm text-ink hover:text-accent"
          >
            导出备份
          </button>
          <button
            type="button"
            onClick={onPickFile}
            className="inline-flex h-10 items-center rounded-btn border border-line px-4 text-sm text-ink hover:text-accent"
          >
            导入备份
          </button>
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex h-10 items-center rounded-btn border border-line px-4 text-sm text-ink-2 hover:text-ink"
          >
            恢复全部官方原文
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            void onFileChange(event);
          }}
        />
      </div>

      <div className="mt-6 rounded-card bg-bg-sub px-4 py-3">
        <p className="text-xs text-ink-3">
          导入时会先自动下载一份「导入前快照」，万一导错了也能找回来。导出文件是标准的 JSON，
          可以在「Excel 函数速查」里再次导入恢复。
        </p>
      </div>
    </div>
  );
}
