import { convertTo24Hour } from "./convertTo24Hour";
import { normaliseTimeToken, timeTokenRegex, TimeTokenOverride } from "./timeTokens";

export interface ScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

const monthPattern =
  "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*";
const dayPattern =
  "(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)";

const dateRegex = new RegExp(
  `^${monthPattern}\\s+\\d{1,2},\\s*\\d{4}(?:\\s+${dayPattern})?$`,
  "i",
);
const dayRegex = new RegExp(`^${dayPattern}$`, "i");
const timeRangeRegex =
  /(\d{1,2}[:.]\d{2})\s*(AM|PM)?\s*(?:to|[-–])\s*(\d{1,2}[:.]\d{2})\s*(AM|PM)?/i;

function normaliseLine(line: string): string {
  const cleaned = line
    .replace(/[•|]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/O'Clock/gi, ":00")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.replace(timeTokenRegex, (_, hours: string, _separator: string, minutes: string) => {
    const normalisedHours = normaliseTimeToken(hours);
    const normalisedMinutes = normaliseTimeToken(minutes);
    return `${normalisedHours}:${normalisedMinutes}`;
  });
}

function createTimeOverrideFinder(overrides: TimeTokenOverride[]) {
  let cursor = 0;

  return (raw: string): string => {
    if (!overrides.length) return raw;

    for (let i = cursor; i < overrides.length; i++) {
      const candidate = overrides[i];
      if (candidate.raw === raw) {
        cursor = i + 1;
        return candidate.corrected;
      }
    }

    return raw;
  };
}

export function parseScheduleFromOCR(
  text: string,
  timeOverrides: TimeTokenOverride[] = [],
): ScheduleEntry[] {
  const lines = text.split("\n").map((l) => normaliseLine(l));
  const entries: ScheduleEntry[] = [];

  let currentDate = "";
  const resolveOverride = createTimeOverrideFinder(timeOverrides);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (dateRegex.test(line)) {
      currentDate = line.replace(new RegExp(`\\s+${dayPattern}$`, "i"), "");
      continue;
    }

    if (dayRegex.test(line)) {
      continue;
    }

    const timeMatch = line.match(timeRangeRegex);
    if (timeMatch && currentDate) {
      const [, rawStart, startAMPM, rawEnd, endAMPM] = timeMatch;
      const startToken = resolveOverride(rawStart.replace(".", ":"));
      const endToken = resolveOverride(rawEnd.replace(".", ":"));

      const startTime = convertTo24Hour(startToken, startAMPM);
      const endTime = convertTo24Hour(endToken, endAMPM);

      const locationParts: string[] = [];
      let pointer = i + 1;
      while (pointer < lines.length) {
        const next = lines[pointer];
        if (!next) {
          pointer++;
          continue;
        }
        if (dateRegex.test(next) || timeRangeRegex.test(next) || dayRegex.test(next)) {
          break;
        }
        locationParts.push(next);
        pointer++;
      }

      const filteredLocation = locationParts
        .map((part) => part.replace(/Pick up (?:a )?shift[s]?/gi, "").trim())
        .filter(
          (part) =>
            part &&
            !/pick\s+up/i.test(part) &&
            !/shift exchange/i.test(part) &&
            !/schedule tools/i.test(part) &&
            !/jump to week/i.test(part),
        );

      const location = filteredLocation[0]?.trim() || "Unknown";
      entries.push({
        date: currentDate,
        startTime,
        endTime,
        location,
      });

      if (pointer > i + 1) {
        i = pointer - 1;
      }
    }
  }
  return entries;
}
