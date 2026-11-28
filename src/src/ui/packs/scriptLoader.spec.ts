import { describe, expect, it } from 'vitest';
import { createScriptPackLoader, type ScriptInjectDeps } from './scriptLoader';
import type { FunctionEntry } from '@/types';

const ENTRY = { id: 'sum', enName: 'SUM' } as unknown as FunctionEntry;

/** 造一份可控的假依赖：注入既不会自动成功，也不会自动失败，由用例手动触发 */
function makeDeps(manifest: Record<string, string> | null = { math: 'packs/math.js' }) {
  const registry: Record<string, { default: Record<string, FunctionEntry> }> = {};
  const injects: { src: string; done: (err?: Error) => void }[] = [];

  const deps: ScriptInjectDeps = {
    registry: () => registry,
    // null 表示「连 manifest.js 都没加载」，undefined 才是「有 manifest 但没有这个分类」
    manifest: () => (manifest === null ? undefined : manifest),
    inject: (src, done) => {
      injects.push({ src, done });
    },
  };

  return {
    deps,
    registry,
    injects,
    /** 模拟包脚本执行成功并完成注册 */
    succeed(category = 'math') {
      registry[category] = { default: { sum: ENTRY } };
      injects[injects.length - 1]?.done();
    },
    /** 模拟 <script> 404 */
    fail() {
      injects[injects.length - 1]?.done(new Error('script load failed'));
    },
  };
}

describe('createScriptPackLoader', () => {
  it('已经注册过的分类直接返回，不再注入脚本', async () => {
    const env = makeDeps();
    env.registry.math = { default: { sum: ENTRY } };
    const load = createScriptPackLoader(env.deps);

    await expect(load('math')).resolves.toEqual({ sum: ENTRY });
    expect(env.injects).toHaveLength(0);
  });

  it('同一分类并发请求只注入一个 <script>', async () => {
    const env = makeDeps();
    const load = createScriptPackLoader(env.deps);

    const a = load('math');
    const b = load('math');
    expect(env.injects).toHaveLength(1);
    expect(env.injects[0].src).toBe('packs/math.js');

    env.succeed();
    await expect(a).resolves.toEqual({ sum: ENTRY });
    await expect(b).resolves.toEqual({ sum: ENTRY });
  });

  it('包文件缺失时给出可读提示，且失败后可以再次尝试', async () => {
    const env = makeDeps();
    const load = createScriptPackLoader(env.deps);

    const first = load('math');
    env.fail();
    await expect(first).rejects.toThrow('内容包 math 缺失（packs/math.js），请重新解压完整文件夹');

    // 失败缓存被清掉 → 第二次会重新注入
    const second = load('math');
    expect(env.injects).toHaveLength(2);
    env.succeed();
    await expect(second).resolves.toEqual({ sum: ENTRY });
  });

  it('脚本执行了但没有注册内容时报错', async () => {
    const env = makeDeps();
    const load = createScriptPackLoader(env.deps);

    const pending = load('math');
    env.injects[0].done();
    await expect(pending).rejects.toThrow('内容包 math 已加载但没有注册内容');
  });

  it('缺 manifest 时报明确原因', async () => {
    const env = makeDeps(null);
    const load = createScriptPackLoader(env.deps);
    await expect(load('math')).rejects.toThrow('未找到内容包清单 packs/manifest.js');
    expect(env.injects).toHaveLength(0);
  });

  it('manifest 里没有这个分类时报未登记', async () => {
    const env = makeDeps({ text: 'packs/text.js' });
    const load = createScriptPackLoader(env.deps);
    await expect(load('math')).rejects.toThrow('内容包 math 未在 manifest 中登记');
  });
});
