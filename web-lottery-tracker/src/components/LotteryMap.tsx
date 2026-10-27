import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import type { Lottery } from "@/lib/lotteries";

const NYC: [number, number] = [40.7128, -73.95];

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    else if (points.length === 1) map.setView(points[0], 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export function LotteryMap({
  lotteries,
  savedIds = [],
  onSelect,
  zoomControl = true,
  interactive = true,
}: {
  lotteries: Lottery[];
  savedIds?: string[];
  onSelect?: (l: Lottery) => void;
  zoomControl?: boolean;
  interactive?: boolean;
}) {
  const pts = lotteries.filter((l) => l.lat !== null && l.lng !== null);
  const coords = pts.map((l) => [l.lat as number, l.lng as number] as [number, number]);
  return (
    <MapContainer
      center={NYC}
      zoom={11}
      zoomControl={zoomControl}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitBounds points={coords} />
      {pts.map((l) => {
        const saved = savedIds.includes(l.id);
        return (
          <CircleMarker
            key={l.id}
            center={[l.lat as number, l.lng as number]}
            radius={saved ? 10 : 8}
            pathOptions={{ color: "#fff", weight: 2.5, fillColor: saved ? "#F07C1F" : "#1E6FE8", fillOpacity: 1 }}
            eventHandlers={{ click: () => onSelect?.(l) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{l.name}</strong>
              <br />
              {l.units} units · {l.borough}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
