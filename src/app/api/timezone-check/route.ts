import "@/lib/luxon-setup";
import { DateTime } from "luxon";

export async function GET() {
  const now = DateTime.local();
  const time = now.toFormat("ffff");
  return new Response(
    JSON.stringify({
      zone: now.zoneName,
      offset: now.offsetNameLong,
      time,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
