import { sanitizePhone } from "./sanitize";

export interface PhoneCountry {
  iso: string;
  dial: string;
  flag: string;
  name: string;
  /** Digits expected after dropping a trunk prefix. */
  nationalLength: number;
  trunk: string;
  placeholder: string;
}

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  {
    iso: "FR",
    dial: "33",
    flag: "🇫🇷",
    name: "France",
    nationalLength: 9,
    trunk: "0",
    placeholder: "07 44 89 98 85",
  },
  {
    iso: "BE",
    dial: "32",
    flag: "🇧🇪",
    name: "Belgium",
    nationalLength: 9,
    trunk: "0",
    placeholder: "0470 12 34 56",
  },
  {
    iso: "CH",
    dial: "41",
    flag: "🇨🇭",
    name: "Switzerland",
    nationalLength: 9,
    trunk: "0",
    placeholder: "078 123 45 67",
  },
  {
    iso: "DE",
    dial: "49",
    flag: "🇩🇪",
    name: "Germany",
    nationalLength: 10,
    trunk: "0",
    placeholder: "0151 23456789",
  },
  {
    iso: "ES",
    dial: "34",
    flag: "🇪🇸",
    name: "Spain",
    nationalLength: 9,
    trunk: "",
    placeholder: "612 34 56 78",
  },
  {
    iso: "IT",
    dial: "39",
    flag: "🇮🇹",
    name: "Italy",
    nationalLength: 10,
    trunk: "",
    placeholder: "312 345 6789",
  },
  {
    iso: "NL",
    dial: "31",
    flag: "🇳🇱",
    name: "Netherlands",
    nationalLength: 9,
    trunk: "0",
    placeholder: "06 12345678",
  },
  {
    iso: "PT",
    dial: "351",
    flag: "🇵🇹",
    name: "Portugal",
    nationalLength: 9,
    trunk: "",
    placeholder: "912 345 678",
  },
  {
    iso: "GB",
    dial: "44",
    flag: "🇬🇧",
    name: "United Kingdom",
    nationalLength: 10,
    trunk: "0",
    placeholder: "07911 123456",
  },
  {
    iso: "US",
    dial: "1",
    flag: "🇺🇸",
    name: "United States",
    nationalLength: 10,
    trunk: "1",
    placeholder: "202 555 0142",
  },
  {
    iso: "CA",
    dial: "1",
    flag: "🇨🇦",
    name: "Canada",
    nationalLength: 10,
    trunk: "1",
    placeholder: "416 555 0136",
  },
];

export const DEFAULT_PHONE_COUNTRY = "FR";

export type PhoneNormalizeResult =
  | { ok: true; e164: string }
  | { ok: false; reason: "incomplete" | "invalid" };

export function countryByIso(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.iso === iso) ?? PHONE_COUNTRIES[0];
}

export function normalizePhone(iso: string, raw: string): PhoneNormalizeResult {
  const country = countryByIso(iso);
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "incomplete" };

  if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
    const asPlus = trimmed.startsWith("00") ? `+${trimmed.slice(2)}` : trimmed;
    const e164 = sanitizePhone(asPlus);
    if (e164) return { ok: true, e164 };
    const digits = asPlus.replace(/\D/g, "");
    return { ok: false, reason: digits.length < 8 ? "incomplete" : "invalid" };
  }

  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return { ok: false, reason: "invalid" };

  if (country.dial === "1") {
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  } else if (country.trunk && digits.startsWith(country.trunk)) {
    digits = digits.slice(country.trunk.length);
  }

  if (digits.length < country.nationalLength) {
    return { ok: false, reason: "incomplete" };
  }

  const e164 = sanitizePhone(`+${country.dial}${digits}`);
  if (!e164) return { ok: false, reason: "invalid" };
  return { ok: true, e164 };
}

export function phoneHint(iso: string, reason: "incomplete" | "invalid"): string {
  const country = countryByIso(iso);
  if (reason === "incomplete") {
    if (country.iso === "FR") {
      return "That number looks short. French mobiles have 10 digits, like 07 44 89 98 85.";
    }
    return `That number looks short. Add the rest of the ${country.name} mobile.`;
  }
  return `Check the number. Select ${country.name} or paste a full +${country.dial} number.`;
}
