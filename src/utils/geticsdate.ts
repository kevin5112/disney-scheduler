import { DateTime } from "luxon";

export function getIcsDatePartsLocal(
  date: string,
  time: string,
  endsNextDay = false
): [number, number, number, number, number] {
  const baseDate = DateTime.fromFormat(date, "LLL d, yyyy", {
    zone: "America/Los_Angeles",
    setZone: true,
  });

  if (!baseDate.isValid) {
    throw new Error(`Invalid base date: ${date}`);
  }

  const [hour, minute] = time.split(":").map(Number);

  let dt = baseDate.set({ hour, minute });

  if (endsNextDay) {
    dt = dt.plus({ days: 1 });
  }

  // Return in local time — not UTC!
  return [dt.year, dt.month, dt.day, dt.hour, dt.minute];
}
