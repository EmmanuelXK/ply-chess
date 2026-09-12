/** Fast stable cache key for short coach / splash lines. */
export function clipHash(...parts: string[]): string {
  let h = 2166136261;
  const input = parts.join("\u0000");
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
