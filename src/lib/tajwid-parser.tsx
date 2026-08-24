import React from "react";

export type TajwidCategory =
  "madd" | "ghunna" | "qalqala" | "ikhfa" | "idgham" | "iqlab" | "silent";

export const TAJWID_CATEGORY_STYLES: Record<TajwidCategory, string> = {
  madd: "text-red-600 dark:text-red-400 font-bold drop-shadow-[0_0_1px_rgba(220,38,38,0.3)]",
  ghunna:
    "text-emerald-600 dark:text-emerald-400 font-bold drop-shadow-[0_0_1px_rgba(22,163,74,0.3)]",
  qalqala: "text-sky-600 dark:text-sky-400 font-bold drop-shadow-[0_0_1px_rgba(2,132,199,0.3)]",
  ikhfa:
    "text-purple-600 dark:text-purple-400 font-bold drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]",
  idgham:
    "text-orange-600 dark:text-orange-400 font-bold drop-shadow-[0_0_1px_rgba(234,88,12,0.3)]",
  iqlab: "text-amber-600 dark:text-amber-400 font-bold drop-shadow-[0_0_1px_rgba(202,138,4,0.3)]",
  silent: "text-slate-400 dark:text-slate-500 opacity-75 font-normal",
};

type Cluster = {
  text: string;
  baseChar: string;
  diacritics: string;
  category?: TajwidCategory;
};

function isCombiningMark(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x064b && code <= 0x065f) || // Tashkeel (Tathween, Sukun, Shaddah, Damma, Fatha, Kasra)
    code === 0x0670 || // Superscript Alif ٰ
    (code >= 0x06d6 && code <= 0x06ed) // Quranic annotation signs
  );
}

const QALQALA_LETTERS = new Set(["ق", "ط", "ب", "ج", "د"]);
const IKHFA_LETTERS = new Set([
  "ت",
  "ث",
  "ج",
  "د",
  "ذ",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ف",
  "ق",
  "ك",
]);
const IDGHAM_LETTERS = new Set(["ي", "ر", "م", "ل", "و", "ن"]);

/**
 * Parses Uthmani Arabic text into clusters with exact Tajwid rule coloring.
 * Crucially preserves 100% of characters, diacritics, and spaces without modification.
 */
export function parseTajwidClusters(text: string): Cluster[] {
  if (!text) return [];

  const rawClusters: Cluster[] = [];
  let i = 0;
  while (i < text.length) {
    const baseChar = text[i];
    let clusterText = baseChar;
    let diacritics = "";
    i++;
    while (i < text.length && isCombiningMark(text[i])) {
      clusterText += text[i];
      diacritics += text[i];
      i++;
    }
    rawClusters.push({ text: clusterText, baseChar, diacritics });
  }

  // Second pass: assign Tajwid categories based on letter + context
  for (let idx = 0; idx < rawClusters.length; idx++) {
    const curr = rawClusters[idx];
    const base = curr.baseChar;
    const dia = curr.diacritics;
    const full = curr.text;

    // 1. Madd (Red) - Madda symbol ۤ or Superscript Alif ٰ or long vowels with Madd
    if (full.includes("\u0653") || full.includes("ۤ")) {
      curr.category = "madd";
      continue;
    }

    // 2. Ghunna (Green) - Nun Shaddah (نّ) or Mim Shaddah (مّ)
    if ((base === "ن" || base === "م") && (dia.includes("\u0651") || dia.includes("ّ"))) {
      curr.category = "ghunna";
      continue;
    }

    // 3. Qalqala (Sky Blue) - Letters of Qalqala (ق ط ب ج د) with Sukun or at word boundaries
    if (QALQALA_LETTERS.has(base)) {
      const hasSukun = dia.includes("\u0652") || dia.includes("ۡ") || dia.includes("ْ");
      const isWordEnd =
        idx === rawClusters.length - 1 ||
        rawClusters[idx + 1].baseChar === " " ||
        rawClusters[idx + 1].baseChar === "۔";
      if (hasSukun || isWordEnd) {
        curr.category = "qalqala";
        continue;
      }
    }

    // 4. Silent / Unpronounced Letters (Grey) - Hamzat al-Wasl ٱ or silent Alif/Lam/Zero ۟
    if (
      base === "ٱ" ||
      full.includes("\u06E0") || // Round zero
      full.includes("۟")
    ) {
      curr.category = "silent";
      continue;
    }

    // Check for Silent Lam in Solar Letters (Alif-Lam Shamsiyyah e.g. ٱلشَّمْسِ)
    if (
      base === "ل" &&
      idx > 0 &&
      rawClusters[idx - 1].baseChar === "ٱ" &&
      idx < rawClusters.length - 1 &&
      (rawClusters[idx + 1].diacritics.includes("\u0651") ||
        rawClusters[idx + 1].diacritics.includes("ّ"))
    ) {
      curr.category = "silent";
      continue;
    }

    // 5. Nun Sakinah & Tanwin rules (Iqlab, Idgham, Ikhfa)
    const isNunSakin =
      base === "ن" && (dia.includes("\u0652") || dia.includes("ۡ") || dia.length === 0);
    const hasTanwin =
      dia.includes("\u064B") ||
      dia.includes("\u064C") ||
      dia.includes("\u064D") ||
      dia.includes("ً") ||
      dia.includes("ٌ") ||
      dia.includes("ٍ");

    // Look ahead to next non-space cluster
    let nextIdx = idx + 1;
    while (nextIdx < rawClusters.length && rawClusters[nextIdx].baseChar.trim() === "") {
      nextIdx++;
    }
    const nextCluster = nextIdx < rawClusters.length ? rawClusters[nextIdx] : null;

    if (full.includes("\u06E2") || full.includes("ۢ") || full.includes("ۘ")) {
      curr.category = "iqlab";
      continue;
    }

    if (isNunSakin || hasTanwin) {
      if (nextCluster) {
        const nextBase = nextCluster.baseChar;
        if (nextBase === "ب") {
          curr.category = "iqlab";
          continue;
        } else if (IDGHAM_LETTERS.has(nextBase)) {
          curr.category = "idgham";
          continue;
        } else if (IKHFA_LETTERS.has(nextBase)) {
          curr.category = "ikhfa";
          continue;
        }
      }
    }
  }

  return rawClusters;
}
