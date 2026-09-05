import type { CategoryId, Difficulty, FunctionEntry } from '@/types';

/**
 * stub() 工厂：用一行调用生成一个「内容待补充」占位条目。
 * 用于 55 个占位函数，每个 pack 里一行调用。
 *
 * 补齐内容时，把 pack 里的 stub(...) 换成完整 FunctionEntry 即可，其余代码一行不改。
 */

export interface StubInput {
  id: string;
  /** 中文助记名；英文名为主显示时传 null */
  zhName: string | null;
  enName: string;
  category: CategoryId;
  difficulty: Difficulty;
  usageLevel: number;
  oneLiner: string;
}

/** 占位条目的统一提示文案（§8.5） */
export const DRAFT_MESSAGE = '这个函数的详细内容正在编写中';

export function stub(input: StubInput): FunctionEntry {
  return {
    id: input.id,
    enName: input.enName,
    zhName: input.zhName,
    zhCommon: [],
    alias: [],
    category: input.category,
    abbr: '',
    pinyin: '',
    keywords: [],
    difficulty: input.difficulty,
    usageLevel: input.usageLevel,
    version: {
      min: 'all',
      label: '全版本可用',
    },
    oneLiner: input.oneLiner,
    summary: DRAFT_MESSAGE,
    syntax: {
      patternCn: '',
      patternEn: '',
      args: [],
    },
    returnValue: '',
    examples: [],
    pitfalls: [],
    related: [],
    calc: {
      enabled: false,
      ranges: {},
      fields: [],
      template: '',
      cases: [],
    },
    meta: {
      updatedAt: '2025-01-15',
      status: 'draft',
      customEdited: false,
    },
  };
}
