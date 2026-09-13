import type { DuoId, DuoPack, Teacher } from "./types";

export const DUOS: DuoPack[] = [
  {
    id: "voss-draven",
    title: "Voss & Draven",
    blurb:
      "Wise patient philosophy versus sharp ambitious punch. Classic masters in your headphones.",
    left: {
      id: "aldric",
      name: "Aldric Voss",
      short: "Aldric",
      role: "Structure, history, plans that age well",
      color: "amber",
      gender: "male",
    },
    right: {
      id: "kael",
      name: "Kael Draven",
      short: "Kael",
      role: "Traps, gambits, romantic brilliance",
      color: "rose",
      gender: "female",
    },
  },
  {
    id: "vale-knox",
    title: "Vale & Knox",
    blurb:
      "Ice-cold calculation versus obsessive narrative fire. Sparse precision arguing with the story of the position.",
    left: {
      id: "soren",
      name: "Soren Vale",
      short: "Soren",
      role: "Elite calculator. Few words. Lasting squares.",
      color: "ice",
      gender: "male",
    },
    right: {
      id: "rhea",
      name: "Rhea Knox",
      short: "Rhea",
      role: "Emotional stakes, patterns, the story on the board",
      color: "ember",
      gender: "female",
    },
  },
  {
    id: "crowe-marquez",
    title: "Crowe & Marquez",
    blurb:
      "Quiet master planner versus relentless investigator. Contingencies, pressure, no soft fails.",
    left: {
      id: "silas",
      name: "Silas Crowe",
      short: "Silas",
      role: "Meticulous plans, backups, the quiet line that holds",
      color: "slate",
      gender: "male",
    },
    right: {
      id: "lena",
      name: "Lena Marquez",
      short: "Lena",
      role: "Sharp questions, pressure, she catches the soft move",
      color: "wine",
      gender: "female",
    },
  },
];

export const DEFAULT_DUO: DuoId = "voss-draven";

const byId = new Map(DUOS.map((d) => [d.id, d]));

export function getDuo(id: DuoId | string | null | undefined): DuoPack {
  return byId.get((id as DuoId) ?? DEFAULT_DUO) ?? DUOS[0];
}

export function otherTeacher(duo: DuoPack, speaker: Teacher["id"]): Teacher {
  return speaker === duo.left.id ? duo.right : duo.left;
}

export function isDuoId(value: string): value is DuoId {
  return byId.has(value as DuoId);
}
