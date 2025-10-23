import { ShiftPreviewCard } from "./ShiftPreviewCard";
import { ScheduleEntry } from "@/utils/parser"; // if this is your extracted type

type Props = {
  shifts: ScheduleEntry[];
  isEditable?: boolean;
  onLocationChange?: (index: number, location: string) => void;
};

export function ShiftPreviewList({ shifts, isEditable = false, onLocationChange }: Props) {
  if (shifts.length === 0) {
    return <p className="text-sm text-muted-foreground">No shifts detected.</p>;
  }

  return (
    <ol className="space-y-6">
      {shifts.map((shift, index) => (
        <li key={`${shift.date}-${shift.startTime}-${shift.endTime}-${index}`} className="flex items-start gap-4">
          <span className="mt-1 inline-flex size-9 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30">
            {index + 1}
          </span>
          <div className="flex-1">
            <ShiftPreviewCard
              date={shift.date}
              startTime={shift.startTime}
              endTime={shift.endTime}
              location={shift.location}
              isEditable={isEditable}
              locationInputId={`shift-location-${index}`}
              onLocationChange={
                onLocationChange
                  ? (value) => onLocationChange(index, value)
                  : undefined
              }
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
