import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MACRO_BUNDLE } from './bundle';
import {
  __setMacroLoaderForTest,
  ensureMacroBundle,
  getMacroSnapshot,
  subscribeMacro,
} from './store';

/**
 * 宏内容加载状态机（M3 拆包）：
 * 并发只加载一次、失败可重试、快照只在状态变化时替换（useSyncExternalStore 的前提）。
 */

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  __setMacroLoaderForTest(async () => MACRO_BUNDLE);
});

describe('宏内容 store', () => {
  it('idle → loading → ready，并通知订阅者', async () => {
    const events: string[] = [];
    const unsubscribe = subscribeMacro(() => {
      events.push(getMacroSnapshot().status);
    });

    expect(getMacroSnapshot().status).toBe('idle');
    const pending = ensureMacroBundle();
    expect(getMacroSnapshot().status).toBe('loading');

    const bundle = await pending;
    expect(bundle.entries.length).toBe(271);
    expect(getMacroSnapshot().status).toBe('ready');
    expect(getMacroSnapshot().bundle).toBe(MACRO_BUNDLE);
    expect(events).toEqual(['loading', 'ready']);

    unsubscribe();
  });

  it('并发调用共享同一次加载', async () => {
    const loader = vi.fn(async () => MACRO_BUNDLE);
    __setMacroLoaderForTest(loader);

    const [a, b] = await Promise.all([ensureMacroBundle(), ensureMacroBundle()]);
    expect(a).toBe(MACRO_BUNDLE);
    expect(b).toBe(MACRO_BUNDLE);
    expect(loader).toHaveBeenCalledTimes(1);

    // 已加载后再调，不再触发加载
    await ensureMacroBundle();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('加载失败给出可读原因，重试后能恢复', async () => {
    const pending = deferred<typeof MACRO_BUNDLE>();
    __setMacroLoaderForTest(() => pending.promise);

    const failing = ensureMacroBundle();
    pending.reject(new Error('内容包 macro 缺失（packs/macro.abc12345.js），请重新解压完整文件夹'));
    await expect(failing).rejects.toThrow('内容包 macro 缺失');

    expect(getMacroSnapshot().status).toBe('error');
    expect(getMacroSnapshot().error).toContain('packs/macro.abc12345.js');

    // 第二次：换成能成功的 loader（模拟用户补回包后点「重新加载」）
    __setMacroLoaderForTest(async () => MACRO_BUNDLE);
    await expect(ensureMacroBundle()).resolves.toBe(MACRO_BUNDLE);
    expect(getMacroSnapshot().status).toBe('ready');
    expect(getMacroSnapshot().error).toBeNull();
  });

  it('快照在状态不变时保持同一引用', async () => {
    await ensureMacroBundle();
    expect(getMacroSnapshot()).toBe(getMacroSnapshot());
  });
});
