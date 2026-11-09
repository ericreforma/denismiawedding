import type { RsvpEntry } from "@/data/config";

/** Quote a field for CSV: double the quotes, wrap if it holds a separator. */
function cell(v: string) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * `YYYY-MM-DD HH:MM` rather than the raw ISO string: still sorts correctly as
 * text, is recognised as a date by Excel and Sheets, and is readable to
 * someone opening the file who does not care what ISO 8601 is.
 */
function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    ` ${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function toCsv(entries: RsvpEntry[]) {
  const head = ["Date", "Name", "Attending", "Dietary requirements", "Message"];
  const rows = entries.map((e) => [
    stamp(e.timestamp),
    e.name,
    e.attending,
    e.dietary,
    e.message,
  ]);
  return [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // The BOM makes Excel read it as UTF-8 rather than mangling accents.
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
