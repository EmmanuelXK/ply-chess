import type { PlayerModel, TeachMethod } from "./types";

function methodFromFails(n: number): TeachMethod {
  if (n <= 1) return "explain";
  if (n === 2) return "question";
  return "contrast";
}

/** Same concept: explain → question → contrast after repeated misses. */
export function createPlayerModel(): PlayerModel {
  const fails = new Map<string, number>();
  let last: string | undefined;
  return {
    recordFail(conceptId) {
      const n = (fails.get(conceptId) ?? 0) + 1;
      fails.set(conceptId, n);
      last = conceptId;
      return methodFromFails(n);
    },
    recordSuccess(conceptId) {
      fails.delete(conceptId);
      last = conceptId;
    },
    methodFor(conceptId) {
      return methodFromFails(fails.get(conceptId) ?? 0);
    },
    failCount(conceptId) {
      return fails.get(conceptId) ?? 0;
    },
    lastConcept() {
      return last;
    },
    noteConcept(conceptId) {
      last = conceptId;
    },
  };
}

let session: PlayerModel | null = null;

export function sessionPlayer(): PlayerModel {
  session ??= createPlayerModel();
  return session;
}

export function resetSessionPlayer(): void {
  session = createPlayerModel();
}

export function conceptIdFor(openingId: string, chunkName?: string): string {
  return `${openingId}:${chunkName ?? "line"}`;
}
