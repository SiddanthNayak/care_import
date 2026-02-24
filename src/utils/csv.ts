export interface CsvParseResult {
  headers: string[];
  rows: string[][];
}

export function parseCsvText(csvText: string): CsvParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map(splitCsvLine);

  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  return line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
}
