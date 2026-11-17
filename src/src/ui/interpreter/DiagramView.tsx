import type { ReactElement } from 'react';
import type { DiagramCard, DiagramLayout } from '@/core/interpreter';
import { truncate } from '@/core/interpreter';

export interface DiagramViewProps {
  layout: DiagramLayout;
}

const ROW_OFFSET = 40;
const ROW_HEIGHT = 21;
const COMPACT_TITLE = 34;
const COMPACT_ROW = 18;

const GROUP_COLORS: Record<string, string> = {
  A: '#2563EB',
  B: '#217346',
  C: '#854F0B',
  汇合: '#6B6B6B',
};

interface CardProps {
  card: DiagramCard;
  railX: number;
  badgeInside: boolean;
}

function Card({ card, railX, badgeInside }: CardProps): ReactElement {
  const badgeX = badgeInside ? card.x + 22 : railX;
  const titleX = badgeInside ? card.x + 42 : card.x + 20;
  const accent = card.group === undefined ? '#2563EB' : GROUP_COLORS[card.group] ?? '#6B6B6B';

  return (
    <g>
      <rect
        x={card.x}
        y={card.y}
        width={card.width}
        height={card.height}
        rx={8}
        fill="#FFFFFF"
        stroke="#E8E8E6"
        strokeWidth={0.5}
      />
      <rect x={card.x} y={card.y} width={4} height={card.height} fill={accent} />

      <circle cx={badgeX} cy={card.y + 21} r={12} fill={accent} />
      <text
        x={badgeX}
        y={card.y + 21}
        fontSize={11}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {card.n}
      </text>

      <text
        x={titleX}
        y={card.y + 21}
        fontSize={13.5}
        fontWeight={500}
        fill="#1F1F1F"
        dominantBaseline="central"
      >
        {truncate(card.title, card.compact ? 14 : 24)}
      </text>

      {card.compact ? null : (
        <>
          <text
            x={card.x + card.width - (card.group === undefined ? 14 : 64)}
            y={card.y + 21}
            fontSize={12}
            fill="#6B6B6B"
            textAnchor="end"
            dominantBaseline="central"
          >
            产出：{truncate(card.output, 7)}
          </text>
          {card.group === undefined ? null : (
            <>
              <rect
                x={card.x + card.width - 52}
                y={card.y + 11}
                width={38}
                height={20}
                rx={4}
                fill={accent}
                opacity={0.12}
              />
              <text
                x={card.x + card.width - 33}
                y={card.y + 21}
                fontSize={11}
                fill={accent}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {card.group === '汇合' ? '汇合' : `支${card.group}`}
              </text>
            </>
          )}
        </>
      )}

      {card.rows.map((row, index) => {
        if (card.compact) {
          const rowY = card.y + COMPACT_TITLE + index * COMPACT_ROW;
          return (
            <text
              key={`${card.n}-${index}`}
              x={card.x + 14}
              y={rowY}
              fontSize={11.5}
              fill="#1F1F1F"
              dominantBaseline="central"
            >
              {truncate(`${row.k}：${row.v}`, 17)}
            </text>
          );
        }

        const rowY = card.y + ROW_OFFSET + index * ROW_HEIGHT;
        return (
          <g key={`${card.n}-${index}`}>
            <text
              x={card.x + 20}
              y={rowY}
              fontSize={12}
              fill="#9B9B9B"
              dominantBaseline="central"
            >
              {row.k}
            </text>
            <text
              x={card.x + 106}
              y={rowY}
              fontSize={12.5}
              fill="#1F1F1F"
              dominantBaseline="central"
            >
              {truncate(row.v, 34)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** 只消费坐标数据，渲染交给 React；不使用 innerHTML。 */
export default function DiagramView({ layout }: DiagramViewProps): ReactElement {
  const mergeCard = layout.mergeCard;
  const isBranch = layout.mode === 'branch' && mergeCard !== null;
  const groupLabels = Array.from(
    new Set(
      layout.cards
        .map((card) => card.group)
        .filter((group): group is string => group !== undefined && group !== '汇合'),
    ),
  );

  const header = isBranch
    ? `计算流程：左右两支各自计算，最后在第 ${mergeCard.n} 步汇合`
    : layout.mode === 'grouped'
      ? `计算流程：分 ${groupLabels.length} 支（${groupLabels.join(' / ')}），按编号顺序依次汇合`
      : `计算流程：共 ${layout.cards.length} 步，从最里层开始，一层层往外算`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="w-full"
        role="img"
        aria-label="公式计算流程图"
      >
        <title>公式计算流程图</title>
        <desc>
          {isBranch
            ? '左右两支并行计算，最后汇合到同一个步骤。'
            : layout.mode === 'grouped'
              ? `分 ${groupLabels.length} 支分别计算，按编号顺序依次汇合。`
              : `按执行顺序排列的步骤，共 ${layout.cards.length} 步。`}
        </desc>

        <defs>
          <marker
            id="interpreter-arrow"
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="#D6D3D1"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        <text x={40} y={28} fontSize={13} fill="#6B6B6B">
          {header}
        </text>

        {isBranch
          ? layout.branches.map((branch) => {
              const last = branch.cards[branch.cards.length - 1];
              return (
                <g key={branch.side}>
                  {branch.cards.map((card) => (
                    <Card key={card.n} card={card} railX={0} badgeInside />
                  ))}
                  {last === undefined ? null : (
                    <line
                      x1={branch.x + branch.width / 2}
                      y1={last.y + last.height}
                      x2={branch.x + branch.width / 2}
                      y2={mergeCard.y - 4}
                      stroke="#D6D3D1"
                      strokeWidth={1.5}
                      markerEnd="url(#interpreter-arrow)"
                    />
                  )}
                </g>
              );
            })
          : layout.cards.map((card, index) => (
              <g key={card.n}>
                <Card card={card} railX={layout.railX} badgeInside={false} />
                {index < layout.cards.length - 1 ? (
                  <line
                    x1={layout.railX}
                    y1={card.y + 33}
                    x2={layout.railX}
                    y2={layout.cards[index + 1].y + 8}
                    stroke="#D6D3D1"
                    strokeWidth={1.5}
                    markerEnd="url(#interpreter-arrow)"
                  />
                ) : null}
              </g>
            ))}

        {isBranch ? (
          <Card card={mergeCard} railX={0} badgeInside />
        ) : null}
      </svg>
    </div>
  );
}
