import type { ReactElement } from 'react';
import type { TreeLayout } from '@/core/interpreter';
import { TREE_NODE, truncate } from '@/core/interpreter';

export interface TreeViewProps {
  layout: TreeLayout;
  activeStep?: number;
  onSelectStep?: (stepN: number) => void;
  onToggle?: (id: string) => void;
  /** 缩得太小时只保留形状，隐藏文字与徽标 */
  showLabels?: boolean;
  /** 全屏画布用：外部接管 viewBox，SVG 撑满容器 */
  viewport?: { x: number; y: number; width: number; height: number };
}

const OPERATOR_COLORS: Record<string, string> = {
  binary: '#217346',
  unary: '#854F0B',
};

/** 三档视觉：函数卡片 / 运算符圆点 / 叶子文字；根在下方，自内向外 */
export default function TreeView({
  layout,
  activeStep,
  onSelectStep,
  onToggle,
  showLabels = true,
  viewport,
}: TreeViewProps): ReactElement {
  const box = viewport ?? { x: 0, y: 0, width: layout.width, height: layout.height };

  return (
    <div className={viewport === undefined ? 'overflow-x-auto' : 'h-full w-full'}>
      <svg
        width={viewport === undefined ? layout.width : '100%'}
        height={viewport === undefined ? layout.height : '100%'}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        className={viewport === undefined ? 'max-w-none' : 'block h-full w-full'}
        role="img"
        aria-label="公式表达式树"
      >
        <title>公式表达式树</title>
        <desc>按语法结构展开的树，上方是里层表达式，下方是最终结果。</desc>

        <defs>
          <marker
            id="tree-arrow"
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerWidth={5}
            markerHeight={5}
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

        {layout.edges.map((edge) => (
          <path
            key={edge.id}
            d={`M ${edge.x1} ${edge.y1} C ${edge.x1} ${edge.y1 + 32}, ${edge.x2} ${edge.y2 - 32}, ${edge.x2} ${edge.y2}`}
            fill="none"
            stroke="#D6D3D1"
            strokeWidth={1.5}
            markerEnd="url(#tree-arrow)"
          />
        ))}

        {layout.boxes.map((box) => {
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const stepN = box.stepN;
          const active = stepN !== undefined && stepN === activeStep;
          const clickable = stepN !== undefined && onSelectStep !== undefined;
          const onClick =
            clickable && stepN !== undefined && onSelectStep !== undefined
              ? () => onSelectStep(stepN)
              : undefined;

          // 叶子：只标文字，不放卡片
          if (box.variant === 'leaf') {
            const lines = box.lines.length > 0 ? box.lines : [box.label];
            const lineHeight = TREE_NODE.lineHeight;
            const startY = centerY - ((lines.length - 1) * lineHeight) / 2;

            return (
              <g key={box.id}>
                {/* 悬停显示完整值：文字被折行或省略后仍可读到原文 */}
                <title>{box.label}</title>
                <circle cx={centerX} cy={box.y + box.height} r={3} fill="#9B9B9B" />
                <text
                  display={showLabels ? undefined : 'none'}
                  x={centerX}
                  y={startY}
                  fontSize={12}
                  fill="#6B6B6B"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {lines.map((line, index) => (
                    <tspan key={`${box.id}-${index}`} x={centerX} dy={index === 0 ? 0 : lineHeight}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          }

          // 运算符：小圆点，保留步骤编号与点击联动
          if (box.variant === 'operator') {
            const color = OPERATOR_COLORS[box.kind] ?? '#6B6B6B';
            return (
              <g key={box.id} onClick={onClick} style={{ cursor: clickable ? 'pointer' : 'default' }}>
                <title>{stepN === undefined ? box.label : `${box.label} · 第 ${stepN} 步`}</title>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={14}
                  fill={active ? '#F0F6FF' : '#FFFFFF'}
                  stroke={active ? '#2563EB' : color}
                  strokeWidth={active ? 2 : 1.5}
                />
                <text
                  display={showLabels ? undefined : 'none'}
                  x={centerX}
                  y={centerY}
                  fontSize={13}
                  fill="#1F1F1F"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {box.label}
                </text>
                {stepN === undefined || !showLabels ? null : (
                  <>
                    <circle cx={centerX + 13} cy={centerY - 13} r={6.5} fill={color} />
                    <text
                      x={centerX + 13}
                      y={centerY - 13}
                      fontSize={8}
                      fill="#FFFFFF"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {stepN}
                    </text>
                  </>
                )}
              </g>
            );
          }

          // 函数：完整卡片
          const color = '#2563EB';
          return (
            <g key={box.id} onClick={onClick} style={{ cursor: clickable ? 'pointer' : 'default' }}>
              <title>{box.label}</title>
              <rect
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                rx={8}
                fill="#FFFFFF"
                stroke={active ? '#2563EB' : '#E8E8E6'}
                strokeWidth={active ? 1.5 : 0.5}
              />
              <rect x={box.x} y={box.y} width={4} height={box.height} fill={color} />

              <text
                display={showLabels ? undefined : 'none'}
                x={centerX}
                y={centerY}
                fontSize={12.5}
                fill="#1F1F1F"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {truncate(box.label, 12)}
              </text>

              {box.collapsible && showLabels ? (
                <g
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(box.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={box.x + box.width - 50}
                    y={box.y + box.height - 17}
                    width={42}
                    height={14}
                    rx={7}
                    fill="#F5F5F3"
                    stroke="#E8E8E6"
                    strokeWidth={0.5}
                  />
                  <text
                    x={box.x + box.width - 29}
                    y={box.y + box.height - 10}
                    fontSize={9.5}
                    fill="#6B6B6B"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {box.collapsed ? `+${box.hiddenCount}` : '-'}
                  </text>
                </g>
              ) : null}

              {stepN === undefined || !showLabels ? null : (
                <>
                  <circle cx={box.x + box.width - 14} cy={box.y + 14} r={9} fill={color} />
                  <text
                    x={box.x + box.width - 14}
                    y={box.y + 14}
                    fontSize={10}
                    fill="#FFFFFF"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {stepN}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
