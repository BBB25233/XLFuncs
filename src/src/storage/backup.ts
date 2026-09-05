import type { BackupFile, FunctionOverride, OverridesStore } from '@/types';
import { BACKUP_APP, MESSAGES, SCHEMA_VERSION } from './keys';
import { readJson, writeJson } from './localStore';
import { STORAGE_KEYS } from './keys';

/**
 * 备份文件的序列化 / 反序列化 / 结构校验。
 * 导入校验必须检查 app 标识与 schemaVersion；失败返回**中文**原因，禁止抛英文异常。
 */

/** 校验 / 解析的结果 */
export type ParseResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; reason: string };

/** 当前全部增量 → 备份文件 */
export function serialize(
  functions: Record<string, FunctionOverride>,
  date: Date = new Date(),
): BackupFile {
  return {
    schemaVersion: SCHEMA_VERSION,
    app: BACKUP_APP,
    exportedAt: date.toISOString(),
    kind: 'overrides',
    functions,
  };
}

/** 判断一个值是不是「id → 增量」的对象 */
function isFunctionMap(value: unknown): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value as Record<string, unknown>).every(
    (item) => item !== null && typeof item === 'object',
  );
}

/**
 * 校验并解析备份文件文本。
 * 失败时给出能看懂的中文原因（对应 §8.5 的「这个文件不是本工具导出的备份，请确认后重试」）。
 */
export function parseBackup(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: MESSAGES.importBadFile };
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, reason: MESSAGES.importBadFile };
  }

  const candidate = parsed as Record<string, unknown>;

  if (candidate.app !== BACKUP_APP) {
    return { ok: false, reason: MESSAGES.importBadFile };
  }
  if (candidate.kind !== 'overrides') {
    return { ok: false, reason: MESSAGES.importBadFile };
  }
  if (typeof candidate.schemaVersion !== 'number' || candidate.schemaVersion < 1) {
    return { ok: false, reason: MESSAGES.importBadFile };
  }
  if (candidate.schemaVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      reason: '这个备份文件来自更新版本的工具，请先用新版工具打开后再导入',
    };
  }
  if (!isFunctionMap(candidate.functions)) {
    return { ok: false, reason: MESSAGES.importBadFile };
  }

  return {
    ok: true,
    backup: {
      schemaVersion: candidate.schemaVersion,
      app: BACKUP_APP,
      exportedAt:
        typeof candidate.exportedAt === 'string' ? candidate.exportedAt : new Date().toISOString(),
      kind: 'overrides',
      functions: candidate.functions as Record<string, FunctionOverride>,
    },
  };
}

/** 备份文件 → localStorage 里的结构 */
export function deserialize(backup: BackupFile): OverridesStore {
  return {
    schemaVersion: SCHEMA_VERSION,
    functions: backup.functions,
  };
}

/** 读当前全部增量 */
export function readOverrides(): OverridesStore {
  const fallback: OverridesStore = { schemaVersion: SCHEMA_VERSION, functions: {} };
  const stored = readJson<OverridesStore>(STORAGE_KEYS.overrides, fallback);
  if (
    stored === null ||
    typeof stored !== 'object' ||
    stored.functions === undefined ||
    typeof stored.functions !== 'object'
  ) {
    return fallback;
  }
  return { schemaVersion: SCHEMA_VERSION, functions: stored.functions };
}

/** 写全部增量；返回是否真正落盘 */
export function writeOverrides(store: OverridesStore): boolean {
  return writeJson(STORAGE_KEYS.overrides, store);
}
