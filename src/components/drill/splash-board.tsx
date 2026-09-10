"use client";

import { useMemo } from "react";
import type { Key } from "@lichess-org/chessground/types";
import {
  ChessBoard,
  type BoardArrow,
  type BoardGlyph,
} from "@/components/board/chess-board";

const EMPTY_DESTS = new Map<Key, Key[]>();
const EMPTY_ARROWS: BoardArrow[] = [];

export function SplashBoard({
  fen,
  lastMove,
  orientation,
  turnColor,
  check,
  arrows,
  glyphs,
  circles,
  animationMs = 140,
}: {
  fen: string;
  lastMove: Key[] | null;
  orientation: "white" | "black";
  turnColor: "white" | "black";
  check?: boolean;
  arrows?: BoardArrow[];
  glyphs?: BoardGlyph[];
  circles?: Key[];
  animationMs?: number;
}) {
  const drawn = useMemo<BoardArrow[]>(() => {
    if (arrows) return arrows;
    if (lastMove && lastMove.length === 2) {
      return [{ orig: lastMove[0], dest: lastMove[1], brush: "last" }];
    }
    return EMPTY_ARROWS;
  }, [arrows, lastMove]);

  return (
    <ChessBoard
      fen={fen}
      dests={EMPTY_DESTS}
      lastMove={lastMove}
      arrows={drawn}
      glyphs={glyphs}
      circles={circles}
      orientation={orientation}
      turnColor={turnColor}
      viewOnly
      movableColor={undefined}
      check={check}
      coordinates={false}
      animationMs={animationMs}
      onMove={() => {}}
    />
  );
}
