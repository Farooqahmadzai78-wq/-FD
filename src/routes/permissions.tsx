import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import illu from "@/assets/permissions-illu.png";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { playClick, playConfirm } from "@/lib/sfx";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "Autorisations requises — Islam-Noor" },
      {
        name: "description",
        content:
          "Activez les notifications, la position et la caméra pour profiter pleinement des services d'Islam-Noor.",
      },
      { property: "og:title", content: "Autorisations requises — Islam-Noor" },
      { property: "og:description", content: "Notifications, position et caméra pour Islam-Noor." },
    ],
  }),
  component: PermissionsPage,
});

function PermissionsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { update } = useSettings();

  const [grantedState, setGrantedState] = useState<Record<string, boolean>>({
    notif: false,
    geo: false,
    cam: false,
  });

  const cards = [
    {
      id: "notif",
      icon: Bell,
      title: t.permNotifTitle || "Rappels d'Azan & Prières",
      desc:
        t.permNotifDesc ||
        "Recevez des alertes sonores et visuelles aux moments exacts de chaque prière.",
      color: "from-amber-500/20 to-amber-600/10 text-amber-500 border-amber-500/30",
    },
    {
      id: "geo",
      icon: MapPin,
      title: t.permGeoTitle || "Localisation GPS pour la Qibla",
      desc:
        t.permGeoDesc ||
        "Calcule la direction exacte de la Makkah et trouve les mosquées à proximité.",
      color: "from-emerald-500/20 to-emerald-600/10 text-emerald-500 border-emerald-500/30",
    },
    {
      id: "cam",
      icon: Camera,
      title: t.permCamTitle || "Caméra pour Scanner Halal",
      desc: t.permCamDesc || "Scannez instantanément les codes-barres des produits alimentaires.",
      color: "from-sky-500/20 to-sky-600/10 text-sky-500 border-sky-500/30",
    },
  ];

  const ask = async (id: string) => {
    playClick();
    try {
      if (id === "notif" && "Notification" in window) {
        const res = await Notification.requestPermission();
        if (res === "granted") setGrantedState((p) => ({ ...p, notif: true }));
      }
      if (id === "geo" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            playConfirm();
            setGrantedState((p) => ({ ...p, geo: true }));
          },
          () => {},
          { timeout: 8000 },
        );
      }
      if (id === "cam" && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((tr) => tr.stop());
        playConfirm();
        setGrantedState((p) => ({ ...p, cam: true }));
      }
    } catch {
      /* refus : l'app reste utilisable */
    }
  };

  const handleFinish = () => {
    playConfirm();
    update({ permissionsSeen: true });
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-4 py-8 max-w-xl mx-auto space-y-6 select-none">
      {/* Top Presentation Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          <Sparkles className="size-3.5" />
          Configuration de votre Expérience
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-foreground">
          {t.permissionsTitle || "Autorisations Utiles"}
        </h1>

        <div className="relative mx-auto size-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-2xl animate-pulse" />
          <img
            src={illu}
            alt="Permissions Islam-Noor"
            width={816}
            height={816}
            className="relative z-10 size-28 object-contain drop-shadow-md"
          />
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
          {t.permIntro ||
            "Pour vous offrir des horaires de prière précis, la direction de la Qibla et le scanner halal, Islam-Noor a besoin de quelques accès."}
        </p>
      </div>

      {/* Permission Cards Grid */}
      <div className="space-y-3">
        {cards.map((c) => {
          const isGranted = grantedState[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => ask(c.id)}
              className={`w-full p-4 rounded-3xl border text-left transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden group shadow-xs ${
                isGranted
                  ? "bg-emerald-500/10 border-emerald-500/40 text-foreground"
                  : "bg-card border-border/80 hover:border-amber-500/50 hover:bg-muted/40"
              }`}
            >
              <div
                className={`size-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0 border shadow-xs`}
              >
                <c.icon className="size-6" />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-foreground">{c.title}</span>
                  {isGranted && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Activé
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug font-medium">{c.desc}</p>
              </div>

              <div className="shrink-0 pl-1">
                {isGranted ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 text-slate-950 flex items-center justify-center transition-colors">
                    <ChevronRight className="size-4" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Privacy note & Action Button */}
      <div className="space-y-4 pt-2">
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
          <span className="leading-tight">
            {t.permWarning ||
              "Vos données restent 100% privées sur votre appareil et ne sont jamais transmises à des tiers."}
          </span>
        </div>

        <Button
          type="button"
          onClick={handleFinish}
          className="w-full py-6 text-sm sm:text-base font-black rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          {t.continue || "Continuer vers l'application"}
        </Button>
      </div>
    </div>
  );
}
