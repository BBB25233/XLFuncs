/** 公式解释器的示例公式（纯常量，不参与任何计算） */

export interface InterpreterSample {
  label: string;
  formula: string;
}

export const INTERPRETER_SAMPLES: InterpreterSample[] = [
  {
    label: '查价 × 数量 + 合计',
    formula: '=IFERROR(VLOOKUP(A2,D:F,3,0)*C2+SUM(B2:B10),"未找到")',
  },
  {
    label: '条件判断',
    formula: '=IF(B2>=60,"及格","不及格")',
  },
  {
    label: '求和后求平均',
    formula: '=ROUND(SUM(B2:B10)/COUNT(B2:B10),2)',
  },
  {
    label: '截取并拼接',
    formula: '=LEFT(A2,3)&"-"&RIGHT(A2,4)',
  },
];
