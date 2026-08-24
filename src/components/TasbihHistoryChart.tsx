import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, Award, Calendar, BarChart2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type DailyHistory = Record<string, number>;

const HISTORY_KEY = "nur.tasbih_daily_history.v1";

export function getStoredHistory(): DailyHistory {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw) as DailyHistory;
    }
  } catch {
    /* ignore */
  }
  // Initial seed data for the last week so chart looks vibrant right away
  const seed: DailyHistory = {};
  const now = new Date();
  const sampleCounts = [66, 99, 132, 100, 165, 33, 0];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    seed[key] = sampleCounts[6 - i] ?? 0;
  }
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(seed));
  } catch {
    /* ignore */
  }
  return seed;
}

export function saveStoredHistory(history: DailyHistory) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function recordTasbihTap(increment = 1): DailyHistory {
  const history = getStoredHistory();
  const todayKey = new Date().toISOString().slice(0, 10);
  history[todayKey] = (history[todayKey] || 0) + increment;
  saveStoredHistory(history);
  return history;
}

export function setTodayTasbihCount(count: number): DailyHistory {
  const history = getStoredHistory();
  const todayKey = new Date().toISOString().slice(0, 10);
  history[todayKey] = count;
  saveStoredHistory(history);
  return history;
}

type Props = {
  currentCount: number;
  history: DailyHistory;
};

export function TasbihHistoryChart({ currentCount, history }: Props) {
  const { t, locale: userLocale } = useI18n();

  const chartData = useMemo(() => {
    const days: { dateKey: string; dayLabel: string; count: number; isToday: boolean }[] = [];
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    const localeTag = userLocale.startsWith("ar")
      ? "ar-SA"
      : userLocale === "ps"
        ? "ps-AF"
        : userLocale === "fa"
          ? "fa-IR"
          : userLocale === "ru"
            ? "ru-RU"
            : userLocale === "it"
              ? "it-IT"
              : userLocale === "en"
                ? "en-US"
                : "fr-FR";

    const todayText = t.today || "Aujourd'hui";

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const isToday = key === todayKey;

      // Short day name (e.g. Lun, Mar, Mer...)
      const rawDayLabel = isToday
        ? todayText
        : d.toLocaleDateString(localeTag, { weekday: "short" });

      const dayLabel = rawDayLabel.charAt(0).toUpperCase() + rawDayLabel.slice(1);
      const count = isToday ? Math.max(currentCount, history[key] || 0) : history[key] || 0;

      days.push({
        dateKey: key,
        dayLabel,
        count,
        isToday,
      });
    }
    return days;
  }, [currentCount, history, userLocale, t.today]);

  const totalWeek = useMemo(() => chartData.reduce((acc, d) => acc + d.count, 0), [chartData]);
  const avgDaily = useMemo(() => Math.round(totalWeek / 7), [totalWeek]);
  const maxDay = useMemo(() => Math.max(...chartData.map((d) => d.count), 1), [chartData]);

  return (
    <div className="glass mt-6 p-5">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-[var(--w-from)]/15 text-[var(--w-from)]">
            <BarChart2 className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">
              {t.tasbih7DaysTrend || "Tendance des 7 derniers jours"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t.tasbihDailyProgress || "Progression quotidienne des dhikrs"}
            </p>
          </div>
        </div>
      </div>

      {/* Metric badges */}
      <div className="my-3 grid grid-cols-3 gap-2 text-center">
        <div className="widget-soft rounded-xl p-2.5">
          <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="size-3" /> {t.tasbihTotal7d || "Total 7j"}
          </p>
          <p className="mt-0.5 text-base font-extrabold tabular-nums text-foreground">
            {totalWeek}
          </p>
        </div>
        <div className="widget-soft rounded-xl p-2.5">
          <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <TrendingUp className="size-3" /> {t.tasbihAvgPerDay || "Moy./jour"}
          </p>
          <p className="mt-0.5 text-base font-extrabold tabular-nums text-[var(--w-from)]">
            {avgDaily}
          </p>
        </div>
        <div className="widget-soft rounded-xl p-2.5">
          <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <Award className="size-3" /> {t.tasbihRecord || "Record"}
          </p>
          <p className="mt-0.5 text-base font-extrabold tabular-nums text-foreground">{maxDay}</p>
        </div>
      </div>

      {/* Recharts Bar visualization */}
      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="rounded-xl border border-border bg-popover p-2.5 shadow-lg text-xs">
                      <p className="font-bold text-popover-foreground">{data.dayLabel}</p>
                      <p className="text-[var(--w-from)] font-semibold mt-0.5">
                        {data.count} {t.tasbihRecitations || "récitations"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isToday
                      ? "var(--w-from)"
                      : "color-mix(in oklab, var(--w-from) 35%, transparent)"
                  }
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
