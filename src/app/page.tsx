import { redirect } from "next/navigation";
import { RepertoireHome } from "@/components/home/repertoire-home";
import {
  searchParamsFromRecord,
  strayOAuthCallbackPath,
} from "@/lib/auth/redirect";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const stray = strayOAuthCallbackPath("/", searchParamsFromRecord(query));
  if (stray) redirect(stray);

  return <RepertoireHome />;
}
