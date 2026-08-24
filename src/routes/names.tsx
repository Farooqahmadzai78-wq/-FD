import { createFileRoute } from "@tanstack/react-router";
import { NAMES_OF_ALLAH } from "@/lib/nur-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/names")({
  head: () => ({
    meta: [
      { title: "Les noms d'Allah — Islam-Noor" },
      {
        name: "description",
        content: "Les plus beaux noms d'Allah en arabe, translittérés et traduits en français.",
      },
      { property: "og:title", content: "Les noms d'Allah — Islam-Noor" },
      { property: "og:description", content: "Arabe, translittération et traduction française." },
    ],
  }),
  component: NamesPage,
});

function NamesPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-12">
      <div className="glass p-4">
        <h1 className="text-2xl font-extrabold text-foreground">{t.names}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t.namesSub}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {NAMES_OF_ALLAH.map((n, i) => (
          <div key={`${n.translit}-${i}`} className="widget-glass p-3 text-center">
            <span className="widget-badge mx-auto size-6 text-[10px] font-bold">{i + 1}</span>
            <p className="font-[var(--font-arabic)] text-2xl">{n.arabic}</p>
            <p className="text-xs font-bold">{n.translit}</p>
            <p className="text-[10px] opacity-85">{t.namesMeanings?.[i] ?? n.fr}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
