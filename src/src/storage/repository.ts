import type {
  BackupFile,
  FunctionEntry,
  FunctionOverride,
  OverridesStore,
  SiteSettings,
} from '@/types';
import { loadFunction } from '@/data/loadFunction';
import { deepDiff, deepMerge, isEmptyPatch } from './diff';
import { isStorageDegraded, readJson, removeRaw, writeJson } from './localStore';
import { downloadText, readTextFile } from './fileIo';
import {
  MESSAGES,
  SCHEMA_VERSION,
  STORAGE_KEYS,
  backupFileName,
  snapshotFileName,
} from './keys';
import { deserialize, parseBackup, readOverrides, serialize, writeOverrides } from './backup';

/**
 * 存储层对外的**唯一门面**（ARCHITECTURE §2.6）。
 *
 * 核心公式：内置 JSON ⋈ 增量 diff = 最终内容。
 * 我们更新内置内容、甲方改动自动叠加在上面，两边互不干扰（N3 / ADR-A2）。
 */

/** 保存 / 导入等操作的统一结果 */
export interface RepoResult {
  ok: boolean;
  /** 失败或需要提示时的中文说明 */
  message: string;
  /** 是否处于「无法保存」的降级状态 */
  degraded: boolean;
}

function result(ok: boolean, message: string): RepoResult {
  return { ok, message, degraded: isStorageDegraded() };
}

