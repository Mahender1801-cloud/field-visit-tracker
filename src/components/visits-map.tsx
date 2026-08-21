"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const pin = new L.DivIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#2554ec;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export interface MapVisit {
  id: string;
  latitude: number;
  longitude: number;
  shopkeeper_name: string;
  salesman_name: string;
  status: string;
}

export function VisitsMap({ visits }: { visits: MapVisit[] }) {
  if (!visits.length) {
    return <p className="py-16 text-center text-sm text-muted">No geotagged visits to show.</p>;
  }

  const center: [number, number] = [visits[0].latitude, visits[0].longitude];

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: 380, width: "100%", borderRadius: 12 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {visits.map((v) => (
        <Marker key={v.id} position={[v.latitude, v.longitude]} icon={pin}>
          <Popup>
            <p className="font-medium">{v.shopkeeper_name}</p>
            <p className="text-xs text-muted">{v.salesman_name} · {v.status}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
