import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Daily coach cap for a no-login app.
 *
 * There is no Vercel KV, Upstash, or other shared store in this project.
 * The limit is best-effort:
 * - an httpOnly cookie signed on the server, so the browser cannot edit the count
 * - an in-memory counter keyed by IP + device id, for the life of this server process
 *
 * The higher of the two counts is enforced. Both reset at midnight Europe/Paris.
 * A cold start forgets the memory map; the cookie still limits that browser.
 * Clearing the cookie and rotating the device id starts a new allowance.
 */

export const COACH_DAILY_LIMIT = 10;
export const COACH_COOKIE = "edges_coach";

export interface QuotaStamp {
  day: string;
  count: number;
  device: string;
}

const memory = new Map<string, { day: string; count: number }>();

export function parisDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function quotaBucket(ip: string, device: string): string {
  return `${ip.trim() || "unknown"}|${device.trim() || "anon"}`;
}

function secret(): string {
  return (
    process.env.COACH_QUOTA_SECRET?.trim() ||
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.ANTHROPIC_API_KEY?.trim() ||
    "edges-coach-local"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sealQuota(stamp: QuotaStamp): string {
  const payload = `${stamp.day}.${stamp.count}.${stamp.device}`;
  return `${payload}.${sign(payload)}`;
}

export function openQuota(token: string | undefined | null): QuotaStamp | null {
  if (!token) return null;
  const split = token.lastIndexOf(".");
  if (split <= 0) return null;
  const payload = token.slice(0, split);
  const mac = token.slice(split + 1);
  const expected = sign(payload);
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  const [day, countText, device] = payload.split(".");
  const count = Number(countText);
  if (!day || !device || !Number.isInteger(count) || count < 0) return null;
  return { day, count, device };
}

export function rememberedCount(bucket: string, day: string): number {
  const row = memory.get(bucket);
  if (!row || row.day !== day) return 0;
  return row.count;
}

export function rememberCount(bucket: string, day: string, count: number): void {
  memory.set(bucket, { day, count });
}

/** Test hook. Production code never needs to wipe the process map. */
export function resetQuotaMemory(): void {
  memory.clear();
}

export function allowance(
  bucket: string,
  cookie: QuotaStamp | null,
  device: string,
  now = new Date(),
): number {
  const day = parisDay(now);
  const fromCookie = cookie && cookie.day === day && cookie.device === device ? cookie.count : 0;
  return Math.max(rememberedCount(bucket, day), fromCookie);
}
