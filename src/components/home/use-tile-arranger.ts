"use client";

import { useEffect, useState, type RefObject } from "react";
import { arrangeTiles, type TileLayout } from "@/lib/openings/arranger";

export function useTileArranger(
  ref: RefObject<HTMLElement | null>,
): TileLayout | null {
  const [layout, setLayout] = useState<TileLayout | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setLayout(arrangeTiles(width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return layout;
}
