import { readJson, writeJson } from '@/storage/localStore';
import { STORAGE_KEYS } from '@/storage/keys';
import { IS_NATIVE } from '@/ui/native/platform';

/** 字号档位 */
export type FontScale = 'small' | 'normal' | 'large';

/** 三档对应的缩放倍数（只作用于文字与行高，间距/圆角不变） */
const MULTIPLIER: Record<FontScale, number> = {
  small: 0.9,
  normal: 1,
  large: 1.1,
};

/** 字号偏好的存储结构（独立 key `efg:v1:ui`，不并入 SiteSettings） */
interface UiPrefs {
  fontScale?: FontScale;
}

function isFontScale(value: unknown): value is FontScale {
  return value === 'small' || value === 'normal' || value === 'large';
}

/** 读取字号档位；读不到或非法时回落到 normal */
export function getFontScale(): FontScale {
  const stored = readJson<UiPrefs>(STORAGE_KEYS.ui, {});
  return isFontScale(stored.fontScale) ? stored.fontScale : 'normal';
}

/**
 * 把字号写到 <html> 的 CSS 变量 --fs 上。
 * 网页端直接返回（不写该变量），因此所有 `calc(Npx * var(--fs, 1))` 恒等于原始像素值。
 */
export function applyFontScale(scale: FontScale = getFontScale()): void {
  if (!IS_NATIVE) {
    return;
  }
  document.documentElement.style.setProperty('--fs', String(MULTIPLIER[scale]));
}

/** 保存并立即应用字号档位 */
export function setFontScale(scale: FontScale): void {
  const stored = readJson<UiPrefs>(STORAGE_KEYS.ui, {});
  writeJson(STORAGE_KEYS.ui, { ...stored, fontScale: scale });
  applyFontScale(scale);
}
