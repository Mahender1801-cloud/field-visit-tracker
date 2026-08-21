"use client";

import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Visit } from "@/lib/types";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";

export function ExportCsvButton({ rows }: { rows: (Visit & { salesman_name: string })[] }) {
  function exportCsv() {
    const csv = Papa.unparse(
      rows.map((v) => ({
        Date: formatDate(v.visit_date),
        Salesman: v.salesman_name,
        Shop: v.shopkeeper_name,
        Phone: v.phone ?? "",
        Type: v.type,
        State: v.state ?? "",
        City: v.city ?? "",
        Area: v.area ?? "",
        Status: v.punch_out_at ? v.status : "In Progress",
        "Punch In": formatTime(v.created_at),
        "Punch Out": v.punch_out_at ? formatTime(v.punch_out_at) : "",
        "Time at Shop": formatDuration(v.created_at, v.punch_out_at),
        Feedback: v.feedback ?? "",
        Latitude: v.latitude ?? "",
        Longitude: v.longitude ?? "",
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visits-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows.length}>
      <Download size={15} /> Export CSV
    </Button>
  );
}
