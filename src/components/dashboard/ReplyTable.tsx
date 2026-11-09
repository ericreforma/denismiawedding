"use client";

import type { RsvpEntry } from "@/data/config";
import { isYes } from "./DashboardClient";

function when(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts || "—";
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Badge({ attending }: { attending: string }) {
  const yes = isYes(attending);
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.12em] ${
        yes
          ? "bg-foreground text-background"
          : "border border-foreground/25 text-foreground/60"
      }`}
    >
      {yes ? "Attending" : "Cannot come"}
    </span>
  );
}

export function ReplyTable({
  entries,
  total,
}: {
  entries: RsvpEntry[];
  total: number;
}) {
  if (entries.length === 0) {
    return (
      <p className="mt-10 rounded-lg border border-dashed border-foreground/20 px-6 py-10 text-center font-sans text-[14px] text-foreground/55">
        {total === 0
          ? "No replies yet. They will appear here as guests respond."
          : "No replies match that search."}
      </p>
    );
  }

  return (
    <>
      {/* Cards on small screens: a five-column table cannot be read on a
          phone, and the couple will check this on a phone. */}
      <ul className="mt-5 space-y-3 md:hidden">
        {entries.map((e, i) => (
          <li
            key={`${e.timestamp}-${e.name}-${i}`}
            className="rounded-xl border border-foreground/15 bg-card px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-xl leading-tight">{e.name}</p>
              <Badge attending={e.attending} />
            </div>
            <p className="mt-1 font-sans text-[12px] text-foreground/45">
              {when(e.timestamp)}
            </p>
            {e.dietary.trim() && (
              <p className="mt-3 font-sans text-[13px] leading-relaxed">
                <span className="text-foreground/50">Dietary · </span>
                {e.dietary}
              </p>
            )}
            {e.message.trim() && (
              <p className="mt-2 font-sans text-[13px] leading-relaxed text-foreground/80">
                “{e.message}”
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left font-sans text-[14px]">
          <thead>
            <tr className="border-b border-foreground/20 text-[11px] uppercase tracking-[0.16em] text-foreground/50">
              <th scope="col" className="py-3 pr-4 font-normal">
                Name
              </th>
              <th scope="col" className="py-3 pr-4 font-normal">
                Reply
              </th>
              <th scope="col" className="py-3 pr-4 font-normal">
                Dietary
              </th>
              <th scope="col" className="py-3 pr-4 font-normal">
                Message
              </th>
              <th scope="col" className="py-3 font-normal whitespace-nowrap">
                Received
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr
                key={`${e.timestamp}-${e.name}-${i}`}
                className="border-b border-foreground/10 align-top"
              >
                <td className="py-3.5 pr-4 font-display text-lg leading-tight">
                  {e.name}
                </td>
                <td className="py-3.5 pr-4">
                  <Badge attending={e.attending} />
                </td>
                <td className="py-3.5 pr-4 text-foreground/75">
                  {e.dietary.trim() || "—"}
                </td>
                <td className="max-w-sm py-3.5 pr-4 text-foreground/75">
                  {e.message.trim() || "—"}
                </td>
                <td className="py-3.5 whitespace-nowrap text-foreground/50">
                  {when(e.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
