"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackageOpen, X } from "lucide-react";

export function ExportZipButton() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <PackageOpen size={15} /> Export Day (ZIP)
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5">
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-8 w-auto text-sm"
      />
      <a href={`/admin/visits/export-zip?date=${date}`}>
        <Button size="sm">Download</Button>
      </a>
      <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground"><X size={16} /></button>
    </div>
  );
}
