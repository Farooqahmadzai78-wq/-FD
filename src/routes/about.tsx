import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Info,
  Volume2,
  ShieldCheck,
  Sparkles,
  QrCode,
  Globe2,
  Heart,
  Award,
  ChevronRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/images/splash_logo_crescent_1786275718969.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Islam-Noor, Prières, Qibla & Coran" },
      {
        name: "description",
        content:
          "Découvrez le fonctionnement de Islam-Noor : calcul de la direction de la Qibla, horaires de prière, Coran en 50 langues et scanner halal.",
      },
      { property: "og:title", content: "À propos — Islam-Noor" },
      {
        property: "og:description",
        content:
          "Présentation de l'application Islam-Noor, algorithmes astronomiques, Qibla et scanner halal.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const VERSION = "3.0.0";

function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 space-y-6">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-3 py-1.5 rounded-xl border border-border/60"
          >
            <ArrowLeft className="size-4 text-amber-500" />
            <span>{t.nav_settings || "Réglages"}</span>
          </Link>
          <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Présentation & Fonctionnement
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* HERO PRESENTATION BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-card to-emerald-500/10 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
          {/* Subtle Background Glows */}
          <div className="absolute -top-16 -right-16 size-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 p-2 border border-amber-500/40 shadow-lg shrink-0 flex items-center justify-center">
              <img src={logo} alt="Islam-Noor" className="size-full object-contain rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-foreground">
                  Islam-Noor
                </h1>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Version {VERSION}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl">
                {t.aboutIntro ||
                  "Islam-Noor est votre compagnon spirituel complet au quotidien : horaires de prière certifiés, boussole Qibla 3D, Coran avec Tajwid audio, scanner Halal et invocations authentiques."}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Globe2 className="size-3.5" /> 50 Langues
                </span>
                <span className="flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" /> 100% Hors-ligne
                </span>
                <span className="flex items-center gap-1 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 text-sky-700 dark:text-sky-400">
                  <Award className="size-3.5" /> Sans Pubs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CORE FEATURES PRESENTATION GRID */}
        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            Fonctionnalités Principales & Algorithmes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature 1: Qibla */}
            <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 hover:border-emerald-500/40 transition-all shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Compass className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {t.aboutQiblaTitle || "Direction de la Qibla"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Calcul par Grand Cercle</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.aboutQiblaDesc ||
                  "La position GPS de l'appareil est croisée avec les coordonnées exactes de la Kaaba (21.4225° N, 39.8262° E). La boussole magnétique compense la déclinaison locale et s'illumine en vert à ±3° d'alignement."}
              </p>
            </div>

            {/* Feature 2: Quran */}
            <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 hover:border-emerald-500/40 transition-all shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {t.aboutQuranTitle || "Saint Coran & Tajwid"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Arabe, Phonétique & Audio</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.aboutQuranDesc ||
                  "Propose l'intégralité du Coran en texte usmani avec règles du Tajwid en couleur, traductions en 50 langues et récitations audio verset par verset par des récitateurs renommés."}
              </p>
            </div>

            {/* Feature 3: Prayer Times */}
            <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 hover:border-amber-500/40 transition-all shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Volume2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Calculs des Prières</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Organisations Mondiales & Mawaqit
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.aboutTimesDesc ||
                  "Horaires calculés scientifiquement selon les méthodes officielles (UOIF, Ligue Islamique Mondiale, Umm al-Qura, ISNA, Egypte) avec rappels personnalisables avant l'Azan."}
              </p>
            </div>

            {/* Feature 4: Halal Scanner */}
            <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 hover:border-sky-500/40 transition-all shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
                  <QrCode className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    Scanner & Additifs Halal
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Base Open Food Facts</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scanner de code-barres en temps réel analysant les additifs E-numbers (gélatines,
                émulsifiants, colorants) pour indiquer si le produit est Halal, Douteux ou Haram.
              </p>
            </div>
          </div>
        </div>

        {/* STATS & CREDENTIALS CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-muted/50 via-card to-muted/50 border border-border/80 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Heart className="size-3.5 fill-amber-500" />
            Conçu pour la Oumma avec Respect & Précision
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-3 rounded-2xl bg-card border border-border/60">
              <div className="text-lg font-black text-amber-500 font-mono">100%</div>
              <div className="text-[10px] font-bold text-muted-foreground">Gratuit & Sans Pubs</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/60">
              <div className="text-lg font-black text-emerald-500 font-mono">50</div>
              <div className="text-[10px] font-bold text-muted-foreground">Langues Intégrées</div>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/60">
              <div className="text-lg font-black text-sky-500 font-mono">3.0</div>
              <div className="text-[10px] font-bold text-muted-foreground">Version Majeure</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-semibold pt-2">
            {t.developerTitle ||
              "Développé avec dévouement pour l'ensemble des musulmans du monde."}
          </p>
        </div>
      </div>
    </div>
  );
}
