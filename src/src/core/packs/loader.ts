import type { FunctionEntry } from '@/types';

/**
 * 内容包加载契约（零 DOM 依赖）。
 *
 * 单文件/APK 构建走 ESM 动态 import（见 data/packs/registry.ts）；
 * 文件夹构建（file:// 双击）走经典脚本注入（见 ui/packs/scriptLoader.ts）。
 * 两者都实现同一个 PackResolver，数据层只认这个接口。
 *
 * 2026-11-27 M3 拆包：分类参数放宽为 string，让宏整包（`macro`）也能复用同一套加载器；
 * 返回类型改成泛型，调用方自己声明包内形状（函数包是 id→FunctionEntry，宏包是 MacroBundle）。
 */

export type PackData = Record<string, FunctionEntry>;

export interface PackResolver {
  /** 按包名取整包内容；失败时必须抛带中文说明的 Error */
  load(pack: string): Promise<unknown>;
}

let resolver: PackResolver | null = null;

export function setPackResolver(next: PackResolver | null): void {
  resolver = next;
}

export function getPackResolver(): PackResolver | null {
  return resolver;
}

/** 取一个内容包；未注册加载器时给出可读错误，避免白屏 */
export async function loadPack<T = PackData>(pack: string): Promise<T> {
  if (resolver === null) {
    throw new Error('内容包加载器未注册，请检查 index.html 的脚本顺序（catalog.js → packs/manifest.js → app.js）');
  }
  return (await resolver.load(pack)) as T;
}
