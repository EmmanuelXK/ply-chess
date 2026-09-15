/**
 * Product lock: Analyze is a confirmed mode switch, never an automatic jump
 * after the book line, Ask Coach, or a miss.
 */
export function shouldAutoOpenAnalyze(
  _wasPlan?: boolean,
  _nowPlan?: boolean,
  _alreadyOpened?: boolean,
): boolean {
  return false;
}

/** First time the book line ends, ask before entering Plan. */
export function shouldPromptPlanHandoff(
  wasPlan: boolean,
  nowAtEnd: boolean,
): boolean {
  return nowAtEnd && !wasPlan;
}
