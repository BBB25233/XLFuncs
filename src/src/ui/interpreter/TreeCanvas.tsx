import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactElement } from 'react';
import type { TreeLayout } from '@/core/interpreter';
import { ZOOM, clampScale, fitScale, panCenter, viewBoxFor, zoomAt } from '@/core/interpreter';
import TreeView from './TreeView';

export interface TreeCanvasProps {
  layout: TreeLayout;
  activeStep?: number;
  onSelectStep?: (stepN: number) => void;
  onToggle?: (id: string) => void;
  onClose: () => void;
}

interface Size {
  width: number;
  height: number;
}

const FALLBACK: Size = { width: 800, height: 600 };

/** 全屏画布：双指缩放、拖动平移、双击放大、适应屏幕；缩得太小时隐藏文字 */
export default function TreeCanvas({
  layout,
  activeStep,
  onSelectStep,
  onToggle,
  onClose,
}: TreeCanvasProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>(FALLBACK);
  const [scale, setScale] = useState(1);
  const [center, setCenter] = useState({ x: layout.width / 2, y: layout.height / 2 });
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<{ label: string; stepN: number } | null>(null);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ scale: number; center: { x: number; y: number }; dist: number } | null>(null);
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const moved = useRef(false);
  const live = useRef({ scale, center });
  live.current = { scale, center };

  const fit = (): void => {
    setScale(fitScale(layout.width, layout.height, size.width, size.height));
    setCenter({ x: layout.width / 2, y: layout.height / 2 });
  };

  useEffect(() => {
    const element = containerRef.current;
    if (element === null) {
      return;
    }
    const rect = element.getBoundingClientRect();
    // 容器尚未布局时用兜底尺寸，避免一直空白
    const next =
      rect.width > 0 && rect.height > 0
        ? { width: rect.width, height: rect.height }
        : FALLBACK;
    setSize(next);
    setScale(fitScale(layout.width, layout.height, next.width, next.height));
    setReady(true);
  }, [layout]);

  useEffect(() => {
    const onResize = (): void => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect !== undefined && rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (element === null) {
      return;
    }
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const factor = Math.exp(-event.deltaY * 0.0015);
      const result = zoomAt(
        live.current.center,
        live.current.scale,
        live.current.scale * factor,
        anchor,
        size.width,
        size.height,
      );
      setScale(result.scale);
      setCenter(result.center);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, [size.width, size.height]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const viewBox = viewBoxFor(center, scale, size.width, size.height);

  const zoomBy = (factor: number): void => {
    const next = zoomAt(
      center,
      scale,
      scale * factor,
      { x: size.width / 2, y: size.height / 2 },
      size.width,
      size.height,
    );
    setScale(next.scale);
    setCenter(next.center);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    moved.current = false;

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = {
        scale,
        center,
        dist: Math.hypot(a.x - b.x, a.y - b.y),
      };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const previous = pointers.current.get(event.pointerId);
    if (previous === undefined) {
      return;
    }
    const next = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, next);

    if (Math.abs(next.x - previous.x) + Math.abs(next.y - previous.y) > 2) {
      moved.current = true;
    }

    if (pointers.current.size === 1) {
      setCenter((current) =>
        panCenter(current, { x: next.x - previous.x, y: next.y - previous.y }, scale, layout.width, layout.height),
      );
      return;
    }

    if (pointers.current.size === 2 && pinch.current !== null) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = containerRef.current?.getBoundingClientRect();
      const mid = {
        x: (a.x + b.x) / 2 - (rect?.left ?? 0),
        y: (a.y + b.y) / 2 - (rect?.top ?? 0),
      };
      const target = clampScale(pinch.current.scale * (dist / Math.max(1, pinch.current.dist)));
      const result = zoomAt(pinch.current.center, pinch.current.scale, target, mid, size.width, size.height);
      setScale(result.scale);
      setCenter(result.center);
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) {
      pinch.current = null;
    }

    if (moved.current) {
      return;
    }

    const now = Date.now();
    const point = { x: event.clientX, y: event.clientY };
    const last = lastTap.current;
    if (last !== null && now - last.time < 300 && Math.abs(last.x - point.x) < 30 && Math.abs(last.y - point.y) < 30) {
      const rect = containerRef.current?.getBoundingClientRect();
      const anchor = { x: point.x - (rect?.left ?? 0), y: point.y - (rect?.top ?? 0) };
      const target = scale < ZOOM.doubleTap * 0.9 ? ZOOM.doubleTap : 1;
      const result = zoomAt(center, scale, target, anchor, size.width, size.height);
      setScale(result.scale);
      setCenter(result.center);
      lastTap.current = null;
      return;
    }
    lastTap.current = { time: now, x: point.x, y: point.y };
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 1000, backgroundColor: '#FFFFFF' }}
      role="dialog"
      aria-label="公式结构全屏查看"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm text-ink">公式结构</p>
          <p className="text-xs text-ink-3">
            {Math.round(scale * 100)}% · 双指缩放 · 双击放大 · 拖动平移
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.25)}
            className="h-9 w-9 rounded-btn border border-line text-sm text-ink-2"
            aria-label="缩小"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.25)}
            className="h-9 w-9 rounded-btn border border-line text-sm text-ink-2"
            aria-label="放大"
          >
            +
          </button>
          <button
            type="button"
            onClick={fit}
            className="h-9 rounded-btn border border-line px-2 text-xs text-ink-2"
          >
            适应屏幕
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-btn border border-line px-2 text-xs text-ink-2"
          >
            关闭
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {ready ? (
          <TreeView
            layout={layout}
            activeStep={activeStep}
            onSelectStep={(stepN) => {
              const box = layout.boxes.find((item) => item.stepN === stepN);
              setPicked({ label: box?.label ?? '', stepN });
              onSelectStep?.(stepN);
            }}
            onToggle={onToggle}
            showLabels={scale >= ZOOM.textThreshold}
            viewport={viewBox}
          />
        ) : null}
      </div>

      {picked === null ? null : (
        <div className="border-t border-line bg-bg-sub px-3 py-2">
          <p className="break-words text-sm text-ink [overflow-wrap:anywhere]">
            {picked.label}
            <span className="ml-2 text-xs text-ink-3">第 {picked.stepN} 步</span>
          </p>
        </div>
      )}
    </div>
  );
}
