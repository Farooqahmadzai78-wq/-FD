export type DailyPrayerLog = Record<string, string[]>;

const STORAGE_KEY = "nur.prayer_history_log.v2";

/** Returns ISO date string YYYY-MM-DD for a given date. */
export function toDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getStoredPrayerHistory(): DailyPrayerLog {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordPrayerToggle(
  prayerKey: string,
  dateStr = toDateKey(),
): { history: DailyPrayerLog; todayDone: string[] } {
  const history = getStoredPrayerHistory();
  const currentToday = history[dateStr] || [];
  let updatedToday: string[];

  if (currentToday.includes(prayerKey)) {
    updatedToday = currentToday.filter((k) => k !== prayerKey);
  } else {
    updatedToday = [...currentToday, prayerKey];
  }

  history[dateStr] = updatedToday;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore storage quota */
  }

  return { history, todayDone: updatedToday };
}

export type PrayerStats = {
  totalValidated: number;
  weeklyValidated: number;
  weeklyTotal: number;
  weeklyPercentage: number;
  monthlyValidated: number;
  monthlyTotal: number;
  monthlyPercentage: number;
  regularityLabel: string;
  regularityKey: "regToStart" | "regExcellent" | "regGood" | "regInProg";
  hasEnoughData: boolean;
};

export function calculatePrayerStats(history: DailyPrayerLog): PrayerStats {
  const today = new Date();
  const todayKey = toDateKey(today);

  // Total count across all history
  let totalValidated = 0;
  Object.values(history).forEach((prayers) => {
    totalValidated += prayers.length;
  });

  // Calculate Last 7 Days (Weekly)
  let weeklyValidated = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    const dayPrayers = history[key] || [];
    weeklyValidated += dayPrayers.length;
  }
  const weeklyTotal = 35; // 7 days * 5 prayers
  const weeklyPercentage = Math.min(100, Math.round((weeklyValidated / weeklyTotal) * 100));

  // Calculate Current Month
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthlyTotal = daysInMonth * 5;

  let monthlyValidated = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentYear, currentMonth, day);
    if (d > today) break; // Don't count future days
    const key = toDateKey(d);
    const dayPrayers = history[key] || [];
    monthlyValidated += dayPrayers.length;
  }
  const monthlyPercentage = Math.min(100, Math.round((monthlyValidated / monthlyTotal) * 100));

  // Regularity Assessment
  let regularityKey: "regToStart" | "regExcellent" | "regGood" | "regInProg" = "regToStart";
  let regularityLabel = "À débuter";
  if (weeklyPercentage >= 85) {
    regularityKey = "regExcellent";
    regularityLabel = "Excellente";
  } else if (weeklyPercentage >= 50) {
    regularityKey = "regGood";
    regularityLabel = "Bonne";
  } else if (weeklyPercentage > 0) {
    regularityKey = "regInProg";
    regularityLabel = "En progression";
  }

  // Display conditions: Must have at least 1 validated prayer or historical logs
  const hasEnoughData = totalValidated > 0;

  return {
    totalValidated,
    weeklyValidated,
    weeklyTotal,
    weeklyPercentage,
    monthlyValidated,
    monthlyTotal,
    monthlyPercentage,
    regularityLabel,
    regularityKey,
    hasEnoughData,
  };
}
