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
    <div className="grid gap-4">
      {shifts.map((shift, index) => (
        <ShiftPreviewCard
          key={index}
          date={shift.date}
          startTime={shift.startTime}
          endTime={shift.endTime}
          location={shift.location}
        />
      ))}
    </div>
  );
}
