"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { punchIn, punchOut } from "@/app/(app)/actions";
import { formatTime } from "@/lib/utils";
import { MapPin, LoaderCircle } from "lucide-react";
import type { Punch } from "@/lib/types";

function getLocation(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

export function PunchCard({ openPunch }: { openPunch: Punch | null }) {
  const [pending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);

  async function handlePunchIn() {
    setLocating(true);
    const { lat, lng } = await getLocation();
    setLocating(false);
    startTransition(() => punchIn(lat, lng));
  }

  async function handlePunchOut() {
    if (!openPunch) return;
    setLocating(true);
    const { lat, lng } = await getLocation();
    setLocating(false);
    startTransition(() => punchOut(openPunch.id, lat, lng));
  }

  const busy = pending || locating;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        {openPunch ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> On duty since {formatTime(openPunch.punch_in_at)}
            </span>
            <Button size="lg" variant="danger" className="w-full" onClick={handlePunchOut} disabled={busy}>
              {busy ? <LoaderCircle size={18} className="animate-spin" /> : <MapPin size={18} />}
              Punch Out
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">You&apos;re not on duty yet</p>
            <Button size="lg" className="w-full" onClick={handlePunchIn} disabled={busy}>
              {busy ? <LoaderCircle size={18} className="animate-spin" /> : <MapPin size={18} />}
              Punch In Now
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
