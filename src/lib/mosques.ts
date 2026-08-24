import { searchMawaqitMosquesServer, type MawaqitMosqueSearchItem } from "./mawaqit.functions";

export type Mosque = {
  id: string;
  slug?: string;
  name: string;
  label?: string;
  lat: number;
  lon: number;
  distance: number;
  address?: string;
  city?: string;
  country?: string;
  source: "mawaqit" | "osm" | "custom";
  isOfficial?: boolean;
  jumua?: string;
  jumua2?: string;
  shuruq?: string;
  times?: string[];
  iqama?: string[];
  timezone?: string;
};

const R = 6371;
const rad = (v: number) => (v * Math.PI) / 180;

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** In-memory cache for ultra-fast UI rendering */
const memoryCache = new Map<string, { timestamp: number; data: Mosque[] }>();

/** Helper to strictly check if a venue is a real Islamic mosque / prayer room and NOT a church, station, shop, or street */
function isMosque(
  name: string,
  displayName?: string,
  tags?: Record<string, string>,
  osmClass?: string,
  osmType?: string,
): boolean {
  // 1. Strict OSM tag checks if tags are present
  if (tags) {
    if (tags.religion && tags.religion.toLowerCase() !== "muslim") {
      return false;
    }
    const b = (tags.building || "").toLowerCase();
    const forbiddenBuildings = [
      "church",
      "cathedral",
      "chapel",
      "synagogue",
      "temple",
      "shrine",
      "train_station",
      "commercial",
      "retail",
      "apartments",
      "residential",
      "hotel",
      "industrial",
    ];
    if (forbiddenBuildings.includes(b)) {
      return false;
    }
    const a = (tags.amenity || "").toLowerCase();
    const forbiddenAmenities = [
      "church",
      "cathedral",
      "chapel",
      "synagogue",
      "temple",
      "restaurant",
      "fast_food",
      "cafe",
      "pub",
      "bar",
      "bus_station",
      "train_station",
      "school",
      "university",
      "shop",
      "supermarket",
      "bank",
      "pharmacy",
      "hospital",
      "parking",
      "police",
      "post_office",
      "townhall",
    ];
    if (forbiddenAmenities.includes(a) && tags.religion?.toLowerCase() !== "muslim") {
      return false;
    }
    const d = (tags.denomination || "").toLowerCase();
    if (
      [
        "catholic",
        "protestant",
        "orthodox",
        "evangelical",
        "baptist",
        "methodist",
        "lutheran",
        "anglican",
      ].includes(d)
    ) {
      return false;
    }
  }

  // 2. Reject OSM classes that are streets, transit lines, or shops
  if (osmClass) {
    const c = osmClass.toLowerCase();
    if (["highway", "railway", "public_transport", "shop", "tourism", "leisure"].includes(c)) {
      if (osmType !== "place_of_worship" && osmType !== "mosque") {
        return false;
      }
    }
  }

  const text = `${name} ${displayName || ""}`.toLowerCase();

  // 3. Reject words indicating non-Islamic places of worship, stations, shops, restaurants, streets
  const rejectWords = [
    // Non-Muslim worship
    "church",
    "église",
    "eglise",
    "cathedral",
    "cathédrale",
    "chapel",
    "chapelle",
    "synagogue",
    "temple",
    "basilica",
    "basilique",
    "paroisse",
    "parish",
    "evangelique",
    "evangélique",
    "st. ",
    "st-",
    "saint ",
    "sainte ",
    "monastery",
    "monastère",
    "abbey",
    "abbaye",
    "prieuré",
    "protestant",
    "catholique",
    "orthodoxe",
    "baptist",
    "adventiste",
    "témoins de jéhovah",
    "temoin de jehovah",
    "ashram",
    "pagoda",
    "pagode",
    "gurdwara",

    // Transport / Stations
    "gare de",
    "gare d'",
    "gare ",
    "train station",
    "bus station",
    "bus stop",
    "arrêt ",
    "arret ",
    "station de",
    "station de métro",
    "station de metro",
    "station de tram",
    "station rer",
    "aéroport",
    "airport",

    // Commercial / Food / Services
    "restaurant",
    "restau ",
    "café",
    "cafe ",
    "boulangerie",
    "boucherie",
    "épicerie",
    "epicerie",
    "supermarché",
    "supermarket",
    "hyper-",
    "boutique",
    "coiffeur",
    "coiffure",
    "pharmacie",
    "banque",
    "bank",
    "hôtel",
    "hotel",
    "garage",
    "station-service",
    "station service",
    "lavage",
    "magasin",
    "centre commercial",

    // Address strings matching street names or transit stops
    "rue de la mosquée",
    "rue de la mosquee",
    "avenue de la mosquée",
    "boulevard de la mosquée",
    "impasse de la mosquée",
    "chemin de la mosquée",
    "place de la mosquée",
    "route de la mosquée",
    "arrêt mosquée",
    "arret mosquee",
    "station mosquée",
  ];

  for (const word of rejectWords) {
    if (text.includes(word)) {
      return false;
    }
  }

  // 4. Positive verification: Must contain at least one Islamic keyword OR have explicit tags
  const hasIslamicTag =
    tags?.religion?.toLowerCase() === "muslim" ||
    tags?.building?.toLowerCase() === "mosque" ||
    tags?.amenity?.toLowerCase() === "mosque";

  const islamicKeywords = [
    "mosquée",
    "mosquee",
    "masjid",
    "musalla",
    "mousalla",
    "mosq",
    "jamia",
    "jamaa",
    "masjed",
    "centre islamique",
    "center islamique",
    "association musulmane",
    "culte musulman",
    "jama'at",
    "مسجد",
    "جامع",
    "مصلى",
    "الجامع",
    "المسجد",
  ];

  const hasIslamicKeyword = islamicKeywords.some((kw) => text.includes(kw));

  if (!hasIslamicTag && !hasIslamicKeyword) {
    return false;
  }

  return true;
}

