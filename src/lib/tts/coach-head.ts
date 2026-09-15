export type CoachHeadPresence = "hidden" | "idle" | "speak";

/**
 * Product lock: the coach mark appears only for an Ask Coach session.
 * Speak-wave while TTS is live; idle if the sheet is open but silent; hidden when the session ends.
 * Not a draggable dual-coach chat head.
 */
export function coachHeadPresence(input: {
  sessionOpen: boolean;
  speaking: boolean;
}): CoachHeadPresence {
  if (!input.sessionOpen) return "hidden";
  return input.speaking ? "speak" : "idle";
}
