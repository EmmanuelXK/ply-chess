/**
 * Chessground keeps a dedicated `piece.ghost` node on the origin square
 * during a drag and hides it with inline `display: none`. Tailwind preflight
 * forces `piece { display: block !important }`, which un-hides that ghost
 * after every drag, snap-back, or cg.set. Fade clones can also stick if an
 * animation is interrupted by a later FEN sync (opponent autoplay, Back).
 */

export type TransientPiece = {
  className: string;
  classList: { remove: (token: string) => void };
  style: {
    setProperty: (name: string, value: string, priority?: string) => void;
    removeProperty: (name: string) => void;
  };
  remove?: () => void;
};

export type TransientRoot = {
  querySelectorAll: (selectors: string) => ArrayLike<TransientPiece>;
};

export function clearChessgroundTransients(root: TransientRoot): void {
  for (const ghost of Array.from(root.querySelectorAll("piece.ghost"))) {
    ghost.className = "ghost";
    ghost.style.setProperty("display", "none", "important");
    ghost.style.setProperty("visibility", "hidden", "important");
    ghost.style.setProperty("opacity", "0", "important");
    ghost.style.removeProperty("transform");
    ghost.style.removeProperty("background-image");
  }
  for (const piece of Array.from(root.querySelectorAll("piece.dragging"))) {
    piece.classList.remove("dragging");
  }
}

export function dropStuckFadingPieces(root: TransientRoot): void {
  for (const fading of Array.from(root.querySelectorAll("piece.fading"))) {
    fading.remove?.();
  }
  for (const anim of Array.from(root.querySelectorAll("piece.anim"))) {
    anim.classList.remove("anim");
  }
}
