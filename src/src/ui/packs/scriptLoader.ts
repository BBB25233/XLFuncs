import type { FunctionEntry } from '@/types';
import { setPackResolver } from '@/core/packs/loader';

/**
 * 文件夹（file://）构建的唯一内容包加载实现。
 *
 * 为什么不用 import()/fetch：file:// 的 origin 是 null，ESM 与 fetch 都会被 CORS 拒绝，
 * 只有经典 <script src> 不受限制（2026-11-26 实测确认）。
 *
 * 包文件约定：执行后把自己挂到 window.__XLF_PACKS__[包名] = { default: ... }。
 * 12 个函数分类包的 default 是 id→FunctionEntry；宏整包的 default 是 MacroBundle，
 * 所以这里与包内形状解耦：registry 只要求 { default: unknown }，由调用方用泛型声明。
 *
 * 为了让「并发去重 / 失败可重试 / 各类错误文案」能在 node 环境单测，
 * 真正的 DOM 注入被抽成依赖（见默认实现 defaultDeps），逻辑本体是纯函数。
 */

interface PackRegistryEntry {
  default: unknown;
}

type PackRegistry = Record<string, PackRegistryEntry>;

export type PackData = Record<string, FunctionEntry>;

export interface ScriptInjectDeps {
  /** 读 window.__XLF_PACKS__ */
  registry: () => PackRegistry | undefined;
  /** 读 window.__XLF_PACKS_MANIFEST__ */
  manifest: () => Record<string, string> | undefined;
  /** 追加一个经典 <script src>；结束（成功或失败）时调用 done，失败传 Error */
  inject: (src: string, done: (err?: Error) => void) => void;
}

/**
 * 造一个按包名加载内容包的方法。
 * 同一个包名的并发请求只注入一个 <script>；失败后清掉缓存，允许重试。
 */
export function createScriptPackLoader<T = PackData>(
  deps: ScriptInjectDeps,
): (pack: string) => Promise<T> {
  const inflight = new Map<string, Promise<T>>();

  return (pack: string): Promise<T> => {
    const ready = deps.registry()?.[pack];
    if (ready !== undefined) {
      return Promise.resolve(ready.default as T);
    }

    const pending = inflight.get(pack);
    if (pending !== undefined) {
      return pending;
    }

    const manifest = deps.manifest();
    if (manifest === undefined) {
      return Promise.reject(
        new Error('未找到内容包清单 packs/manifest.js，请确认解压后的文件夹完整'),
      );
    }
    const src = manifest[pack];
    if (src === undefined || src === '') {
      return Promise.reject(new Error(`内容包 ${pack} 未在 manifest 中登记`));
    }

    const promise = new Promise<T>((resolve, reject) => {
      deps.inject(src, (err) => {
        if (err !== undefined) {
          reject(new Error(`内容包 ${pack} 缺失（${src}），请重新解压完整文件夹`));
          return;
        }
        const entry = deps.registry()?.[pack];
        if (entry === undefined) {
          reject(new Error(`内容包 ${pack} 已加载但没有注册内容，请重新解压完整文件夹`));
          return;
        }
        resolve(entry.default as T);
      });
    });

    inflight.set(pack, promise);
    void promise.catch(() => {
      inflight.delete(pack);
    });
    return promise;
  };
}

/** 真实 DOM 注入实现（只在文件夹构建里生效） */
const defaultDeps: ScriptInjectDeps = {
  registry: () => (window as unknown as { __XLF_PACKS__?: PackRegistry }).__XLF_PACKS__,
  manifest: () =>
    (window as unknown as { __XLF_PACKS_MANIFEST__?: Record<string, string> })
      .__XLF_PACKS_MANIFEST__,
  inject: (src, done) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => done();
    script.onerror = () => done(new Error('script load failed'));
    document.head.appendChild(script);
  },
};

export const loadPackViaScript = createScriptPackLoader(defaultDeps);

/** 在文件夹构建里自注册；单文件/APK 构建不会 import 本模块，因此不生效 */
setPackResolver({
  load: (pack: string) => loadPackViaScript(pack),
});
