"use client";

import { useState } from "react";
import { getPhotoUrl } from "./actions";
import { ImageIcon, LoaderCircle } from "lucide-react";

export function PhotoLink({ path, label }: { path: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const url = await getPhotoUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={open} disabled={loading} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50">
      {loading ? <LoaderCircle size={12} className="animate-spin" /> : <ImageIcon size={12} />}
      {label}
    </button>
  );
}
