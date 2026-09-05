/**
 * Tailwind 主题：把 PRD 第 8 章的视觉规范落成 token。
 * 全站只允许使用这里声明的色值 / 字号 / 圆角 / 间距，避免出现「这个按钮 15px、那个 16px」。
 * 设计基调：白底、0.5px 细线、大留白、无渐变、无阴影、圆角 ≤ 12px。
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
    colors: {
      // 背景
      bg: '#FFFFFF',
      'bg-sub': '#FAFAF9',
      'bg-edit': '#F5F5F3',
      'code-bg': '#F7F7F5',
      // 分隔线
      line: '#E8E8E6',
      'line-soft': '#EDEDEB',
      // 文字
      ink: '#1F1F1F',
      'ink-2': '#6B6B6B',
      'ink-3': '#9B9B9B',
      // 强调与状态
      accent: '#2563EB',
      'accent-hover': '#1D4ED8',
      ok: '#16A34A',
      warn: '#D97706',
      err: '#DC2626',
    },
    fontSize: {
      h1: ['32px', { lineHeight: '44px', fontWeight: '600' }],
      h2: ['24px', { lineHeight: '34px', fontWeight: '600' }],
      h3: ['18px', { lineHeight: '28px', fontWeight: '600' }],
      h4: ['16px', { lineHeight: '26px', fontWeight: '600' }],
      body: ['16px', { lineHeight: '28px', fontWeight: '400' }],
      sm: ['14px', { lineHeight: '22px', fontWeight: '400' }],
      xs: ['13px', { lineHeight: '20px', fontWeight: '400' }],
      code: ['15px', { lineHeight: '26px', fontWeight: '400' }],
    },
    spacing: {
      // 只允许 4 的倍数中这几档（PRD §8.5）
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
    },
    borderRadius: {
      none: '0px',
      badge: '4px',
      btn: '6px',
      input: '6px',
      code: '6px',
      card: '8px',
      modal: '12px',
    },
    maxWidth: {
      content: '760px',
    },
    screens: {
      sm: '640px',
      md: '1024px',
    },
    transitionDuration: {
      DEFAULT: '150ms',
    },
  },
  plugins: [],
};
