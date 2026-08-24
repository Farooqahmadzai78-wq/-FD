import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/app-settings";
import {
  fetchDayTimes,
  getCachedDayTimes,
  reverseGeocode,
  type DayTimes,
  nextPrayer,
  zonedNow,
  type PrayerKey,
} from "@/lib/prayer-times";

export function usePrayerTimes() {
  const { settings, update, ready } = useSettings();

  const place = settings.place;
  // A manually synced mosque overrides the city centre for the timings query.
  const mosque = settings.mosque && settings.mosque.city === place?.name ? settings.mosque : null;
  const coords = mosque ?? place;

  const [dateKey, setDateKey] = useState(() => new Date().toDateString());

  const initialCached = coords
    ? getCachedDayTimes(
        coords.lat,
        coords.lon,
        settings.method,
        settings.school,
        new Date(),
        coords.timezone,
        mosque,
      )
    : undefined;

  const [data, setData] = useState<DayTimes | null>(() => initialCached || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialCached);
  const locating = useRef(false);

  // Resolve a location once (browser geolocation) unless the user picked a city.
  useEffect(() => {
    if (!ready || place || settings.manualPlace || locating.current) return;
    locating.current = true;

    const fallback = () =>
      update({
        place: {
          name: "La Mecque",
          country: "Arabie saoudite",
          lat: 21.4225,
          lon: 39.8262,
          timezone: "Asia/Riyadh",
        },
      });

    if (!("geolocation" in navigator)) return fallback();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const geo = await reverseGeocode(lat, lon);
        update({ place: { ...geo, lat, lon } });
      },
      () => fallback(),
      { timeout: 10000, maximumAge: 600000 },
    );
  }, [ready, place, settings.manualPlace, update]);

  const load = useCallback(async () => {
    if (!coords) return;
    const now = new Date();
    const cached = getCachedDayTimes(
      coords.lat,
      coords.lon,
      settings.method,
      settings.school,
      now,
      coords.timezone,
      mosque,
    );
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchDayTimes(
        coords.lat,
        coords.lon,
        settings.method,
        settings.school,
        now,
        coords.timezone,
        mosque,
      );
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [coords?.lat, coords?.lon, coords?.timezone, settings.method, settings.school, mosque]);

  useEffect(() => {
    void load();
  }, [load, dateKey]);

  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => {
      const current = new Date();
      setClock(current);
      // Check if date turned midnight
      const curKey = current.toDateString();
      if (curKey !== dateKey) {
        setDateKey(curKey);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [dateKey]);

  // "now" follows the timezone of the selected city, not the phone's timezone.
  const resolvedTz = data?.timezone || coords?.timezone;
  const now = zonedNow(resolvedTz, clock);
  const next = data ? nextPrayer(data.timings, now) : null;

  return {
    place,
    mosque,
    data,
    next: next as { key: PrayerKey; at: Date; tomorrow: boolean } | null,
    now,
    clock,
    timezone: resolvedTz,
    loading,
    error,
    reload: load,
    isMosqueOfficial: Boolean(data?.isMosqueOfficial || mosque?.isOfficial),
    source: data?.source,
    sourceType: data?.sourceType,
    iqama: data?.iqama,
    iqamaDisplay: data?.iqamaDisplay,
    jumua: data?.jumua || mosque?.jumua,
    jumua2: data?.jumua2 || mosque?.jumua2,
    jumua3: data?.jumua3,
    shuruq: data?.shuruq || data?.timings?.Sunrise,
  };
}
