export function convertTo24Hour(time: string, ampm?: string): string {
  let [hours, minutesConst] = time.split(":").map(Number);
  const minutes = minutesConst;

  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}
