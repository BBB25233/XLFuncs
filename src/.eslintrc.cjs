/**
 * 轻量 ESLint 规则：只开 react-hooks 与未使用变量，不做格式化军规。
 * 解析器用 @typescript-eslint/parser（否则默认解析器无法解析 .ts）。
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  // vitest 全局函数（避免出现 no-undef 误报）
  globals: {
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    vi: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
  },
  ignorePatterns: ['dist', 'node_modules', '.tmp', '.eslintrc.cjs', 'scripts'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // 未使用变量交给 TS 版（能识别类型与泛型参数）
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // 项目 handler 契约广泛使用 any（ok/fail 的类型擦除），放宽
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    // 以下三条对 TS 项目属于冗余或误报，交由 tsc / 业务语义把关：
    'no-undef': 'off', // TS 由 tsc 全权负责未定义标识符（React / DOM 类型误报）
    'no-useless-escape': 'off', // 样例数据里大量含引号字符串，转义无害
    'no-irregular-whitespace': 'off', // text.ts 的 FULLWIDTH 正则有意匹配全角空格 U+3000
  },
};
