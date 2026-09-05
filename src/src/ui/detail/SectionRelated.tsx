import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { FunctionEntry, RelatedKind } from '@/types';
import { get } from '@/data';
import SectionTitle from '@/ui/components/SectionTitle';
import { EditableText } from '@/ui/detail/EditBar';

/**
 * 板块⑥：相关函数推荐。
 * 每个必须标注关系类型：易混淆 / 可替代 / 常搭配，并写一句「什么时候改用它」。
 */

export interface SectionRelatedProps {
  entry: FunctionEntry;
  editing: boolean;
  onRelatedFieldChange: (index: number, key: 'why', value: string) => void;
}

const KIND_LABEL: Record<RelatedKind, string> = {
  confusable: '易混淆',
  alternative: '可替代',
  companion: '常搭配',
};

const KIND_STYLE: Record<RelatedKind, string> = {
  confusable: 'border-line text-warn',
  alternative: 'border-line text-accent',
  companion: 'border-line text-ink-2',
};

export default function SectionRelated({
  entry,
  editing,
  onRelatedFieldChange,
}: SectionRelatedProps): ReactElement {
  if (entry.related.length === 0) {
    return (
      <section>
        <SectionTitle index={6} title="相关函数" />
        <p className="text-sm text-ink-3">这个函数还没有推荐相关函数。</p>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle index={6} title="相关函数" />
      <div>
        {entry.related.map((item, index) => {
          const target = get(item.id);
          const title =
            target === null
              ? item.id.toUpperCase()
              : target.zhName === null
                ? target.enName
                : `${target.zhName} ${target.enName}`;

          const inner = (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-h4 font-semibold text-ink">{title}</span>
                <span
                  className={`inline-flex h-5 items-center rounded-badge border px-2 text-xs ${KIND_STYLE[item.kind]}`}
                >
                  {KIND_LABEL[item.kind]}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-2">
                <EditableText
                  value={item.why}
                  editing={editing}
                  multiline
                  onChange={(value) => onRelatedFieldChange(index, 'why', value)}
                  ariaLabel="什么时候改用它"
                />
              </p>
            </>
          );

          return (
            <div key={`${item.id}-${index}`} className="hairline-b py-3">
              {editing || target === null ? (
                <div>{inner}</div>
              ) : (
                <Link to={`/f/${item.id}`} className="block hover:bg-bg-sub">
                  {inner}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
