export function cleanOCRText(text: string): string {
  return text
    .split("\n")
    .map(
      (line) =>
        line
          .replace(/\\[^\w\s]/g, "") // Remove weird backslash + punctuation artifacts
          .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII garbage
          .replace(/\s{2,}/g, " ") // Collapse extra spaces
          .replace(/^\s+|\s+$/g, "") // Trim leading/trailing whitespace
          .replace(/,(\d{4})/g, ", $1") // Add missing space in dates like Aug 21,2025
    )
    .filter((line) => line.length > 0) // Remove empty lines
    .join("\n");
}
