export class CoachHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CoachHttpError";
    this.status = status;
  }
}

/** A failed answer keeps the reserved question. */
export function spentCount(reserved: number, failed: boolean): number {
  return failed ? Math.max(0, reserved - 1) : reserved;
}

export function coachFailureMessage(status: number, detail: string): string {
  const text = `${status} ${detail}`.toLowerCase();
  if (
    status === 402 ||
    /credit|billing|insufficient|too low|payment required/.test(text)
  ) {
    return "Coach account out of credit";
  }
  if (
    status === 429 ||
    status === 503 ||
    status === 529 ||
    /rate.?limit|overloaded|too many requests/.test(text)
  ) {
    return "Coach busy, try again";
  }
  if (status === 0 || /not-configured|not configured/.test(text)) {
    return "Coach not connected yet";
  }
  return "Coach could not answer. Try again.";
}