/**
 * Robust, fast, and multi-sourced nearby mosque search.
 * Combines Nominatim API and Overpass API with strict verification.
 */
type NominatimItem = {
  place_id?: number;
  osm_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  class?: string;
  type?: string;
};

export async function nearbyMosques(
  lat: number,
  lon: number,
  radius = 12000,
  forceRefresh = false,
  cityName?: string,
): Promise<Mosque[]> {
  const cityKey = cityName ? cityName.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const cacheKey = `v5_${lat.toFixed(2)}_${lon.toFixed(2)}_${cityKey}`;

  // 1. Return cached results if available and fresh (< 30 minutes)
  if (!forceRefresh) {
    const mem = memoryCache.get(cacheKey);
    if (mem && Date.now() - mem.timestamp < 30 * 60 * 1000) {
      return mem.data;
    }
    if (typeof window !== "undefined") {
      try {
        const raw = window.sessionStorage.getItem(`nur_mosques_${cacheKey}`);
        if (raw) {
          const parsed = JSON.parse(raw) as { timestamp: number; data: Mosque[] };
          if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
            memoryCache.set(cacheKey, parsed);
            return parsed.data;
          }
        }
      } catch {
        /* ignore storage errors */
      }
    }
  }

  // 2. Query Mawaqit official API (Server function with client fallback)
  const fetchMawaqit = async (): Promise<Mosque[]> => {
    const searchTerms = new Set<string>();
    if (cityName && cityName.trim().length >= 2) {
      searchTerms.add(cityName.trim());
    }

    const results: Mosque[] = [];

    for (const term of searchTerms) {
      try {
        // Try server function first
        let list: MawaqitMosqueSearchItem[] = [];
        try {
          list = await searchMawaqitMosquesServer({ data: { query: term } });
        } catch {
          // Direct fallback if in browser
          const url = `https://mawaqit.net/api/2.0/mosque/search?word=${encodeURIComponent(term)}`;
          const res = await fetch(url, { headers: { "User-Agent": "IslamNoorApp/1.0" } });
          if (res.ok) {
            list = await res.json();
          }
        }

        if (Array.isArray(list)) {
          for (const item of list) {
            const itemLat = Number(item.latitude);
            const itemLon = Number(item.longitude);
            if (isNaN(itemLat) || isNaN(itemLon)) continue;

            const dist = distanceKm(lat, lon, itemLat, itemLon);
            // Allow mosques in the same city / metro area (up to 40km or within radius)
            if (dist > 45) continue;

            results.push({
              id: item.slug ? `mawaqit-${item.slug}` : `mawaqit-${item.uuid || item.name}`,
              slug: item.slug,
              name: item.name,
              address: item.address,
              city: item.city || cityName,
              lat: itemLat,
              lon: itemLon,
              distance: dist,
              source: "mawaqit",
              isOfficial: true,
            });
          }
        }
      } catch (e) {
        console.warn("Mawaqit search error:", e);
      }
    }
    return results;
  };

  // 3. Query Nominatim (Fast & worldwide)
  const fetchNominatim = async (): Promise<Mosque[]> => {
    const delta = 0.15;
    const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
    const terms = ["mosque", "masjid", "مسجد", "mosquee"];

    const promises = terms.map(async (term) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          term,
        )}&bounded=1&viewbox=${viewbox}&limit=12`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "User-Agent": "IslamNoorApp/1.0" },
        });
        clearTimeout(timeoutId);
        if (!res.ok) return [];
        const data = (await res.json()) as NominatimItem[];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    });

    const rawLists = await Promise.all(promises);
    const results: Mosque[] = [];
    for (const list of rawLists) {
      for (const item of list) {
        const itemLat = parseFloat(item.lat);
        const itemLon = parseFloat(item.lon);
        if (isNaN(itemLat) || isNaN(itemLon)) continue;
        let rawName = item.name || item.display_name?.split(",")[0] || "Mosquée";

        if (!isMosque(rawName, item.display_name, undefined, item.class, item.type)) {
          continue;
        }

        const dist = distanceKm(lat, lon, itemLat, itemLon);
        const trimmed = rawName.trim().toLowerCase();
        if (
          trimmed === "mosque" ||
          trimmed === "masjid" ||
          trimmed === "مسجد" ||
          trimmed === "mosquee"
        ) {
          const sub = item.display_name?.split(",")[1]?.trim();
          rawName = sub ? `Mosquée (${sub})` : "Mosquée";
        }

        results.push({
          id: `nom-${item.place_id || item.osm_id}`,
          name: rawName,
          lat: itemLat,
          lon: itemLon,
          distance: dist,
          source: "osm",
          isOfficial: false,
        });
      }
    }
    return results;
  };

  // 4. Query Overpass API (Strictly religion=muslim OR building=mosque)
  const fetchOverpass = async (): Promise<Mosque[]> => {
    const query = `[out:json][timeout:4];(node(around:${radius},${lat},${lon})["amenity"="place_of_worship"]["religion"="muslim"];way(around:${radius},${lat},${lon})["amenity"="place_of_worship"]["religion"="muslim"];node(around:${radius},${lat},${lon})["building"="mosque"];way(around:${radius},${lat},${lon})["building"="mosque"];node(around:${radius},${lat},${lon})["amenity"="mosque"];way(around:${radius},${lat},${lon})["amenity"="mosque"];);out center 25;`;
    const servers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    for (const server of servers) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(server, {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "User-Agent": "IslamNoorApp/1.0",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        const json = (await res.json()) as {
          elements?: {
            id: number;
            type: string;
            lat?: number;
            lon?: number;
            center?: { lat: number; lon: number };
            tags?: Record<string, string>;
          }[];
        };
        if (!json?.elements) continue;
        return json.elements
          .map((e) => {
            const la = e.lat ?? e.center?.lat;
            const lo = e.lon ?? e.center?.lon;
            if (la === undefined || lo === undefined) return null;
            const name = e.tags?.name || e.tags?.["name:fr"] || e.tags?.["name:ar"] || "Mosquée";
            if (!isMosque(name, undefined, e.tags)) {
              return null;
            }
            return {
              id: `${e.type}-${e.id}`,
              name,
              lat: la,
              lon: lo,
              distance: distanceKm(lat, lon, la, lo),
              source: "osm" as const,
              isOfficial: false,
            };
          })
          .filter((m): m is Mosque => m !== null);
      } catch {
        /* try next mirror */
      }
    }
    return [];
  };

  // Run searches concurrently
  const [mawaqitResults, nomResults, overResults] = await Promise.all([
    fetchMawaqit(),
    fetchNominatim(),
    fetchOverpass(),
  ]);

  // Combine results with Mawaqit official mosques having top priority
  const combined: Mosque[] = [...mawaqitResults];

  for (const osmItem of [...nomResults, ...overResults]) {
    // Check if an existing Mawaqit mosque matches this OSM mosque (< 350m or very similar name)
    const existing = combined.find(
      (m) =>
        distanceKm(m.lat, m.lon, osmItem.lat, osmItem.lon) < 0.35 ||
        (m.name.toLowerCase().includes(osmItem.name.toLowerCase().slice(0, 8)) &&
          distanceKm(m.lat, m.lon, osmItem.lat, osmItem.lon) < 2),
    );

    if (!existing) {
      combined.push(osmItem);
    }
  }

  // Deduplicate items within 80 meters
  const unique: Mosque[] = [];
  for (const item of combined) {
    const exists = unique.some((u) => distanceKm(u.lat, u.lon, item.lat, item.lon) < 0.08);
    if (!exists) {
      unique.push(item);
    }
  }

  // Sort: Official Mawaqit verified mosques first (by distance), then other mosques by distance
  unique.sort((a, b) => {
    if (a.isOfficial && !b.isOfficial) return -1;
    if (!a.isOfficial && b.isOfficial) return 1;
    return a.distance - b.distance;
  });

  const finalResult = unique.slice(0, 20);

  // Save in cache
  memoryCache.set(cacheKey, { timestamp: Date.now(), data: finalResult });
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        `nur_mosques_${cacheKey}`,
        JSON.stringify({ timestamp: Date.now(), data: finalResult }),
      );
    } catch {
      /* ignore storage write errors */
    }
  }

  return finalResult;
}

/* ---------- Slippy-map projection helpers (no map library needed) ---------- */
export function lonToX(lon: number, z: number) {
  return ((lon + 180) / 360) * 2 ** z;
}
export function latToY(lat: number, z: number) {
  const s = Math.sin(rad(lat));
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 2 ** z;
}
