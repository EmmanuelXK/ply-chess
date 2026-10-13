/** Place a badge inside the destination square, inset from the top-right corner. */
export function markAnchor(
  square: string,
  orientation: "white" | "black",
): { left: string; top: string; transform: string } {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const x = orientation === "white" ? file : 7 - file;
  const y = orientation === "white" ? 7 - rank : rank;
  const right = (x + 0.96) * 12.5;
  const top = (y + 0.06) * 12.5;
  return {
    left: `${right}%`,
    top: `${top}%`,
    transform: "translate(-100%, 0)",
  };
}