/** 今天的日期，YYYY-MM-DD */
function today(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ------------------------------------------------------------------ *
 * 读取
 * ------------------------------------------------------------------ */

/**
 * 取最终条目：内置原文 ⋈ 增量 diff。
 * 找不到内置条目（id 不在 60 个正式清单里）返回 null。
 */
export async function getFunctionEntry(id: string): Promise<FunctionEntry | null> {
  const base = await loadFunction(id);
  if (base === null) {
    return null;
  }
  const store = readOverrides();
  const patch = store.functions[id];
  if (patch === undefined || isEmptyPatch(patch)) {
    return base;
  }
  return {
    ...deepMerge(base, patch),
    meta: {
      ...deepMerge(base.meta, patch.meta),
      customEdited: true,
    },
  };
}

/** 取内置原文（不含甲方的任何改动），用于「恢复官方原文」与算 diff */
export async function getOfficialEntry(id: string): Promise<FunctionEntry | null> {
  return loadFunction(id);
}

/* ------------------------------------------------------------------ *
 * 写入
 * ------------------------------------------------------------------ */

/**
 * 保存一个条目：取内置原文 → deepDiff → 只写差异。
 * 会自动补上 meta.customEdited = true 与 updatedAt = 今天。
 */
export async function saveFunction(entry: FunctionEntry): Promise<RepoResult> {
  const base = await loadFunction(entry.id);
  if (base === null) {
    return result(false, '这个函数不在清单里，无法保存');
  }

  // 先把 meta 的两项按规则补齐，再算差异，保证「只存真正改动过的字段」
  const normalized: FunctionEntry = {
    ...entry,
    meta: {
      ...entry.meta,
      updatedAt: today(),
      customEdited: true,
    },
  };

  const patch = deepDiff(base, normalized);
  const store = readOverrides();

  if (patch === undefined || isEmptyPatch(patch)) {
    // 没有任何实质改动：清掉已有的增量，等价于「恢复官方原文」
    delete store.functions[entry.id];
    writeOverrides(store);
    return result(true, MESSAGES.saved);
  }

  store.functions[entry.id] = patch;
  const written = writeOverrides(store);
  return written
    ? result(true, MESSAGES.saved)
    : result(false, MESSAGES.unavailable);
}

/** 恢复单个函数到团队初稿（删掉该 id 的增量即可，天然幂等） */
export function resetFunction(id: string): RepoResult {
  const store = readOverrides();
  if (store.functions[id] === undefined) {
    return result(true, MESSAGES.restored('这个函数'));
  }
  delete store.functions[id];
  writeOverrides(store);
  return result(true, MESSAGES.restored('这个函数'));
}

/** 恢复全站（清空全部增量） */
export function resetAll(): RepoResult {
  writeOverrides({ schemaVersion: SCHEMA_VERSION, functions: {} });
  return result(true, MESSAGES.restored('全部内容'));
}

/** 被甲方改过的函数 id 列表（数据管理页显示「你改过 M 个」） */
export function listOverriddenIds(): string[] {
  return Object.keys(readOverrides().functions);
}

/** 被甲方改过的函数数量 */
export function countOverridden(): number {
  return listOverriddenIds().length;
}

/* ------------------------------------------------------------------ *
 * 备份导入导出
 * ------------------------------------------------------------------ */

/** 导出备份：返回备份文件结构（落盘由 fileIo 完成） */
export function exportBackup(): BackupFile {
  return serialize(readOverrides().functions, new Date());
}

/** 导出备份并触发下载 */
export function downloadBackup(): RepoResult {
  const backup = exportBackup();
  const fileName = backupFileName(new Date());
  downloadText(fileName, JSON.stringify(backup, null, 2), 'application/json');
  markExported();
  return result(true, MESSAGES.exported(fileName));
}

/**
 * 导入恢复：校验 → 先自动下载一份当前快照（防误覆盖）→ 覆盖。
 * 二次确认由 UI 层用 MESSAGES.importConfirm 弹窗完成，这里只负责执行。
 */
export async function importBackup(file: File): Promise<RepoResult> {
  let raw: string;
  try {
    raw = await readTextFile(file);
  } catch (error) {
    return result(false, error instanceof Error ? error.message : MESSAGES.importBadFile);
  }

  const parsed = parseBackup(raw);
  if (!parsed.ok) {
    return result(false, parsed.reason);
  }

  // 导入前先自动下载一份当前快照，防止误覆盖后找不回来
  const current = serialize(readOverrides().functions, new Date());
  downloadText(
    snapshotFileName(new Date()),
    JSON.stringify(current, null, 2),
    'application/json',
  );

  const store: OverridesStore = deserialize(parsed.backup);
  writeOverrides(store);
  markImported();

  const count = Object.keys(store.functions).length;
  return result(true, MESSAGES.imported(count));
}

/* ------------------------------------------------------------------ *
 * 站点设置
 * ------------------------------------------------------------------ */

const DEFAULT_SETTINGS: SiteSettings = {
  lastExportAt: null,
  lastImportAt: null,
  onboardingSeen: false,
};

/** 读站点设置 */
export function getSettings(): SiteSettings {
  const stored = readJson<SiteSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

/** 写站点设置 */
export function saveSettings(settings: SiteSettings): boolean {
  return writeJson(STORAGE_KEYS.settings, settings);
}

/** 记录一次导出时间 */
export function markExported(): void {
  saveSettings({ ...getSettings(), lastExportAt: new Date().toISOString() });
}

/** 记录一次导入时间 */
export function markImported(): void {
  saveSettings({ ...getSettings(), lastImportAt: new Date().toISOString() });
}

/* ------------------------------------------------------------------ *
 * 最近浏览（P1-09，第一版只记录不展示，见 U6）
 * ------------------------------------------------------------------ */

const RECENT_LIMIT = 20;

/** 记录一次浏览 */
export function pushRecent(id: string): void {
  const list = readJson<string[]>(STORAGE_KEYS.recent, []);
  const next = [id, ...list.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
  writeJson(STORAGE_KEYS.recent, next);
}

/** 读最近浏览记录 */
export function getRecent(): string[] {
  return readJson<string[]>(STORAGE_KEYS.recent, []);
}

/** 清空最近浏览记录 */
export function clearRecent(): void {
  removeRaw(STORAGE_KEYS.recent);
}

/** 当前是否处于「无法保存」的降级状态（UI 用它决定是否提示） */
export function storageDegraded(): boolean {
  return isStorageDegraded();
}

/** 取某个函数的增量（调试与数据管理页用） */
export function getOverride(id: string): FunctionOverride | undefined {
  return readOverrides().functions[id];
}
