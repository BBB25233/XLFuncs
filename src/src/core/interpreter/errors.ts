/** 公式解析错误：必须带字符位置，便于界面定位到具体字符。 */
export class FormulaParseError extends Error {
  readonly position: number;

  constructor(message: string, position: number) {
    super(message);
    this.name = 'FormulaParseError';
    this.position = position;
  }
}
