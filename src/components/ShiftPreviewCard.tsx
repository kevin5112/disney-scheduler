import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  isEditable?: boolean;
  onLocationChange?: (value: string) => void;
  onDateChange?: (value: string) => void;
  onStartTimeChange?: (value: string) => void;
  onEndTimeChange?: (value: string) => void;
  locationInputId?: string;
};

export function ShiftPreviewCard({
  date,
  startTime,
  endTime,
  location,
  isEditable = false,
  onLocationChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  locationInputId,
}: Props) {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);

  const [draftLocation, setDraftLocation] = useState(location ?? "");
  const [draftDate, setDraftDate] = useState(date);
  const [draftStartTime, setDraftStartTime] = useState(startTime);
  const [draftEndTime, setDraftEndTime] = useState(endTime);

  useEffect(() => {
    if (!isEditingLocation) {
      setDraftLocation(location ?? "");
    }
  }, [isEditingLocation, location]);

  useEffect(() => {
    if (!isEditingDate) {
      setDraftDate(date);
    }
  }, [date, isEditingDate]);

  useEffect(() => {
    if (!isEditingTime) {
      setDraftStartTime(startTime);
      setDraftEndTime(endTime);
    }
  }, [endTime, isEditingTime, startTime]);

  const canEditLocation = isEditable && Boolean(onLocationChange);
  const canEditDate = isEditable && Boolean(onDateChange);
  const canEditTime =
    isEditable && (Boolean(onStartTimeChange) || Boolean(onEndTimeChange));

  const handleSaveLocation = () => {
    onLocationChange?.(draftLocation.trim());
    setIsEditingLocation(false);
  };

  const handleCancelLocation = () => {
    setDraftLocation(location ?? "");
    setIsEditingLocation(false);
  };

  const handleSaveDate = () => {
    onDateChange?.(draftDate.trim());
    setIsEditingDate(false);
  };

  const handleCancelDate = () => {
    setDraftDate(date);
    setIsEditingDate(false);
  };

  const handleSaveTime = () => {
    const trimmedStart = draftStartTime.trim();
    const trimmedEnd = draftEndTime.trim();

    onStartTimeChange?.(trimmedStart);
    onEndTimeChange?.(trimmedEnd);
    setIsEditingTime(false);
  };

  const handleCancelTime = () => {
    setDraftStartTime(startTime);
    setDraftEndTime(endTime);
    setIsEditingTime(false);
  };

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
            {isEditingLocation && canEditLocation ? (
              <div className="space-y-2">
                <label
                  htmlFor={locationInputId}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Shift location
                </label>
                <div className="flex items-start gap-2">
                  <Input
                    id={locationInputId}
                    value={draftLocation}
                    onChange={(event) => setDraftLocation(event.target.value)}
                    placeholder="Enter location name"
                    className="border-slate-300 bg-white/90 text-base font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      aria-label="Save location"
                      onClick={handleSaveLocation}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Cancel location edit"
                      onClick={handleCancelLocation}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {location?.trim() ? location : "Disney shift"}
                </CardTitle>
                {canEditLocation ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Edit shift location"
                    onClick={() => setIsEditingLocation(true)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center justify-between gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-slate-400" />
            {isEditingDate && canEditDate ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draftDate}
                  onChange={(event) => setDraftDate(event.target.value)}
                  className="h-8 border-slate-300 bg-white/90 text-sm text-slate-700"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Save date"
                  onClick={handleSaveDate}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Cancel date edit"
                  onClick={handleCancelDate}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <span>{date}</span>
            )}
          </div>
          {canEditDate && !isEditingDate ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Edit shift date"
              onClick={() => setIsEditingDate(true)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70">
            <Clock className="size-4 text-sky-500" />
            {isEditingTime && canEditTime ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draftStartTime}
                  onChange={(event) => setDraftStartTime(event.target.value)}
                  className="h-7 w-24 border-slate-300 bg-white/90 text-sm text-slate-700"
                  aria-label="Shift start time"
                />
                <span aria-hidden>–</span>
                <Input
                  value={draftEndTime}
                  onChange={(event) => setDraftEndTime(event.target.value)}
                  className="h-7 w-24 border-slate-300 bg-white/90 text-sm text-slate-700"
                  aria-label="Shift end time"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label="Save shift times"
                  onClick={handleSaveTime}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Cancel time edit"
                  onClick={handleCancelTime}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <span>
                {startTime} – {endTime}
              </span>
            )}
          </div>
          {canEditTime && !isEditingTime ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Edit shift times"
              onClick={() => setIsEditingTime(true)}
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="relative z-10 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Sparkles className="size-3 text-sky-500" />
        Export ready
      </CardFooter>
    </Card>
  );
}
