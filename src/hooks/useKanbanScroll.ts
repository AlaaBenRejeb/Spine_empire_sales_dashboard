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
      const hasHorizontalIntent = Math.abs(event.deltaX) > EDGE_TOLERANCE;
      const hasVerticalIntent = Math.abs(event.deltaY) > EDGE_TOLERANCE;

      if (hasHorizontalIntent) {
        event.preventDefault();
        panBoard(event.deltaX);
        return;
      }

      if (!lane || !hasVerticalIntent) {
        return;
      }

      const canScrollVertically = lane.scrollHeight - lane.clientHeight > EDGE_TOLERANCE;
      if (!canScrollVertically) {
        return;
      }

      const maxScrollTop = Math.max(lane.scrollHeight - lane.clientHeight, 0);
      const movingDown = event.deltaY > 0;
      const movingUp = event.deltaY < 0;
      const atTop = lane.scrollTop <= EDGE_TOLERANCE;
      const atBottom = lane.scrollTop >= maxScrollTop - EDGE_TOLERANCE;

      if ((movingDown && !atBottom) || (movingUp && !atTop)) {
        const nextScrollTop = Math.min(Math.max(lane.scrollTop + event.deltaY, 0), maxScrollTop);
        event.preventDefault();
        lane.scrollTop = nextScrollTop;
        return;
      }

      event.preventDefault();
      panBoard(event.deltaY);
    },
    [panBoard],
  );

  const handleRailWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (isInteractiveTarget(event.target)) return;
      if (Math.abs(event.deltaX) <= EDGE_TOLERANCE) return;
      event.preventDefault();
      panBoard(event.deltaX);
    },
    [panBoard],
  );

  return {
    boardRef,
    handleBoardWheel,
    handleRailWheel,
  };
}
