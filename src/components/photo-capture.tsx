"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoCapture({
  name,
  label,
  capture,
}: {
  name: string;
  label: string;
  capture?: "user" | "environment";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        capture={capture}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted-bg text-muted overflow-hidden",
          preview && "border-solid border-primary/40",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <>
            <Camera size={22} />
            <span className="text-xs font-medium">{label}</span>
          </>
        )}
      </button>
      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-1 flex items-center gap-1 text-xs text-muted hover:text-danger"
        >
          <X size={12} /> Retake
        </button>
      )}
    </div>
  );
}
