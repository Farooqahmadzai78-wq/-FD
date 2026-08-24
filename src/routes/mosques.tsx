import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { nearbyMosques, type Mosque } from "@/lib/mosques";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/mosques")({
  head: () => ({
    meta: [
      { title: "Choisir une mosquée — Islam-Noor" },
      {
        name: "description",
        content:
          "Sélectionnez manuellement une mosquée de votre ville pour synchroniser vos horaires officiels de prière.",
      },
      { property: "og:title", content: "Choisir une mosquée — Islam-Noor" },
      {
        property: "og:description",
        content: "Synchronisez vos horaires avec la mosquée officielle de votre choix.",
      },
    ],
  }),
  component: MosquesPage,
});

function MosquesPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const place = settings.place;
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const city = place?.name ?? "";
  const current = settings.mosque?.city === city ? settings.mosque : null;

  const loadMosques = (force = false, query?: string) => {
    if (!place) return;
    setLoading(true);
    const effectiveCity = query && query.trim().length >= 2 ? query.trim() : city;
    nearbyMosques(place.lat, place.lon, 15000, force, effectiveCity)
      .then((m) => setMosques(m))
      .catch(() => setMosques([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMosques(false);
  }, [place?.lat, place?.lon]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMosques = searchQuery.trim()
    ? mosques.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.address && m.address.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : mosques;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      loadMosques(true, searchQuery.trim());
    }
  };

  return (
    <div className="space-y-4 px-4 pb-12 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold">{t.chooseMosque}</h1>
          <button
            type="button"
            onClick={() => loadMosques(true, searchQuery)}
            disabled={loading}
            title={t.refreshSearch}
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <button
          type="button"
          aria-label={t.close}
          onClick={() => navigate({ to: "/" })}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-transform active:scale-95"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* Mosque and City Quick Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Rechercher une mosquée à ${city || "votre ville"}…`}
          className="pl-10 pr-10 rounded-2xl h-11 bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              loadMosques(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {/* Active Mosque Banner */}
      {current && (
        <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Mosquée actuellement synchronisée</span>
            </div>
            <p className="font-extrabold text-sm truncate mt-0.5">{current.name}</p>
            {current.isOfficial && (
              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                Horaires officiels Mawaqit
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              update({ mosque: null });
              appToast.info("Retour aux calculs astronomiques de la ville", {
                category: "settings",
              });
            }}
            className="shrink-0 text-xs font-bold text-muted-foreground hover:text-destructive underline px-2 py-1"
          >
            Désynchroniser
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="size-8 animate-spin text-[var(--w-from)]" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.searchingMosques}</p>
        </div>
      )}

      {!loading && !filteredMosques.length && (
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <p className="text-sm text-muted-foreground">
            {t.noMosqueFound} {city ? `(${city})` : ""}.
          </p>
          <button
            type="button"
            onClick={() => loadMosques(true, searchQuery)}
            className="widget mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold shadow"
          >
            <RefreshCw className="size-3.5" /> {t.retry}
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {filteredMosques.map((m) => {
          const active = current?.id === m.id || (m.slug && current?.slug === m.slug);
          return (
            <li
              key={m.id}
              data-widget-card
              className={`rounded-3xl p-4 transition-all duration-200 border ${
                active
                  ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span className="widget-badge size-12 shrink-0 text-xl grid place-items-center rounded-2xl">
                  🕌
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-[15px] leading-snug">{m.name}</span>
                    {m.isOfficial && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="size-3" />
                        Officiel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {m.address || `${city}${place?.country ? `, ${place.country}` : ""}`}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {m.distance.toFixed(1)} km
                    </span>
                    {m.jumua && (
                      <span className="font-medium text-foreground">
                        Jumua : <span className="font-mono">{m.jumua}</span>
                        {m.jumua2 && <span className="font-mono"> / {m.jumua2}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {m.isOfficial ? "Horaires exacts Mawaqit & Iqama" : "Coordonnées géographiques"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    update({
                      mosque: {
                        id: m.id,
                        slug: m.slug,
                        name: m.name,
                        city,
                        country: place?.country,
                        address: m.address,
                        lat: m.lat,
                        lon: m.lon,
                        source: m.source,
                        isOfficial: m.isOfficial,
                        jumua: m.jumua,
                        jumua2: m.jumua2,
                        shuruq: m.shuruq,
                        timezone: m.timezone,
                      },
                    });
                    appToast.success(`Horaires synchronisés avec ${m.name}`, {
                      category: "settings",
                    });
                    navigate({ to: "/" });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs active:scale-95 ${
                    active ? "bg-emerald-600 text-white" : "widget hover:opacity-95"
                  }`}
                >
                  {active ? (
                    <>
                      <Check className="size-3.5" />
                      Synchronisé
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Synchroniser
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
