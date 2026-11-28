/**
 * 文件夹构建专用桩：包内容由运行时 catalog.js 注入，
 * 这里把静态 import 的 JSON 换成空值，避免 app.js 里重复携带 240 KB 索引。
 */
const rows: unknown[] = [];

export default rows;
