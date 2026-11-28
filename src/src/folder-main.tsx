import React from 'react';
import ReactDOM from 'react-dom/client';
// 先注册经典脚本加载器，再加载依赖数据层的 App
import '@/ui/packs/scriptLoader';
import App from './App';
import './styles/index.css';
import { applyFontScale } from '@/ui/settings/fontScale';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('未找到 #root 挂载点，请检查 index.html');
}

// 文件夹构建：catalog.js 必须先于 app.js 执行，缺失时给出可读提示而不是白屏
const hasCatalog =
  (window as unknown as { __XLF_CATALOG__?: { rows?: unknown[] } }).__XLF_CATALOG__ !== undefined;

if (!hasCatalog) {
  rootElement.innerHTML =
    '<div style="max-width:640px;margin:80px auto;padding:24px;font-family:system-ui;line-height:1.8;color:#333">' +
    '<h2 style="margin:0 0 12px">目录索引没有加载</h2>' +
    '<p>找不到 <code>catalog.js</code>。请确认：</p>' +
    '<ul><li>解压的是完整的文件夹（不是只拷了 index.html）</li>' +
    '<li>index.html 与 catalog.js 在同一层目录</li></ul>' +
    '</div>';
} else {
  applyFontScale();
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
