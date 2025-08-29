import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader className="text-lg font-semibold">
        {location || "Disney Shift"}
      </CardHeader>
      <CardContent>
        <p className="text-sm">{date}</p>
        <p className="text-sm">
          {startTime} – {endTime}
        </p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Imported from screenshot
      </CardFooter>
    </Card>
  );
}
