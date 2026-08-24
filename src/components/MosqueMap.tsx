import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";
import { latToY, lonToX, nearbyMosques, type Mosque } from "@/lib/mosques";

const Z = 14;
const TILE = 256;

/**
 * Lightweight map preview (OpenStreetMap raster tiles, no map library).
 * Nothing is ever selected automatically: the overlay button opens the
 * dedicated "Choisir une mosquée" page where the user syncs manually.
 */
export function MosqueMap() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const place = settings.place;
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    setLoading(true);
    nearbyMosques(place.lat, place.lon, 12000, false, place.name)
      .then((m) => !cancelled && setMosques(m))
      .catch(() => !cancelled && setMosques([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // Re-query only when the map centre moves noticeably.
  }, [place?.lat.toFixed(2), place?.lon.toFixed(2), place?.name]);

  if (!place) return null;

  const cx = lonToX(place.lon, Z);
  const cy = latToY(place.lat, Z);
  const offset = (v: number, c: number) => `calc(50% + ${(v - c) * TILE}px)`;

  const tiles: { x: number; y: number }[] = [];
  for (let dx = -2; dx <= 2; dx++)
    for (let dy = -1; dy <= 1; dy++) tiles.push({ x: Math.floor(cx) + dx, y: Math.floor(cy) + dy });

  const synced = settings.mosque;

  return (
    <section
      data-widget-card
      className="rounded-[32px] p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-1 pb-2.5">
        <h2 className="text-sm font-bold">{t.mosquesNearby}</h2>
        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {/* animated multicolour border */}
      <div className="anim-border-flow rounded-[1.35rem] p-[3px]">
        <div className="relative h-48 w-full overflow-hidden rounded-[1.2rem] bg-muted">
          {tiles.map((tl) => (
            <img
              key={`${tl.x}-${tl.y}`}
              src={`https://tile.openstreetmap.org/${Z}/${tl.x}/${tl.y}.png`}
              alt=""
              loading="lazy"
              className="pointer-events-none absolute size-64 max-w-none opacity-90"
              style={{ left: offset(tl.x, cx), top: offset(tl.y, cy) }}
            />
          ))}

          <span
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--halal)] shadow"
            style={{ left: "50%", top: "50%" }}
          />

          {mosques.map((m) => (
            <span
              key={m.id}
              title={m.name}
              className={`absolute grid -translate-x-1/2 -translate-y-full place-items-center rounded-full p-1 shadow ${
                synced?.id === m.id ? "widget scale-110" : "bg-background/90"
              }`}
              style={{ left: offset(lonToX(m.lon, Z), cx), top: offset(latToY(m.lat, Z), cy) }}
            >
              <MapPin className="size-4" />
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-1 pt-2.5 text-center">
        <Link
          to="/mosques"
          className="widget inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px] font-bold shadow-md transition hover:scale-105"
        >
          {t.chooseMosque}
        </Link>
      </div>
    </section>
  );
}
