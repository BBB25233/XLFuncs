#!/usr/bin/env node
/**
 * 拼音字段生成脚本（ADR-A6 / PRD §7.14）
 *
 * - 读 src/data/catalog.json
 * - zhName 非 null → 生成 pinyin（全拼无声调）与 abbr（首字母）
 * - zhName 为 null → pinyin = abbr = enName.toLowerCase()（英文名为主显示）
 * - 写回原文件：保持固定字段顺序、2 空格缩进、末尾换行，保证幂等
 * - 冲突检测：命中 PRD §7.14 已知冲突组打印 WARN；出现未知冲突或全拼重复 → 报错退出
 *
 * 用法：npm run gen:pinyin
 *
 * 拼音引擎优先级：pinyin-pro（构建期依赖，不进生产包）→ 缺失时回退到内置汉字映射表。
 * 内置表覆盖 catalog.json 现有中文名用到的全部汉字，保证离线环境也能跑通并保持幂等。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = resolve(__dirname, '../src/data/catalog.json');

/** PRD §7.14 与增补件 §2.1 已知的拼音首字母冲突组（已知即 WARN，未知才报错） */
const KNOWN_CONFLICT_GROUPS = new Set(['y', 'z', 'xz', 'h', 'ss', 'rq']);

/** 字段在 JSON 里的输出顺序，保证写回幂等 */
const FIELD_ORDER = [
  'id',
  'enName',
  'zhName',
  'zhCommon',
  'alias',
  'category',
  'difficulty',
  'usageLevel',
  'minVersion',
  'oneLiner',
  'status',
  'abbr',
  'pinyin',
];

/* ------------------------------------------------------------------ *
 * 内置汉字 → 拼音映射（pinyin-pro 不可用时的回退）
 * 覆盖 catalog.json 里 53 个中文名用到的全部汉字，另附一批常见备用字。
 * ------------------------------------------------------------------ */
const PINYIN_TABLE = {
  // 逻辑
  条: 'tiao', 件: 'jian', 判: 'pan', 断: 'duan', 防: 'fang', 错: 'cuo',
  显: 'xian', 示: 'shi', 与: 'yu', 或: 'huo', 非: 'fei',
  // 文本
  从: 'cong', 左: 'zuo', 截: 'jie', 取: 'qu', 右: 'you', 中: 'zhong',
  间: 'jian', 文: 'wen', 本: 'ben', 长: 'chang', 度: 'du', 清: 'qing',
  除: 'chu', 空: 'kong', 格: 'ge', 式: 'shi', 化: 'hua', 查: 'cha',
  找: 'zhao', 字: 'zi', 符: 'fu', 位: 'wei', 置: 'zhi', 替: 'ti',
  换: 'huan', 转: 'zhuan', 数: 'shu', 值: 'zhi',
  // 日期与时间
  今: 'jin', 天: 'tian', 现: 'xian', 在: 'zai', 生: 'sheng', 成: 'cheng',
  日: 'ri', 期: 'qi', 年: 'nian', 份: 'fen', 月: 'yue', 推: 'tui',
  移: 'yi',
  // 查找与引用
  纵: 'zong', 向: 'xiang', 索: 'suo', 引: 'yin', 匹: 'pi', 配: 'pei',
  接: 'jie', 用: 'yong', 偏: 'pian', 行: 'hang', 列: 'lie', 号: 'hao',
  // 数学
  求: 'qiu', 和: 'he', 多: 'duo', 乘: 'cheng', 积: 'ji', 四: 'si',
  舍: 'she', 五: 'wu', 入: 'ru', 上: 'shang', 下: 'xia', 整: 'zheng',
  // 统计
  计: 'ji', 均: 'jun', 平: 'ping', 最: 'zui', 大: 'da', 小: 'xiao',
  // 财务
  每: 'mei', 付: 'fu', 款: 'kuan', 额: 'e', 利: 'li', 率: 'lv', 终: 'zhong',
  // 信息
  是: 'shi', 否: 'fou', 为: 'wei',
  // 工程 / 数据库
  单: 'dan', 算: 'suan', 据: 'ju', 库: 'ku',
  // 常见备用字（中文名将来微调时不用改脚本）
  总: 'zong', 加: 'jia', 减: 'jian', 保: 'bao', 留: 'liu', 分: 'fen',
  类: 'lei', 表: 'biao', 名: 'ming', 称: 'cheng', 按: 'an', 组: 'zu',
  排: 'pai', 序: 'xu', 差: 'cha', 点: 'dian', 标: 'biao', 签: 'qian',
  输: 'shu', 出: 'chu', 前: 'qian', 后: 'hou', 内: 'nei', 外: 'wai',
  高: 'gao', 低: 'di', 开: 'kai', 关: 'guan', 首: 'shou', 尾: 'wei',
  去: 'qu', 掉: 'diao', 合: 'he', 并: 'bing', 拆: 'chai', 拼: 'pin',
  连: 'lian', 数2: 'shu', 项: 'xiang', 条2: 'tiao', 次: 'ci', 层: 'ceng',
  条3: 'tiao',
};

