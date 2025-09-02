import { format, addDays, parse } from "date-fns";

export function resolveRelativeDates(text: string): string {
  const lines = text.split("\n");
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (
      line.trim().toLowerCase() === "today" ||
      line.trim().toLowerCase() == "tomorrow"
    ) {
      const isToday = line.toLowerCase() === "today";
      const nextLine = lines[i + 1]?.trim();
      const dateMatch = nextLine?.match(/([A-Z]+),?\s*(\w+\s+\d{1,2})/i);

      if (dateMatch) {
        try {
          const parsedDate = parse(
            `${dateMatch[2]}, ${new Date().getFullYear()}`,
            "MMM d, yyyy",
            new Date()
          );
          line = format(parsedDate, "MMM d, yyyy");
        } catch {
          line = format(
            isToday ? new Date() : addDays(new Date(), 1),
            "MMM d, yyyy"
          );
        }
      } else {
        line = format(
          isToday ? new Date() : addDays(new Date(), 1),
          "MMM d, yyyy"
        );
      }
    }
    resultLines.push(line);
  }

  return resultLines.join("\n");
}
