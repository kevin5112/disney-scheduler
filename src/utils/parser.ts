import { convertTo24Hour } from "./convertTo24Hour";

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
  return line
    .replace(/[•|]/g, " ")
    .replace(/O'Clock/gi, ":00")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseScheduleFromOCR(text: string): ScheduleEntry[] {
  const lines = text.split("\n").map((l) => normaliseLine(l));
  const entries: ScheduleEntry[] = [];

  let currentDate = "";

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
      const startTime = convertTo24Hour(rawStart.replace(".", ":"), startAMPM);
      const endTime = convertTo24Hour(rawEnd.replace(".", ":"), endAMPM);

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

      const location = locationParts.join(" ").trim() || "Unknown";
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
