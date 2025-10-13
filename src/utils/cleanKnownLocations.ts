const knownLocations = [
  "Falcon HH",
  "Rise",
  "Adventureland",
  "Tomorrowland",
  "CDs Trn T",
  "Resistance HH",
  "Falcon",
  "Mermaid Lagoon",
];

export function cleanKnownLocations(line: string): string {
  for (const location of knownLocations) {
    const fuzzyMatch = new RegExp(`[\\s,]*[a-z]?\\s*(${location})`, "i"); // matches " y Falcon HH", " , Falcon HH", etc.
    const match = line.match(fuzzyMatch);
    if (match) return location;
  }
  return line;
}
