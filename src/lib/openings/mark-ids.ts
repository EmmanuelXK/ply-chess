/** Widget mark ids — every production opening needs a unique square logo. */
export const WEAPON_MARK_IDS = [
  "scotch-gambit",
  "evans-gambit",
  "italian-attack",
  "vienna-gambit",
  "kings-gambit",
  "grand-prix",
  "smith-morra",
  "french-kia",
  "caro-fantasy",
  "london",
  "jobava-london",
  "black-lion",
  "pirc",
  "dragon",
  "scandinavian",
  "alekhine",
  "kings-indian",
  "modern-benoni",
  "benko",
  "dutch-leningrad",
  "budapest",
] as const;

export type WeaponMarkId = (typeof WEAPON_MARK_IDS)[number];
