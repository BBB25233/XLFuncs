import { describe, expect, it } from 'vitest';
import { FormulaParseError } from './errors';
import { tokenize } from './lexer';

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
