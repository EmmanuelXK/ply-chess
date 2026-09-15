"use client";

import type { JournalPin } from "@/lib/journal/store";
import { pgnSnippet, pinLabel } from "@/lib/journal/store";

export function MemoryGames({
  games,
  onOpen,
  onBrowse,
}: {
  games: JournalPin[];
  onOpen: (game: JournalPin) => void;
  onBrowse?: () => void;
}) {
  if (!games.length) return null;
  return (
    <div className="memory-games" data-testid="memory-games">
      <p className="memory-games-kicker">
        {onBrowse ? (
          <button type="button" className="memory-games-all" onClick={onBrowse}>
            Memories
          </button>
        ) : (
          "Memories"
        )}
      </p>
      <div className="memory-games-row" role="list" aria-label="Pinned games on this line">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            role="listitem"
            className="memory-game"
            onClick={() => onOpen(game)}
            title={game.note || pinLabel(game)}
          >
            <strong>{game.result}</strong>
            <span>
              {new Date(game.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            {game.note ? <em>{game.note}</em> : game.moves.length ? <em>{pgnSnippet(game.moves, 4)}</em> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
