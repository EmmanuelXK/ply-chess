import { CoachHttpError, coachErrorDetail } from "@/lib/coach/errors";
import { COACH_SYSTEM } from "@/lib/coach/prompt";

/** Visible reply budget. Thinking is turned down so this cap is the answer. */
export const COACH_MAX_OUTPUT_TOKENS = 400;

const GATEWAY_MODEL = "anthropic/claude-sonnet-5.5";
const ANTHROPIC_MODEL = "claude-sonnet-5-5";

export function coachKeyKind(): "gateway" | "anthropic" | null {
  if (process.env.AI_GATEWAY_API_KEY?.trim()) return "gateway";
  if (process.env.ANTHROPIC_API_KEY?.trim()) return "anthropic";
  return null;
}

interface MessageBlock {
  type?: string;
  text?: string;
}

/**
 * Claude Sonnet 5.5.
 * AI_GATEWAY_API_KEY uses the gateway's Anthropic Messages endpoint.
 * ANTHROPIC_API_KEY calls Anthropic directly. The key stays on the server.
 */
export async function askCoach(user: string, signal?: AbortSignal): Promise<string> {
  const kind = coachKeyKind();
  if (!kind) throw new CoachHttpError(0, "coach-not-configured");
  const gateway = kind === "gateway";
  const key = (gateway ? process.env.AI_GATEWAY_API_KEY : process.env.ANTHROPIC_API_KEY)?.trim();
  if (!key) throw new CoachHttpError(0, "coach-not-configured");

  const response = await fetch(
    gateway ? "https://ai-gateway.vercel.sh/v1/messages" : "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": key,
      },
      body: JSON.stringify({
        model: gateway ? GATEWAY_MODEL : ANTHROPIC_MODEL,
        max_tokens: COACH_MAX_OUTPUT_TOKENS,
        system: COACH_SYSTEM,
        messages: [{ role: "user", content: user }],
        // Sonnet 5.5 thinks by default. between_tools skips the up-front pass
        // when there are no tools, so the token cap stays on the reply.
        thinking: { type: "between_tools" },
        output_config: { effort: "low" },
      }),
    },
  );

  const body = (await response.json().catch(() => null)) as {
    content?: MessageBlock[];
    error?: { message?: string } | string;
    message?: string;
  } | null;
  if (!response.ok) {
    throw new CoachHttpError(response.status, coachErrorDetail(response.status, body));
  }
  const text = (body?.content ?? [])
    .filter((block) => block.type === "text" && block.text?.trim())
    .map((block) => block.text?.trim())
    .join("\n")
    .trim();
  if (!text) throw new CoachHttpError(502, "coach returned an empty reply");
  return text;
}
