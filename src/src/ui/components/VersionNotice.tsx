import type { ReactElement } from 'react';
import type { VersionInfo } from '@/types';
import { useCopy } from '@/ui/clipboard/useCopy';

/**
 * 版本与兼容性提示条（§3.5，team-lead Q9 决策的落地组件）。
 *
 * 每个函数页面都必须标注「最低可用版本」；新函数（XLOOKUP / UNIQUE / TEXTJOIN / IFS 等）
 * 必须显著提示旧版不可用，并给出可直接复制的旧版替代写法。
 * 隐藏函数（DATEDIF）与动态数组函数（UNIQUE / FILTER）额外提示。
 */

export interface VersionNoticeProps {
  version: VersionInfo;
  /** 是否为 Excel 隐藏函数（无智能提示、函数列表搜不到） */
  hiddenFunction?: boolean;
  /** 是否为动态数组函数（结果会溢出到多个单元格） */
  dynamicArray?: boolean;
  /** 低于该版本的 Excel 完全没有此函数（决定提示条用「警告」还是「说明」语气） */
  warning?: boolean;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactElement | string;
}): ReactElement {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <span className="shrink-0 text-xs text-ink-3 sm:w-16">{label}</span>
      <div className="text-sm text-ink-2">{children}</div>
    </div>
  );
}

export default function VersionNotice({
  version,
  hiddenFunction = false,
  dynamicArray = false,
  warning,
}: VersionNoticeProps): ReactElement {
  const { copy } = useCopy();
  const isWarning = warning ?? (version.min === '365' || version.min === '2019');

  return (
    <div
      className={`rounded-card px-4 py-3 ${
        isWarning ? 'bg-bg-sub hairline' : 'bg-bg-sub hairline'
      }`}
    >
      <div className="flex flex-col gap-3">
        <Row label="最低版本">
          <span className={isWarning ? 'text-warn' : 'text-ink-2'}>{version.label}</span>
        </Row>

        {version.legacyAlternative === undefined ? null : (
          <Row label="旧版写法">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <code className="min-w-0 flex-1 break-all font-mono text-sm text-ink">
                  {version.legacyAlternative.expr}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    void copy(version.legacyAlternative?.expr ?? '');
                  }}
                  className="shrink-0 text-xs text-accent hover:text-accent-hover"
                >
                  复制
                </button>
              </div>
              <p className="text-xs text-ink-3">{version.legacyAlternative.note}</p>
            </div>
          </Row>
        )}

        {version.notes === undefined ? null : (
          <Row label="提示">
            <span className="text-ink-2">{version.notes}</span>
          </Row>
        )}

        {hiddenFunction ? (
          <Row label="隐藏函数">
            <span className="text-warn">
              这是 Excel 的隐藏函数：函数列表里搜不到、输入时没有智能提示，必须手动完整输入。
            </span>
          </Row>
        ) : null}

        {dynamicArray ? (
          <Row label="动态数组">
            <span className="text-warn">
              结果会自动溢出到下方多个单元格，目标区域有内容时会报 #SPILL!。
            </span>
          </Row>
        ) : null}
      </div>
    </div>
  );
}
