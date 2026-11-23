import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, Layers } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { TYPE_COLOR } from "./kit";
import { cn } from "../lib/utils";

export type MapPoint = { id: number; lat: number | null; lng: number | null; number: string; type: string; ownerName?: string | null; streetName?: string | null; familyCount?: number };

const iconCache = new Map<string, L.DivIcon>();
function pin(type: string, label: string, highlight = false) {
  const k = type + label + highlight;
  if (!iconCache.has(k)) {
    iconCache.set(
      k,
      L.divIcon({
        className: "",
        html: `<div class="smk-pin" style="background:${TYPE_COLOR[type] ?? "#1e4d2b"};${highlight ? "outline:3px solid #e3b858;" : ""}"><span>${label}</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -26],
      }),
    );
  }
  return iconCache.get(k)!;
}

function ClickPicker({ onPick }: { onPick?: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick?.(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 17), { duration: 0.8 });
  }, [target, map]);
  return null;
}

export function VillageMap({
  center,
  zoom = 16,
  points = [],
  onPick,
  picked,
  focus,
  className,
}: {
  center: [number, number];
  zoom?: number;
  points?: MapPoint[];
  onPick?: (lat: number, lng: number) => void;
  picked?: [number, number] | null;
  focus?: [number, number] | null;
  className?: string;
}) {
  const { t, l } = useI18n();
  const [mode, setMode] = useState<"sat" | "plan">("sat");
  const [me, setMe] = useState<[number, number] | null>(null);
  const located = useMemo(() => points.filter((p) => p.lat != null && p.lng != null), [points]);

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        const c: [number, number] = [p.coords.latitude, p.coords.longitude];
        setMe(c);
        onPick?.(c[0], c[1]);
      },
      () => alert("Position GPS indisponible"),
      { enableHighAccuracy: true },
    );

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-sable", className)}>
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        {mode === "sat" ? (
          <>
            <TileLayer
              attribution="Imagerie © Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
          </>
        ) : (
          <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        )}
        <ClickPicker onPick={onPick} />
        <FlyTo target={focus ?? me} />
        {located.map((p) => (
          <Marker key={p.id} position={[p.lat!, p.lng!]} icon={pin(p.type, p.number.split("-").pop() ?? "", false)}>
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-display text-base font-semibold text-vert">{p.number}</div>
                <div className="text-xs text-gris">{l("type", p.type)} · {p.streetName ?? "—"}</div>
                {p.ownerName && <div className="mt-1 text-sm">{p.ownerName}</div>}
                {p.familyCount != null && <div className="text-xs text-gris">{p.familyCount} {t("families_n")}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        {picked && <Marker position={picked} icon={pin("commerce", "+", true)} />}
      </MapContainer>
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
        <div className="flex overflow-hidden rounded-xl bg-blanc/95 text-xs font-semibold shadow">
          <button onClick={() => setMode("sat")} className={cn("flex items-center gap-1 px-3 py-2", mode === "sat" ? "bg-vert text-blanc" : "text-vert")}>
            <Layers className="size-3.5" />{t("satellite")}
          </button>
          <button onClick={() => setMode("plan")} className={cn("px-3 py-2", mode === "plan" ? "bg-vert text-blanc" : "text-vert")}>{t("plan")}</button>
        </div>
        <button onClick={locate} className="flex items-center justify-center gap-1.5 rounded-xl bg-or px-3 py-2 text-xs font-semibold text-vert-deep shadow">
          <Crosshair className="size-3.5" />{t("myPosition")}
        </button>
      </div>
    </div>
  );
}
