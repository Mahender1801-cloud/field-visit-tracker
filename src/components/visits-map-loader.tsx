"use client";

import dynamic from "next/dynamic";
import type { MapVisit } from "./visits-map";

const VisitsMap = dynamic(() => import("./visits-map").then((m) => m.VisitsMap), {
  ssr: false,
  loading: () => <div className="flex h-[380px] items-center justify-center text-sm text-muted">Loading map…</div>,
});

export function VisitsMapLoader({ visits }: { visits: MapVisit[] }) {
  return <VisitsMap visits={visits} />;
}
