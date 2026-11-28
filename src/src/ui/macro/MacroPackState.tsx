import type { ReactElement } from 'react';

/**
 * 宏内容包的三态提示（M3 拆包）。
 *
 * 与函数详情页的「缺包提示」同一套口径：出错时给出具体原因 + 重试按钮，
 * 而不是白屏或笼统的「加载失败」。
 */

export function MacroPackLoading({ label = '正在加载宏内容' }: { label?: string }): ReactElement {
  return (
    <div className="mx-auto max-w-content py-16">
      <div className="flex items-center gap-2 text-sm text-ink-3">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
        {label}…
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-4 animate-pulse rounded-badge bg-bg-sub"
            style={{ width: `${88 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MacroPackError({
  error,
  retry,
}: {
  error: string | null;
  retry: () => void;
}): ReactElement {
  return (
    <div className="mx-auto max-w-content py-16">
      <h2 className="text-h3 text-ink">宏内容没有加载出来</h2>
      <p className="mt-2 text-sm text-ink-2">
        {error ?? '内容包缺失或损坏，请确认解压的是完整文件夹。'}
      </p>
      <p className="mt-1 text-xs text-ink-3">
        文件夹常见原因：只拷贝了 index.html、packs 目录被删、浏览器缓存了旧版本。函数速查不受影响，可先回首页。
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={retry}
          className="rounded-card border border-line px-3 py-1.5 text-sm text-ink hover:bg-bg-sub"
        >
          重新加载
        </button>
        <a
          href="#/"
          className="rounded-card px-3 py-1.5 text-sm text-accent hover:text-accent-hover"
        >
          回到函数首页
        </a>
      </div>
    </div>
  );
}
