import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { applyFontScale } from '@/ui/settings/fontScale';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('未找到 #root 挂载点，请检查 index.html');
}

// 安卓端冷启动即应用已保存的字号，避免先按标准字号渲染一帧再跳档；网页端内部直接返回。
applyFontScale();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
