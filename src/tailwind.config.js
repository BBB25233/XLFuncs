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
    // 字号统一乘以 --fs：安卓端「字号」设置用它缩放；网页端该变量缺省为 1，
    // 因此 calc(32px * 1) === 32px，渲染与改动前逐像素一致。
    // 只缩放文字与行高；spacing / borderRadius 不受影响。
    fontSize: {
      h1: ['calc(32px * var(--fs, 1))', { lineHeight: 'calc(44px * var(--fs, 1))', fontWeight: '600' }],
      h2: ['calc(24px * var(--fs, 1))', { lineHeight: 'calc(34px * var(--fs, 1))', fontWeight: '600' }],
      h3: ['calc(18px * var(--fs, 1))', { lineHeight: 'calc(28px * var(--fs, 1))', fontWeight: '600' }],
      h4: ['calc(16px * var(--fs, 1))', { lineHeight: 'calc(26px * var(--fs, 1))', fontWeight: '600' }],
      body: ['calc(16px * var(--fs, 1))', { lineHeight: 'calc(28px * var(--fs, 1))', fontWeight: '400' }],
      sm: ['calc(14px * var(--fs, 1))', { lineHeight: 'calc(22px * var(--fs, 1))', fontWeight: '400' }],
      xs: ['calc(13px * var(--fs, 1))', { lineHeight: 'calc(20px * var(--fs, 1))', fontWeight: '400' }],
      code: ['calc(15px * var(--fs, 1))', { lineHeight: 'calc(26px * var(--fs, 1))', fontWeight: '400' }],
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
