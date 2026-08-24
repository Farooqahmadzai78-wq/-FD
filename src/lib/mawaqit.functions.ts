import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface MawaqitMosqueSearchItem {
  uuid?: string;
  slug?: string;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  countryCode?: string;
  country?: string;
}

export interface MawaqitMosqueDetails {
  uuid?: string;
  slug: string;
  name: string;
  label?: string;
  address?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  jumua?: string;
  jumua2?: string;
  jumua3?: string;
  times: string[]; // [Fajr, Dhuhr, Asr, Maghrib, Isha]
  shuruq?: string;
  calendar?: Record<string, string[]>[]; // 12 months array
  iqamaCalendar?: Record<string, string[]>[]; // 12 months array
  hijriAdjustment?: number;
}

// In-memory server cache to ensure lightning speed
const mosqueDetailsCache = new Map<string, { timestamp: number; data: MawaqitMosqueDetails }>();

/**
 * Server function: Search for mosques on Mawaqit by keyword or city name.
 */
export const searchMawaqitMosquesServer = createServerFn({ method: "GET" })
  .validator((d: { query: string }) => d)
  .handler(async ({ data }): Promise<MawaqitMosqueSearchItem[]> => {
    const q = (data.query || "").trim();
    if (!q || q.length < 2) return [];

    try {
      const url = `https://mawaqit.net/api/2.0/mosque/search?word=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "IslamNoorApp/1.0 (https://islam-noor.app)",
          Accept: "application/json",
        },
      });

      if (!res.ok) return [];
      const list = (await res.json()) as MawaqitMosqueSearchItem[];
      if (!Array.isArray(list)) return [];

      return list.map((item) => ({
        uuid: item.uuid,
        slug: item.slug,
        name: item.name,
        type: item.type,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        address: item.address,
        city: item.city,
        countryCode: item.countryCode,
      }));
    } catch (e) {
      console.warn("Failed to search Mawaqit mosques on server:", e);
      return [];
    }
  });

/**
 * Server function: Fetch official prayer times & calendar for a specific Mawaqit mosque slug.
 */
export const getMawaqitMosqueDetailsServer = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<MawaqitMosqueDetails | null> => {
    const slug = (data.slug || "").trim();
    if (!slug) return null;

    // Check memory cache (valid for 1 hour)
    const cached = mosqueDetailsCache.get(slug);
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
      return cached.data;
    }

    try {
      const url = `https://mawaqit.net/fr/${encodeURIComponent(slug)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!res.ok) {
        // Try fallback to english path if french 404
        const resEn = await fetch(`https://mawaqit.net/en/${encodeURIComponent(slug)}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/html",
          },
        });
        if (!resEn.ok) return null;
        const htmlEn = await resEn.text();
        const parsed = parseMawaqitHtml(htmlEn, slug);
        if (parsed) {
          mosqueDetailsCache.set(slug, { timestamp: Date.now(), data: parsed });
          return parsed;
        }
        return null;
      }

      const html = await res.text();
      const parsed = parseMawaqitHtml(html, slug);
      if (parsed) {
        mosqueDetailsCache.set(slug, { timestamp: Date.now(), data: parsed });
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn(`Failed to fetch Mawaqit details for slug ${slug}:`, e);
      return null;
    }
  });

function parseMawaqitHtml(html: string, slug: string): MawaqitMosqueDetails | null {
  const match =
    html.match(/var\s+confData\s*=\s*(\{.*?\});/s) || html.match(/confData\s*=\s*(\{.*?\});/s);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1]);
    const name = raw.name || raw.label || "Mosquée";
    const times = Array.isArray(raw.times) ? raw.times.map(String) : [];
    const latitude = Number(raw.latitude) || 0;
    const longitude = Number(raw.longitude) || 0;
    const timezone = raw.timezone || "Europe/Paris";

    return {
      uuid: raw.uuid,
      slug: raw.slug || slug,
      name,
      label: raw.label,
      address: raw.address,
      phone: raw.phone,
      latitude,
      longitude,
      timezone,
      jumua: raw.jumua,
      jumua2: raw.jumua2,
      jumua3: raw.jumua3,
      times,
      shuruq: raw.shuruq,
      calendar: Array.isArray(raw.calendar) ? raw.calendar : undefined,
      iqamaCalendar: Array.isArray(raw.iqamaCalendar) ? raw.iqamaCalendar : undefined,
      hijriAdjustment: typeof raw.hijriAdjustment === "number" ? raw.hijriAdjustment : 0,
    };
  } catch (err) {
    console.error("Error parsing confData JSON from Mawaqit:", err);
    return null;
  }
}
