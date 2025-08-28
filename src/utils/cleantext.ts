export function cleanOCRText(raw: string): string {
  return raw
    .replace(/,(\d{4})/g, ", $1")
    .replace(/I(?=\d{1,2}:)/g, "1")
    .replace(/O(?=\d)/g, "0");
}
