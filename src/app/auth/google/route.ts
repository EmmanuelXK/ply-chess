import { type NextRequest } from "next/server";
import { handleGoogleStart } from "@/lib/auth/oauth-start";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleGoogleStart(request);
}
