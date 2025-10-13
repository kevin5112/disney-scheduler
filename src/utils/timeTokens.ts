const timeLookalikeMap: Record<string, string> = {
  O: "0",
  o: "0",
  "|": "1",
  l: "1",
  I: "1",
  B: "8",
  S: "5",
  s: "5",
};

export const timeTokenRegex = /([0-9OolISB]{1,2})([:.])([0-9OolISB]{2})/g;

export interface TimeTokenOverride {
  raw: string;
  corrected: string;
}

export function normaliseTimeToken(segment: string): string {
  return segment
    .split("")
    .map((char) => timeLookalikeMap[char] ?? char)
    .join("");
}

export function normaliseTimeCandidate(candidate: string): string | null {
  if (!candidate) return null;

  const trimmed = candidate.replace(/[^0-9A-Za-z:.]/g, "");
  if (!trimmed) return null;

  const withColon = trimmed.replace(/[.]/g, ":");
  const match = withColon.match(/^([0-9OolISB]{1,2}):([0-9OolISB]{1,3})$/);
  if (!match) return null;

  const [, rawHours, rawMinutes] = match;
  const hours = normaliseTimeToken(rawHours);
  const minutesChars = normaliseTimeToken(rawMinutes);

  if (!hours || !minutesChars) return null;

  const minutes =
    minutesChars.length === 1 ? minutesChars.padStart(2, "0") : minutesChars.slice(0, 2);

  if (!/^\d{1,2}$/.test(hours) || !/^\d{2}$/.test(minutes)) {
    return null;
  }

  return `${hours}:${minutes}`;
}
