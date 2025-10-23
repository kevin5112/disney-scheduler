import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";

type Props = {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  isEditable?: boolean;
  onLocationChange?: (value: string) => void;
  locationInputId?: string;
};

export function ShiftPreviewCard({
  date,
  startTime,
  endTime,
  location,
  isEditable = false,
  onLocationChange,
  locationInputId,
}: Props) {
  return (
    <Card className="relative w-full overflow-hidden border-none bg-white/90 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(196,181,253,0.24),_transparent_50%)]"
      />

      <CardHeader className="relative z-10 gap-3">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-4 text-sky-500" />
          <div className="flex-1">
            {isEditable && onLocationChange ? (
              <div className="space-y-2">
                <label
                  htmlFor={locationInputId}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Shift location
                </label>
                <Input
                  id={locationInputId}
                  value={location ?? ""}
                  onChange={(event) => onLocationChange(event.target.value)}
                  placeholder="Enter location name"
                  className="border-slate-300 bg-white/90 text-base font-semibold text-slate-900 placeholder:text-slate-400"
                />
              </div>
            ) : (
              <CardTitle className="text-lg font-semibold text-slate-900">
                {location || "Disney shift"}
              </CardTitle>
            )}
          </div>
        </div>
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