/** 只保留汉字，逐字查表 */
function pinyinOf(zh) {
  const chars = Array.from(String(zh)).filter((ch) => PINYIN_TABLE[ch] !== undefined);
  if (chars.length === 0) {
    return { pinyin: '', abbr: '' };
  }
  const syllables = chars.map((ch) => PINYIN_TABLE[ch]);
  return {
    pinyin: syllables.join(''),
    abbr: syllables.map((s) => s[0]).join(''),
  };
}

/**
 * 尝试加载 pinyin-pro（构建期依赖，不进生产包）。
 * @returns {((zh: string) => string[]) | null} 返回「汉字串 → 音节数组」的函数
 */
async function tryLoadPinyinPro() {
  try {
    const mod = await import('pinyin-pro');
    if (typeof mod.pinyin === 'function') {
      return (zh) => mod.pinyin(zh, { toneType: 'none', type: 'array', v: true });
    }
    return null;
  } catch {
    return null;
  }
}

/** 按固定顺序重建一行，保证写回幂等 */
function normalizeRow(row) {
  const out = {};
  for (const key of FIELD_ORDER) {
    if (row[key] !== undefined) {
      out[key] = row[key];
    }
  }
  // 兜底：未列入 FIELD_ORDER 的字段追加在后，防止丢数据
  for (const key of Object.keys(row)) {
    if (!(key in out)) {
      out[key] = row[key];
    }
  }
  return out;
}

/** 写回 catalog.json（2 空格缩进 + 末尾换行） */
function writeCatalog(rows) {
  writeFileSync(CATALOG_PATH, JSON.stringify(rows, null, 2) + '\n', 'utf8');
}

async function main() {
  const rows = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));

  const pro = await tryLoadPinyinPro();
  if (pro === null) {
    console.log('[gen:pinyin] 未检测到 pinyin-pro，使用内置汉字映射表（结果一致且幂等）');
  } else {
    console.log('[gen:pinyin] 使用 pinyin-pro 生成拼音');
  }

  let changed = 0;
  let failed = false;

  const next = rows.map((row) => {
    const zhName = row.zhName === null || row.zhName === undefined ? null : String(row.zhName);
    let pinyin;
    let abbr;

    if (zhName === null) {
      // 英文名为主显示：拼音字段直接用小写英文名（team-lead Q9 / 增补件 §2.2）
      const lower = String(row.enName).toLowerCase();
      pinyin = lower;
      abbr = lower;
    } else if (pro !== null) {
      const syllables = pro(zhName);
      pinyin = syllables.join('').toLowerCase();
      abbr = syllables.map((s) => (s === '' ? '' : s[0])).join('').toLowerCase();
    } else {
      const built = pinyinOf(zhName);
      pinyin = built.pinyin;
      abbr = built.abbr;
    }

    if (pinyin === '' && zhName !== null) {
      console.error(
        `[gen:pinyin] ERROR 无法为「${zhName}」(${row.id}) 生成拼音，请安装 pinyin-pro 或补充内置映射表`,
      );
      failed = true;
    }

    if (row.pinyin !== pinyin || row.abbr !== abbr) {
      changed += 1;
    }

    return normalizeRow({ ...row, abbr, pinyin });
  });

  // ---------------- 冲突检测 ----------------
  const abbrGroups = new Map();
  const pinyinGroups = new Map();
  for (const row of next) {
    abbrGroups.set(row.abbr, [...(abbrGroups.get(row.abbr) ?? []), row.id]);
    pinyinGroups.set(row.pinyin, [...(pinyinGroups.get(row.pinyin) ?? []), row.id]);
  }

  let hasError = failed;

  for (const [abbr, ids] of [...abbrGroups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (ids.length < 2) continue;
    if (KNOWN_CONFLICT_GROUPS.has(abbr)) {
      console.warn(
        `[gen:pinyin] WARN 已知冲突组「${abbr}」：${ids.join(' / ')} —— 全拼可消歧，搜索按全拼优先排序`,
      );
    } else {
      console.error(
        `[gen:pinyin] ERROR 未知的新拼音首字母冲突「${abbr}」：${ids.join(' / ')} —— 请调整中文助记名或用 alias 消歧`,
      );
      hasError = true;
    }
  }

  for (const [pinyin, ids] of [...pinyinGroups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    if (ids.length < 2) continue;
    console.error(
      `[gen:pinyin] ERROR 全拼重复「${pinyin}」：${ids.join(' / ')} —— 全拼必须唯一，请调整中文助记名`,
    );
    hasError = true;
  }

  writeCatalog(next);

  if (hasError) {
    console.error('[gen:pinyin] 冲突检测未通过（拼音已写回文件，修复冲突后重跑）');
    process.exit(1);
  }

  console.log(`[gen:pinyin] 完成：共 ${next.length} 条，更新 ${changed} 条，无未知冲突`);
}

main().catch((error) => {
  console.error('[gen:pinyin] 运行失败：', error);
  process.exit(1);
});
