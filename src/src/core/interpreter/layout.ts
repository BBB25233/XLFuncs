import type { ExplainRow, ExplainStep, ExplainStructure } from './model';

export interface DiagramCard {
  n: number;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  output: string;
  rows: ExplainRow[];
  /** 分支模式下列宽有限，用「标签：内容」单行排版 */
  compact: boolean;
  /** 多支汇总时的支路标签（A/B/C…）或「汇合」 */
  group?: string;
}

export interface DiagramBranch {
  side: 'left' | 'right';
  x: number;
  width: number;
  cards: DiagramCard[];
}

export interface DiagramLayout {
  mode: 'linear' | 'branch' | 'grouped';
  width: number;
  height: number;
  /** 单主干模式的编号竖线横坐标 */
  railX: number;
  /** 单主干模式的卡片 */
  cards: DiagramCard[];
  /** 分支模式的左右两支 */
  branches: DiagramBranch[];
  /** 分支模式的汇合卡片 */
  mergeCard: DiagramCard | null;
}

const WIDTH = 680;

const CARD_X = 76;
const CARD_WIDTH = 564;
const ROW_HEIGHT = 21;
const TITLE_HEIGHT = 36;
const HEAD_OFFSET = 50;
const GAP = 16;
const MAX_ROWS = 6;

const BRANCH_TOP = 56;
const BRANCH_X_LEFT = 40;
const BRANCH_X_RIGHT = 370;
const BRANCH_WIDTH = 270;
const BRANCH_TITLE = 34;
const BRANCH_ROW = 18;
const BRANCH_MAX_ROWS = 5;
const MERGE_GAP = 24;
const MERGE_X = 40;
const MERGE_WIDTH = 600;

/** 按字数截断，避免 SVG 文本溢出卡片 */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function linearHeight(rowCount: number): number {
  return TITLE_HEIGHT + rowCount * ROW_HEIGHT + 12;
}

function branchHeight(rowCount: number): number {
  return BRANCH_TITLE + rowCount * BRANCH_ROW + 10;
}

function linearCard(step: ExplainStep): Omit<DiagramCard, 'y'> {
  const rows = step.rows.slice(0, MAX_ROWS);
  return {
    n: step.n,
    x: CARD_X,
    width: CARD_WIDTH,
    height: linearHeight(rows.length),
    title: step.title,
    output: step.output,
    rows,
    compact: false,
    group: step.groupLabel,
  };
}

function branchCard(step: ExplainStep, x: number): Omit<DiagramCard, 'y'> {
  const rows = step.rows.slice(0, BRANCH_MAX_ROWS);
  return {
    n: step.n,
    x,
    width: BRANCH_WIDTH,
    height: branchHeight(rows.length),
    title: step.title,
    output: step.output,
    rows,
    compact: true,
  };
}

function pickSteps(numbers: number[], byNumber: Map<number, ExplainStep>): ExplainStep[] | null {
  const picked: ExplainStep[] = [];
  for (const n of numbers) {
    const step = byNumber.get(n);
    if (step === undefined) {
      return null;
    }
    picked.push(step);
  }
  return picked;
}

/**
 * 只算坐标与文本，不产出任何 SVG。
 *
 * - 默认单主干：所有步骤自上而下排列。
 * - 当 structure.branch 存在（根节点是二元运算，且左右两支各 ≥2 步）时，
 *   改为左右分列，最后汇合到父节点。
 */
export function layoutDiagram(steps: ExplainStep[], structure?: ExplainStructure): DiagramLayout {
  const branch = structure?.branch;

  if (branch !== undefined) {
    const byNumber = new Map(steps.map((step) => [step.n, step]));
    const leftSteps = pickSteps(branch.left, byNumber);
    const rightSteps = pickSteps(branch.right, byNumber);
    const mergeStep = byNumber.get(branch.merge);

    if (leftSteps !== null && rightSteps !== null && mergeStep !== undefined) {
      let leftCursor = BRANCH_TOP;
      const leftCards: DiagramCard[] = leftSteps.map((step) => {
        const card = branchCard(step, BRANCH_X_LEFT);
        const placed = { ...card, y: leftCursor };
        leftCursor += card.height + GAP;
        return placed;
      });

      let rightCursor = BRANCH_TOP;
      const rightCards: DiagramCard[] = rightSteps.map((step) => {
        const card = branchCard(step, BRANCH_X_RIGHT);
        const placed = { ...card, y: rightCursor };
        rightCursor += card.height + GAP;
        return placed;
      });

      const columnBottom = Math.max(leftCursor - GAP, rightCursor - GAP);
      const mergeRows = mergeStep.rows.slice(0, MAX_ROWS);
      const mergeCard: DiagramCard = {
        n: mergeStep.n,
        x: MERGE_X,
        y: columnBottom + MERGE_GAP,
        width: MERGE_WIDTH,
        height: linearHeight(mergeRows.length),
        title: mergeStep.title,
        output: mergeStep.output,
        rows: mergeRows,
        compact: false,
      };

      return {
        mode: 'branch',
        width: WIDTH,
        height: mergeCard.y + mergeCard.height + 26,
        railX: 0,
        cards: [],
        branches: [
          { side: 'left', x: BRANCH_X_LEFT, width: BRANCH_WIDTH, cards: leftCards },
          { side: 'right', x: BRANCH_X_RIGHT, width: BRANCH_WIDTH, cards: rightCards },
        ],
        mergeCard,
      };
    }
  }

  return buildLinearLayout(steps, structure?.groups === undefined ? 'linear' : 'grouped');
}

function buildLinearLayout(steps: ExplainStep[], mode: 'linear' | 'grouped'): DiagramLayout {
  let cursor = HEAD_OFFSET;
  const cards: DiagramCard[] = steps.map((step) => {
    const card = linearCard(step);
    const placed = { ...card, y: cursor };
    cursor += card.height + GAP;
    return placed;
  });

  return {
    mode,
    width: WIDTH,
    height: Math.max(cursor - GAP + 26, 160),
    railX: 52,
    cards,
    branches: [],
    mergeCard: null,
  };
}
