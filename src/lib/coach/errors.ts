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
    /credit|billing|insufficient|too low|payment required|quota|balance|funds/.test(text)
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

/** Read a provider failure whether the body uses a string or `{ error: { message } }`. */
export function coachErrorDetail(status: number, body: unknown): string {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const error = record?.error;
  let detail = "";
  if (typeof error === "string") detail = error;
  else if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") detail = message;
  } else if (typeof record?.message === "string") detail = record.message;
  return coachFailureMessage(status, detail.slice(0, 180) || `coach request failed (${status})`);
}

export const COACH_OUT_OF_CREDIT = "Coach account out of credit";
