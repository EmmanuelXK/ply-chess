import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="home-shell flex flex-1 flex-col items-start justify-center">
      <p className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
        Missed
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-50">
        That line isn&apos;t in the book.
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        v1 is London, Pirc, Black Lion. Pick one of those.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to repertoire</Link>
      </Button>
    </div>
  );
}
