import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, X } from "lucide-react";
import { InvocationCard } from "@/components/InvocationCard";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";
import { getWidgetThemeById } from "@/lib/customization-themes";
import {
  INVOCATION_CATEGORIES,
  getInvocationsByCategory,
  type InvocationCatKey,
} from "@/lib/invocations-full";

export const Route = createFileRoute("/invocations/$cat")({
  head: () => ({
    meta: [
      { title: "Invocations — Islam-Noor" },
      {
        name: "description",
        content:
          "Invocations authentiques en arabe, translittération et traduction, avec lecture audio.",
      },
      { property: "og:title", content: "Invocations — Islam-Noor" },
      {
        property: "og:description",
        content: "Invocations authentiques en arabe, translittérées et traduites.",
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useParams();
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const { settings } = useSettings();
  const activeWidgetTheme = getWidgetThemeById(settings.widgetTheme);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const category = INVOCATION_CATEGORIES.find((c) => c.key === cat);
  const catKey = (category?.key ?? "daily") as InvocationCatKey;
  const list = getInvocationsByCategory(catKey);

  const langKey = locale.split("-")[0];
  const categoryTitle =
    category?.label[locale] ||
    category?.label[langKey] ||
    category?.label.en ||
    category?.label.fr ||
    "Invocations";

  const filtered = list.filter((inv) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = (
      inv.title[locale] ||
      inv.title[langKey] ||
      inv.title.en ||
      inv.title.fr ||
      ""
    )
      .toLowerCase()
      .includes(q);
    const transMatch = (
      inv.translation[locale] ||
      inv.translation[langKey] ||
      inv.translation.en ||
      inv.translation.fr ||
      ""
    )
      .toLowerCase()
      .includes(q);
    const translitMatch = inv.translit.toLowerCase().includes(q);
    const arabicMatch = inv.arabic.includes(q);
    return titleMatch || transMatch || translitMatch || arabicMatch;
  });

  return (
    <div className="min-h-screen px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-24 max-w-2xl mx-auto">
      {/* Grand conteneur blanc unifié englobant tous les éléments */}
      <div className="rounded-[32px] p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Dynamic header sub-widget matching the active selected theme */}
        <div
          className={`relative rounded-3xl p-4 sm:p-5 text-white shadow-md border border-white/20 overflow-hidden transition-all duration-300 flex items-center justify-between ${
            activeWidgetTheme.animClass || ""
          }`}
          style={{
            background:
              activeWidgetTheme.gradient ||
              `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={t.back}
              onClick={() => navigate({ to: "/quran" })}
              className="grid size-9 place-items-center rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all cursor-pointer border border-white/25 shrink-0"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1
                className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs"
                suppressHydrationWarning
              >
                {categoryTitle}
              </h1>
              <p
                className="text-xs text-white/90 font-medium drop-shadow-2xs mt-0.5"
                suppressHydrationWarning
              >
                {filtered.length}{" "}
                {filtered.length > 1
                  ? t.invocationPlural || t.invocationsLabel || "invocations"
                  : t.invocationSingular || "invocation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label={t.byName}
            onClick={() => setShowSearch(!showSearch)}
            className={`grid size-9 place-items-center rounded-2xl transition-colors shrink-0 ${
              showSearch
                ? "bg-white text-slate-900 shadow-xs"
                : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/25"
            }`}
          >
            {showSearch ? <X className="size-4" /> : <Search className="size-4" />}
          </button>
        </div>

        {/* Expandable Search Input */}
        {showSearch && (
          <div className="mt-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchInvocationPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#388E6C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#388E6C]/20 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* List of Invocation Cards */}
        {!filtered.length ? (
          <div className="py-12 text-center text-sm text-slate-500" suppressHydrationWarning>
            {t.noInvocationFound}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((inv) => (
              <InvocationCard key={inv.id} inv={inv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
