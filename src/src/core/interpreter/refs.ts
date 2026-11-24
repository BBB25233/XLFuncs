import type { RefParts } from './ast';

const CELL_RE = /^\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?$/;
const COLUMN_RE = /^\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}$/;
const ROW_RE = /^\$?\d+:\$?\d+$/;

function compactRange(text: string): string {
  return text.replace(/\s*:\s*/g, ':');
}

function structuredParts(body: string, name: string): RefParts {
  const inner = body.slice(name.length);
  const segments = Array.from(inner.matchAll(/\[([^[\]]*)\]/g)).map((match) => match[1].trim());
  let special: string | undefined;
  let column: string | undefined;

  for (const segment of segments) {
    if (segment.startsWith('@')) {
      special = '@';
      const rest = segment.slice(1).trim();
      if (rest !== '') {
        column = rest;
      }
      continue;
    }
    if (segment.startsWith('#')) {
      special = segment;
      continue;
    }
    if (segment !== '' && !segment.startsWith('[')) {
      column = segment;
    }
  }

  return {
    kind: 'structured',
    from: body,
    table: { name, column, special },
  };
}

/**
 * 把一段「引用原文」拆成结构化信息。
 *
 * 支持：
 * - 普通单格 / 区域：A1、$A$1、A1:B2、A:A、1:1
 * - 跨表：Sheet1!A1、'My Sheet'!A1、Sheet1:Sheet3!A1
 * - 外部工作簿：[Book1.xlsx]Sheet1!A1
 * - 结构化：表1[金额]、[@金额]、表1[[#All],[列]]
 * - 动态数组：A1#、@A1:A3
 */
export function parseReference(text: string): RefParts | null {
  let raw = text.trim();
  if (raw === '') {
    return null;
  }

  let implicit = false;
  let spill = false;

  if (raw.startsWith('@')) {
    implicit = true;
    raw = raw.slice(1).trim();
  }
  if (raw.endsWith('#')) {
    spill = true;
    raw = raw.slice(0, -1).trim();
  }

  let sheet: string | undefined;
  let sheetKind: RefParts['sheetKind'];
  let body = raw;

  if (raw.startsWith("'")) {
    let cursor = 1;
    let name = '';
    let closed = false;
    while (cursor < raw.length) {
      if (raw[cursor] === "'") {
        if (raw[cursor + 1] === "'") {
          name += "'";
          cursor += 2;
          continue;
        }
        closed = true;
        cursor += 1;
        break;
      }
      name += raw[cursor];
      cursor += 1;
    }
    if (!closed || raw[cursor] !== '!') {
      return null;
    }
    sheet = name;
    sheetKind = name.includes(':') ? '3d' : 'quoted';
    body = raw.slice(cursor + 1).trim();
  } else if (raw.startsWith('[')) {
    const close = raw.indexOf(']');
    if (close < 0) {
      return null;
    }
    const after = raw.slice(close + 1);
    const bang = after.indexOf('!');
    if (bang >= 0) {
      sheet = raw.slice(0, close + 1 + bang);
      sheetKind = 'external';
      body = after.slice(bang + 1).trim();
    }
  } else {
    const bang = raw.indexOf('!');
    if (bang >= 0) {
      const prefix = raw.slice(0, bang);
      sheet = prefix;
      sheetKind = prefix.includes(':') ? '3d' : 'normal';
      body = raw.slice(bang + 1).trim();
    }
  }

  body = compactRange(body);
  if (body === '') {
    return null;
  }

  const base: RefParts = {
    from: body,
    kind: 'cell',
  };
  if (sheet !== undefined) {
    base.sheet = sheet;
    base.sheetKind = sheetKind;
  }
  if (spill) {
    base.spill = true;
  }
  if (implicit) {
    base.implicit = true;
  }

  const bracket = body.indexOf('[');
  if (bracket >= 0) {
    const tableName = body.slice(0, bracket).trim();
    return { ...base, ...structuredParts(body, tableName) };
  }

  if (ROW_RE.test(body)) {
    return { ...base, kind: 'row' };
  }
  if (COLUMN_RE.test(body)) {
    return { ...base, kind: 'column' };
  }
  if (CELL_RE.test(body)) {
    const [from, to] = body.split(':');
    return { ...base, kind: 'cell', from, to };
  }

  return null;
}
