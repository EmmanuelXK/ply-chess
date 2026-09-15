import { STUDY_MODES, type StudyMode } from "@/lib/reps/schedule";

export type ModeSwitchKind = StudyMode | "analyze" | "plan" | "spar";

export interface ModeSwitchCopy {
  id: ModeSwitchKind;
  title: string;
  blurb: string;
  confirm: string;
}

const EXTRA: Record<
  "analyze" | "plan" | "spar",
  { title: string; blurb: string; confirm: string }
> = {
  analyze: {
    title: "Analyze",
    blurb: "Engine plus the human plan from this position. You stay in the same study mode when you close.",
    confirm: "Open Analyze",
  },
  plan: {
    title: "Plan",
    blurb: "Book line is done. Free play with a plan voice. Analyze stays a separate tap.",
    confirm: "Enter Plan",
  },
  spar: {
    title: "Spar",
    blurb: "Keep this position. The coach plays the other side like a club human. When the game ends, pin it to this line with a short note.",
    confirm: "Spar from here",
  },
};

export function modeSwitchCopy(kind: ModeSwitchKind): ModeSwitchCopy {
  if (kind === "analyze" || kind === "plan" || kind === "spar") {
    return { id: kind, ...EXTRA[kind] };
  }
  const row = STUDY_MODES.find((item) => item.id === kind);
  return {
    id: kind,
    title: row?.label ?? "Learn",
    blurb: row?.blurb ?? "Coach walks the spine. You move.",
    confirm: `Enter ${row?.label ?? "Learn"}`,
  };
}

/** Silent jumps are banned — only skip the popup when already in that mode. */
export function shouldPromptModeSwitch(
  from: ModeSwitchKind,
  to: ModeSwitchKind,
): boolean {
  return from !== to;
}

/** Analyze is a confirmed overlay — never auto-open it after the book or Ask Coach. */
export function shouldResumeAfterExplain(): boolean {
  return true;
}
