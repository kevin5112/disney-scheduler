import { NextRequest } from "next/server";
import { createEvents } from "ics";
import { getIcsDatePartsLocal } from "@/utils/geticsdate";
import { ScheduleEntry } from "@/utils/parser";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const events = data.map((entry: ScheduleEntry) => {
    const [startHour] = entry.startTime.split(":").map(Number);
    const [endHour] = entry.endTime.split(":").map(Number);

    // Shift ends next day if endHour is 0 OR less than startHour
    const endsNextDay = endHour === 0 || endHour < startHour;

    const start = getIcsDatePartsLocal(entry.date, entry.startTime);
    const end = getIcsDatePartsLocal(entry.date, entry.endTime, endsNextDay);

    return {
      title: entry.location || "Disney Shift",
      description: `${entry.date}, ${entry.startTime} to ${entry.endTime}\nImported from Disney schedule screenshot.`,
      start,
      end,
      startInputType: "local",
      endInputType: "local",
    };
  });

  const { error, value } = createEvents(events);

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(value, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": 'attachment; filename="disney_schedule.ics"',
    },
  });
}
