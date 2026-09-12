import { DEFAULT_DUO, getDuo } from "./duos";
import type { Teacher } from "./types";

/** Single active coach pack. Aldric♂ + Kael♀ stay internal for TTS. */
export const ACTIVE_COACH = DEFAULT_DUO;

export function activeTeachers(): { left: Teacher; right: Teacher } {
  const pack = getDuo(ACTIVE_COACH);
  return { left: pack.left, right: pack.right };
}

export function teacherById(id: Teacher["id"]): Teacher {
  const pack = getDuo(ACTIVE_COACH);
  return id === pack.right.id ? pack.right : pack.left;
}
