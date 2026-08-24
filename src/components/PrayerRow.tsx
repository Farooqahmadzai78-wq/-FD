import { CloudSun, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import type { PrayerKey } from "@/lib/prayer-times";
import { ARABIC_NAMES, formatPrayerTime } from "@/lib/prayer-times";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";

const ICONS: Record<PrayerKey, React.ReactNode> = {
  Fajr: <Sunrise className="size-5" />,
  Dhuhr: <Sun className="size-5" />,
  Asr: <CloudSun className="size-5" />,
  Maghrib: <Sunset className="size-5" />,
  Isha: <Moon className="size-5" />,
};

export function PrayerRow({
  prayerKey,
  time,
  active,
  iqama,
  iqamaDisplay,
}: {
  prayerKey: PrayerKey;
  time: string;
  active?: boolean;
  iqama?: string;
  iqamaDisplay?: string;
}) {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const formattedTime = formatPrayerTime(time, { lang: locale, format: settings.timeFormat });

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 ${active ? "widget" : ""}`}>
      <span className={`shrink-0 ${active ? "" : "text-muted-foreground"}`}>
        {ICONS[prayerKey]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-left truncate" suppressHydrationWarning>
          {t[prayerKey.toLowerCase() as "fajr"]}
        </p>
        {(iqama || iqamaDisplay) && (
          <p className="text-[10px] opacity-75 font-medium flex items-center gap-1">
            <span>Iqama :</span>
            <span className="font-mono">{iqamaDisplay || iqama}</span>
          </p>
        )}
      </div>
      <span
        className={`font-[var(--font-arabic)] text-base shrink-0 ${
          active ? "opacity-90" : "text-muted-foreground"
        }`}
      >
        {ARABIC_NAMES[prayerKey]}
      </span>
      <span
        className="ml-auto font-mono text-sm font-bold tabular-nums shrink-0"
        suppressHydrationWarning
      >
        {formattedTime}
      </span>
    </div>
  );
}
