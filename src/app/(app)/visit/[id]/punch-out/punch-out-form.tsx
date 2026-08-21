"use client";

import { useActionState, useEffect, useState } from "react";
import { punchOutOfShop } from "./actions";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoCapture } from "@/components/photo-capture";
import { VISIT_STATUSES } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";
import type { Visit } from "@/lib/types";

export function PunchOutForm({ visit }: { visit: Visit }) {
  const [state, formAction, pending] = useActionState(punchOutOfShop, null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);
  const [elapsed, setElapsed] = useState(() => formatDuration(visit.created_at, null));

  useEffect(() => {
    if (!navigator.geolocation) return setLocating(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(formatDuration(visit.created_at, null)), 30000);
    return () => clearInterval(timer);
  }, [visit.created_at]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{visit.shopkeeper_name}</h1>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} /> Punched in {elapsed} ago
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="visit_id" value={visit.id} />
        <input type="hidden" name="latitude" value={location?.lat ?? ""} />
        <input type="hidden" name="longitude" value={location?.lng ?? ""} />

        <Card>
          <CardContent className="space-y-4 py-4">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={13} />
              {locating ? "Getting your location…" : location ? `Exit location captured` : "Location unavailable — you can still punch out"}
            </p>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="New">
                {VISIT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="feedback">Feedback / notes</Label>
              <Textarea id="feedback" name="feedback" rows={3} placeholder="What did the shopkeeper say?" />
            </div>

            <div>
              <Label>Visiting card</Label>
              <PhotoCapture name="visiting_card" label="Capture card" capture="environment" />
            </div>
          </CardContent>
        </Card>

        {state?.error && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" variant="danger" disabled={pending}>
          {pending ? "Punching out…" : "Punch Out"}
        </Button>
      </form>
    </div>
  );
}
