"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitVisit } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoCapture } from "@/components/photo-capture";
import { SHOP_TYPES, VISIT_STATUSES, INDIAN_STATES } from "@/lib/constants";
import { MapPin, ChevronLeft } from "lucide-react";

export default function NewVisitPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitVisit, null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-muted hover:text-foreground">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Log a Visit</h1>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="latitude" value={location?.lat ?? ""} />
        <input type="hidden" name="longitude" value={location?.lng ?? ""} />

        <Card>
          <CardContent className="space-y-4 py-4">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={13} />
              {locating ? "Getting your location…" : location ? `Location captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : "Location unavailable — you can still submit"}
            </p>

            <div>
              <Label htmlFor="shopkeeper_name">Shop / Shopkeeper name *</Label>
              <Input id="shopkeeper_name" name="shopkeeper_name" required placeholder="e.g. Sai Crockery" />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="10-digit number" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select id="type" name="type" defaultValue="Retailer">
                  {SHOP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue="New">
                  {VISIT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="state">State</Label>
                <Select id="state" name="state" defaultValue="">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="City" />
              </div>
            </div>

            <div>
              <Label htmlFor="area">Area / locality</Label>
              <Input id="area" name="area" placeholder="e.g. Phase 11" />
            </div>

            <div>
              <Label htmlFor="feedback">Feedback / notes</Label>
              <Textarea id="feedback" name="feedback" rows={3} placeholder="What did the shopkeeper say?" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Selfie</Label>
                <PhotoCapture name="selfie" label="Take selfie" capture="user" />
              </div>
              <div>
                <Label>Visiting card</Label>
                <PhotoCapture name="visiting_card" label="Capture card" capture="environment" />
              </div>
            </div>
          </CardContent>
        </Card>

        {state?.error && (
          <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save Visit"}
        </Button>
      </form>
    </div>
  );
}
