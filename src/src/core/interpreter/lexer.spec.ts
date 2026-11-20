import { describe, expect, it } from 'vitest';
import { FormulaParseError } from './errors';
import { tokenize, scanTokens } from './lexer';

describe('tokenize', () => {
  it('先识别引用再识别函数名，不会把 SUM 当成列名', () => {
    const tokens = tokenize('SUM(A2:B10)');
    expect(tokens.map((token) => token.type)).toEqual([
      'name',
      'leftParen',
      'reference',
      'rightParen',
    ]);
    expect(tokens[2].text).toBe('A2:B10');
  });

  it('支持整列引用与绝对引用', () => {
    expect(tokenize('D:F')[0]).toMatchObject({ type: 'reference', text: 'D:F' });
    expect(tokenize('$A$2')[0].text).toBe('$A$2');
  });

  it('文本内连续双引号按转义处理', () => {
    const tokens = tokenize('"他说""好"""');
    expect(tokens[0].type).toBe('string');
    expect(tokens[0].text).toBe('他说"好"');
  });

  it('接受全角括号与全角逗号', () => {
    const tokens = tokenize('SUM（A2，1）');
    expect(tokens.map((token) => token.type)).toEqual([
      'name',
      'leftParen',
      'reference',
      'comma',
      'number',
      'rightParen',
    ]);
  });

  it('字母+数字+字母的函数名不会被误判为单元格引用', () => {
    expect(tokenize('BIN2DEC(A1)')[0]).toMatchObject({ type: 'name', text: 'BIN2DEC' });
    expect(tokenize('DEC2HEX(255)')[0]).toMatchObject({ type: 'name', text: 'DEC2HEX' });
    expect(tokenize('LOG10(100)')[0]).toMatchObject({ type: 'name', text: 'LOG10' });
    expect(tokenize('A2')[0]).toMatchObject({ type: 'reference', text: 'A2' });
  });

  it('文本缺右引号时报错并给出位置', () => {
    try {
      tokenize('"未闭合');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(FormulaParseError);
      expect((error as FormulaParseError).position).toBe(0);
    }
  });
});

describe('scanTokens（宽容扫描）', () => {
  it('合法公式不产生任何诊断', () => {
    const result = scanTokens('SUM(A1:B2)+1');
    expect(result.diagnostics).toHaveLength(0);
    expect(result.tokens.length).toBeGreaterThan(0);
  });

  it('未闭合文本记录 E101 并继续产出 token', () => {
    const result = scanTokens('"未闭合');
    expect(result.diagnostics.map((item) => item.code)).toContain('E101');
    expect(result.tokens[0]).toMatchObject({ type: 'string', text: '未闭合' });
  });

  it('非法字符记录 E102 并跳过，其余内容仍可扫描', () => {
    const result = scanTokens('1#2');
    expect(result.diagnostics.map((item) => item.code)).toContain('E102');
    expect(result.tokens.filter((token) => token.type === 'number')).toHaveLength(2);
  });

  it('全角运算符给出警告与可一键替换的修复', () => {
    const result = scanTokens('1＋2');
    const diagnostic = result.diagnostics.find((item) => item.code === 'W405');
    expect(diagnostic?.severity).toBe('warning');
    expect(diagnostic?.fix).toMatchObject({ text: '+', start: 1, end: 2 });
  });

  it('全角括号与逗号给出警告但照常解析', () => {
    const result = scanTokens('SUM（A2，1）');
    expect(result.diagnostics.filter((item) => item.code === 'W405')).toHaveLength(3);
    expect(result.tokens.filter((token) => token.type === 'leftParen')).toHaveLength(1);
    expect(result.tokens.filter((token) => token.type === 'comma')).toHaveLength(1);
  });

  it('多个小数点记录 E103', () => {
    const result = scanTokens('1.2.3');
    expect(result.diagnostics.map((item) => item.code)).toContain('E103');
  });

  it('严格 tokenize 仍对错误抛异常', () => {
    expect(() => tokenize('1#2')).toThrow(FormulaParseError);
  });
});
