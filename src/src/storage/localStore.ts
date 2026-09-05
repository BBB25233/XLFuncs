/**
 * localStorage 安全读写（ARCHITECTURE §3.8 降级要求）。
 *
 * 这是**唯一**允许碰 localStorage 的地方。所有读写都用 try/catch 包住：
 * 无痕模式、配额满、禁用 cookie 都不会抛异常崩页面；写失败时降级到内存 Map，
 * 并通过 isStorageDegraded() 通知 UI 提示「你的改动只在这次会话有效」。
 */

/** 内存兜底：localStorage 不可用时顶上，保证当次会话还能正常用 */
const memoryFallback = new Map<string, string>();

/** 是否已经降级到内存存储 */
let degraded = false;

/** 探测 localStorage 是否真的可用（有些环境下对象存在但一写就抛） */
function probe(): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const probeKey = '__efg_probe__';
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

let probeResult: boolean | null = null;

/** localStorage 是否可用（结果缓存，只探测一次） */
function available(): boolean {
  if (probeResult === null) {
    probeResult = probe();
    if (!probeResult) {
      degraded = true;
    }
  }
  return probeResult;
}

/**
 * 当前是否处于「无法保存」的降级状态。
 * UI 层用它决定要不要提示 MESSAGES.unavailable。
 */
export function isStorageDegraded(): boolean {
  available();
  return degraded;
}

/** 读原始字符串；读不到（或存储不可用）返回 null */
export function readRaw(key: string): string | null {
  if (available()) {
    try {
      return localStorage.getItem(key);
    } catch {
      degraded = true;
    }
  }
  return memoryFallback.get(key) ?? null;
}

/** 写原始字符串；返回是否写成功（失败时自动降级到内存） */
export function writeRaw(key: string, value: string): boolean {
  if (available()) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      degraded = true;
    }
  }
  memoryFallback.set(key, value);
  return false;
}

/** 删除一个 key */
export function removeRaw(key: string): void {
  if (available()) {
    try {
      localStorage.removeItem(key);
    } catch {
      degraded = true;
    }
  }
  memoryFallback.delete(key);
}

/** 读 JSON；解析失败或读不到时返回 fallback，绝不抛异常 */
export function readJson<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw === null) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 写 JSON；返回是否写成功 */
export function writeJson(key: string, value: unknown): boolean {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
