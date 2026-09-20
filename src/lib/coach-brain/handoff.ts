/** First time the book line ends, hand the student to Analyze. */
export function shouldAutoOpenAnalyze(
  wasPlan: boolean,
  nowPlan: boolean,
  alreadyOpened: boolean,
): boolean {
  return nowPlan && !wasPlan && !alreadyOpened;
}
