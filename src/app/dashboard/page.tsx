import type { Metadata } from "next";

import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "RSVP Dashboard · Denis & Mia Arr",
  // The guest list is personal. Nothing here should turn up in a search.
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
