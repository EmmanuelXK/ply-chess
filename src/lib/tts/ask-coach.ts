/**
 * Product lock: the Learn board is quiet until the player taps Ask Coach.
 * shouldSpeakCoach / Coach Brain still decide *what* to say when asked.
 */
export function shouldAutoSpeakOnScene(): boolean {
  return false;
}
