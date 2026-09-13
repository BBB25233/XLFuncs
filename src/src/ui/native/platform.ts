import { Capacitor } from '@capacitor/core';

/**
 * 是否运行在 Capacitor 原生壳内（安卓 App）。
 * 网页端（含 GitHub Release 单文件）恒为 false —— 所有原生专用的界面与行为都用它守卫，
 * 以确保网页端的渲染与交互与改动前完全一致。
 */
export const IS_NATIVE: boolean = Capacitor.isNativePlatform();
