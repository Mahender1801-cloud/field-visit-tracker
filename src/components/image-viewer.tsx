"use client";

import { useEffect, useState } from "react";
import { getSignedPhotoUrl } from "@/lib/storage-actions";
import { ImageIcon, LoaderCircle, X, Download } from "lucide-react";

export function ImageViewerButton({ path, label }: { path: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function openModal() {
    setLoading(true);
    try {
      setUrl(await getSignedPhotoUrl(path));
      setOpen(true);
    } catch {
      // signed URL fetch failed silently; button stays inert
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!url) return;
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = path.split(".").pop() || "jpg";
      a.download = `${label.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button onClick={openModal} disabled={loading} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50">
        {loading ? <LoaderCircle size={12} className="animate-spin" /> : <ImageIcon size={12} />}
        {label}
      </button>

      {open && url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); download(); }}
              disabled={downloading}
              title="Download"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow hover:bg-white disabled:opacity-50"
            >
              {downloading ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              title="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow hover:bg-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
