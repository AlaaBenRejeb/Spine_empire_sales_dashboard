"use client";

import { useCallback, useRef, type WheelEvent } from "react";

const EDGE_TOLERANCE = 1;

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
};

export function useKanbanScroll() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const panBoard = useCallback((delta: number) => {
    const board = boardRef.current;
    if (!board) return;
    board.scrollBy({ left: delta, behavior: "auto" });
  }, []);

  const handleBoardWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      const target = event.target as HTMLElement | null;
      if (isInteractiveTarget(target)) return;
      const lane = target?.closest("[data-kanban-lane-scroll='true']") as HTMLElement | null;
      const hasHorizontalIntent =
        Math.abs(event.deltaX) > EDGE_TOLERANCE ||
        (event.shiftKey && Math.abs(event.deltaY) > EDGE_TOLERANCE);
      const hasVerticalIntent = Math.abs(event.deltaY) > EDGE_TOLERANCE;

      if (hasHorizontalIntent) {
        event.preventDefault();
        panBoard(Math.abs(event.deltaX) > EDGE_TOLERANCE ? event.deltaX : event.deltaY);
        return;
      }

      if (!lane || !hasVerticalIntent) {
        return;
      }

      const canScrollVertically = lane.scrollHeight - lane.clientHeight > EDGE_TOLERANCE;
      event.preventDefault();

      if (!canScrollVertically) {
        return;
      }

      const maxScrollTop = Math.max(lane.scrollHeight - lane.clientHeight, 0);
      const nextScrollTop = Math.min(Math.max(lane.scrollTop + event.deltaY, 0), maxScrollTop);
      lane.scrollTop = nextScrollTop;
    },
    [panBoard],
  );

  const handleRailWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (isInteractiveTarget(event.target)) return;
      const horizontalDelta =
        Math.abs(event.deltaX) > EDGE_TOLERANCE
          ? event.deltaX
          : event.shiftKey && Math.abs(event.deltaY) > EDGE_TOLERANCE
            ? event.deltaY
            : 0;
      if (Math.abs(horizontalDelta) <= EDGE_TOLERANCE) return;
      event.preventDefault();
      panBoard(horizontalDelta);
    },
    [panBoard],
  );

  return {
    boardRef,
    handleBoardWheel,
    handleRailWheel,
  };
}
