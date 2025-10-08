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
    <Card className="w-full border-slate-200/70 bg-white/90 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <MapPin className="size-4 text-sky-500" />
          {location || "Disney shift"}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="size-4 text-slate-400" />
          <span>{date}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Clock className="size-4 text-slate-400" />
        <span>
          {startTime} – {endTime}
        </span>
      </CardContent>
      <CardFooter className="flex items-center gap-2 text-xs text-slate-500">
        <Sparkles className="size-3 text-slate-400" />
        Ready for export
      </CardFooter>
    </Card>
  );
}
