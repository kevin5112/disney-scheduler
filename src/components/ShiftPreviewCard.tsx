import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";

type Props = {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
};

export function ShiftPreviewCard({
  date,
  startTime,
  endTime,
  location,
}: Props) {
  return (
    <Card className="relative w-full overflow-hidden border-none bg-white/90 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(196,181,253,0.24),_transparent_50%)]"
      />

      <CardHeader className="relative z-10 gap-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <MapPin className="size-4 text-sky-500" />
          {location || "Disney shift"}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="size-4 text-slate-400" />
          <span>{date}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70">
          <Clock className="size-4 text-sky-500" />
          <span>
            {startTime} – {endTime}
          </span>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Sparkles className="size-3 text-sky-500" />
        Export ready
      </CardFooter>
    </Card>
  );
}
