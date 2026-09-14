/** Viewport-aware widget grid. Home tiles stay square; columns grow with the stage. */

export interface TileLayout {
  cols: number;
  tile: number;
  gap: number;
}

const PHONE_GAP = 12;
const TABLET_GAP = 18;
const PHONE_TILE = 104;
const TABLET_TILE = 126;
const WIDE_TILE = 118;

export function arrangeTiles(width: number): TileLayout {
  const w = Math.max(0, Math.floor(width));
  const tablet = w >= 640;
  const wide = w >= 1000;
  const gap = tablet ? TABLET_GAP : PHONE_GAP;
  const minCols = w < 340 ? 2 : tablet ? 4 : 3;
  const maxCols = wide ? 8 : tablet ? 5 : 3;
  const preferred = wide ? WIDE_TILE : tablet ? TABLET_TILE : PHONE_TILE;

  if (w <= 0) {
    return { cols: minCols, tile: preferred, gap };
  }

  let cols = Math.floor((w + gap) / (preferred + gap));
  cols = Math.max(minCols, Math.min(maxCols, cols));
  const tile = Math.max(72, Math.floor((w - gap * (cols - 1)) / cols));
  return { cols, tile, gap };
}

export function guessTileLayout(
  viewportWidth = typeof window === "undefined" ? 390 : window.innerWidth,
): TileLayout {
  const pad = viewportWidth >= 640 ? 80 : 40;
  return arrangeTiles(Math.max(280, viewportWidth - pad));
}
