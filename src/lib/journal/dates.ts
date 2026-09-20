/** Device-local calendar day. Documented in README — not UTC, not Europe/Paris-forced. */

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfTomorrow(d: Date): Date {
  const next = startOfLocalDay(d);
  next.setDate(next.getDate() + 1);
  return next;
}

export function calendarDaysUntil(due: Date, now: Date): number {
  const a = startOfLocalDay(due).getTime();
  const b = startOfLocalDay(now).getTime();
  return Math.round((a - b) / 86_400_000);
}

export function formatDueLabel(due: Date, now: Date): string {
  const days = calendarDaysUntil(due, now);
  if (days <= 0) return "Due now";
  if (days === 1) return "Tomorrow";
  return `In ${days}d`;
}

export function isDueAt(due: Date, now: Date): boolean {
  return due.getTime() <= now.getTime();
}
