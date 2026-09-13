import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TOTAL_COUNT } from '@/data';
import { getFontScale, setFontScale } from '@/ui/settings/fontScale';
import type { FontScale } from '@/ui/settings/fontScale';

const FONT_OPTIONS: { value: FontScale; label: string }[] = [
  { value: 'small', label: '小' },
  { value: 'normal', label: '标准' },
  { value: 'large', label: '大' },
];

/** 右侧箭头（用 SVG 而非字符，避免字体缺字） */
function Chevron(): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/**
 * 设置页（仅安卓端注册该路由）。
 * 分组：显示（字号，即时生效并持久化）/ 数据（跳转数据管理）/ 关于（跳转关于页）。
 */
export default function SettingsPage(): ReactElement {
  const [scale, setScale] = useState<FontScale>(getFontScale);

  const choose = (next: FontScale): void => {
    setFontScale(next);
    setScale(next);
  };

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-4 text-h2 text-ink">设置</h1>

      <p className="mb-2 text-xs text-ink-3">显示</p>
      <div className="hairline rounded-card bg-bg">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-ink">字号</span>
          <div className="hairline flex overflow-hidden rounded-input">
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value)}
                className={`h-[36px] w-[56px] text-sm ${
                  scale === option.value ? 'bg-accent text-[#FFFFFF]' : 'text-ink-2'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-2 mt-6 text-xs text-ink-3">数据</p>
      <div className="hairline rounded-card bg-bg">
        <Link to="/data" className="flex items-center justify-between px-4 py-3">
          <span>
            <span className="block text-sm text-ink">数据管理</span>
            <span className="mt-1 block text-xs text-ink-3">导出备份 · 导入备份 · 恢复本机修改</span>
          </span>
          <span className="text-ink-3">
            <Chevron />
          </span>
        </Link>
      </div>

      <p className="mb-2 mt-6 text-xs text-ink-3">关于</p>
      <div className="hairline rounded-card bg-bg">
        <Link to="/about" className="flex items-center justify-between px-4 py-3">
          <span>
            <span className="block text-sm text-ink">关于与免责声明</span>
            <span className="mt-1 block text-xs text-ink-3">版本 · 作者 · 开源许可</span>
          </span>
          <span className="text-ink-3">
            <Chevron />
          </span>
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-ink-3">
        Excel 函数速查 · {TOTAL_COUNT} 个函数
      </p>
    </div>
  );
}
