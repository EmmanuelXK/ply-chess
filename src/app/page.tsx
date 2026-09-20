import { OpeningCard } from "@/components/home/opening-card";
import { openings } from "@/lib/openings";

export default function HomePage() {
  return (
    <div className="home-shell">
      <header className="home-hero">
        <p className="text-[11px] font-medium tracking-[0.18em] text-zinc-500 uppercase">
          Repertoire · v1
        </p>
        <h1 className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-zinc-50">
          Opening Trainer
        </h1>
        <p className="mt-3 max-w-[22rem] text-[14px] leading-snug text-zinc-400">
          Three lines. Thirty moves. Chunk, pin, story — then plan. Built for
          serious practice, not hobby fluff.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        {openings.map((opening) => (
          <OpeningCard key={opening.id} opening={opening} />
        ))}
      </section>

      <footer className="home-foot">
        <p>
          Add opening #4 in <code>src/lib/openings</code> — same data shape. No
          UI change required.
        </p>
      </footer>
    </div>
  );
}
