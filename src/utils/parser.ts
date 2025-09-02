import { convertTo24Hour } from "./convertTo24Hour";

export interface ScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export function parseScheduleFromOCR(text: string): ScheduleEntry[] {
  const lines = text.split("\n").map((l) => l.trim());
  const entries: ScheduleEntry[] = [];

  let currentDate = "";
  let currentLocation = "";
  let timeMatch: RegExpMatchArray | null = null;
  console.log("lines:", lines);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const dateMatch = line.match(/^[A-Z][a-z]{2}\s?0?\d{1,2},\s?\d{4}\s*$/);
    if (dateMatch) {
      currentDate = dateMatch[0];
      continue;
    }

    const timeRangeRegex =
      /(\d{1,2}:\d{2})\s*(AM|PM)?\s*to\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i;
    // old regex: /(\d{1,2}:\d{2})\s*(?:to|-|-)?\s*(\d{1,2}:\d{2})/
    timeMatch = line.match(timeRangeRegex);
    if (timeMatch && currentDate) {
      const [, rawStart, startAMPM, rawEnd, endAMPM] = timeMatch;
      const startTime = convertTo24Hour(rawStart, startAMPM);
      const endTime = convertTo24Hour(rawEnd, endAMPM);
      const nextLine = lines[i + 1] || "";
      const locationMatch = nextLine.match(/[A-Za-z\s]{4,}/);
      currentLocation = locationMatch?.[0]?.trim() || "Unknown";

      if (currentDate) {
        entries.push({
          date: currentDate,
          startTime: startTime,
          endTime: endTime,
          location: currentLocation,
        });
      }
    }
  }
  return entries;
}
