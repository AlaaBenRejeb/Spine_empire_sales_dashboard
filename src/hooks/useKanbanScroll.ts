"use client";

import { useCallback, useRef, type WheelEvent } from "react";

const EDGE_TOLERANCE = 2;

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
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const target = event.target as HTMLElement | null;
      const lane = target?.closest("[data-kanban-lane-scroll='true']") as HTMLElement | null;

      if (!lane) {
        if (isInteractiveTarget(target)) return;
        event.preventDefault();
        panBoard(event.deltaY);
        return;
      }

      const canScrollVertically = lane.scrollHeight - lane.clientHeight > EDGE_TOLERANCE;
      if (!canScrollVertically) {
        event.preventDefault();
        panBoard(event.deltaY);
        return;
      }

      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;
      const atTop = lane.scrollTop <= EDGE_TOLERANCE;
      const atBottom = lane.scrollTop + lane.clientHeight >= lane.scrollHeight - EDGE_TOLERANCE;

      if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
        event.preventDefault();
        panBoard(event.deltaY);
      }
    },
    [panBoard],
  );

  const handleRailWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (isInteractiveTarget(event.target)) return;
      event.preventDefault();
      panBoard(event.deltaY);
    },
    [panBoard],
  );

  return {
    boardRef,
    handleBoardWheel,
    handleRailWheel,
  };
}
