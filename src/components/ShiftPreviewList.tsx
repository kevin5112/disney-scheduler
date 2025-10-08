import { ShiftPreviewCard } from "./ShiftPreviewCard";
import { ScheduleEntry } from "@/utils/parser"; // if this is your extracted type

type Props = {
  shifts: ScheduleEntry[];
};

export function ShiftPreviewList({ shifts }: Props) {
  if (shifts.length === 0) {
    return <p className="text-sm text-muted-foreground">No shifts detected.</p>;
  }

  return (
    <ol className="relative space-y-6 border-l border-slate-200/60 pl-6">
      {shifts.map((shift, index) => (
        <li key={`${shift.date}-${shift.startTime}-${shift.endTime}-${index}`} className="relative pl-2">
          <span className="absolute -left-5 top-2 inline-flex size-8 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white shadow-md shadow-sky-500/30">
            {index + 1}
          </span>
          <ShiftPreviewCard
            date={shift.date}
            startTime={shift.startTime}
            endTime={shift.endTime}
            location={shift.location}
          />
        </li>
      ))}
    </ol>
  );
}
