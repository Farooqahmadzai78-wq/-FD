import { useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import type { InvocationItem } from "@/lib/invocations-full";
import { audio, useTrack } from "@/lib/audio-player";
import { speakReminderText } from "@/lib/reminder-speaker";
import marbleBg from "@/assets/images/marble_card_bg_1785590339146.jpg";

export function InvocationCard({ inv }: { inv: InvocationItem }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const localizedTitle = inv.title[locale] || inv.title.fr || inv.title.en;
  const localizedTranslation = inv.translation[locale] || inv.translation.fr || inv.translation.en;

  const trackId = `invocation-${inv.id}`;
  const { active, playing } = useTrack(trackId);

  const toggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (active) {
      audio.toggle(trackId);
    } else {
      audio.playInvocation(inv.id, {
        title: localizedTitle,
        arabic: inv.arabic,
        translit: inv.translit,
        source: inv.source,
      });
    }
  };

  const reset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    audio.reset(trackId);
  };

  return (
    <>
      {/* List item card with marble background & capsule image border, NO translation */}
      <article
        onClick={() => setOpen(true)}
        data-widget-card
        className="group relative flex items-center gap-3.5 rounded-3xl border border-slate-200/60 p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), url(${marbleBg})`,
        }}
      >
        {/* Left: Capsule-shaped / Rounded Thumbnail Image with golden ring */}
        <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-[1.75rem] bg-slate-100 ring-2 ring-amber-300/60 shadow-xs self-center">
          <img
            src={inv.image}
            alt={localizedTitle}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Right: Content Details */}
        <div className="flex flex-1 flex-col justify-between min-w-0 self-stretch space-y-2 py-0.5">
          <div className="space-y-1">
            {/* Title */}
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
              {localizedTitle}
            </h3>

            {/* Complete Arabic Text */}
            <p
              dir="rtl"
              className="font-[var(--font-arabic)] text-base font-bold text-slate-900 leading-relaxed"
            >
              {inv.arabic}
            </p>

            {/* Complete Transliteration / Pronunciation (No translation) */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{inv.translit}</p>
          </div>

          {/* Bottom row: Source on left, Audio & Reset buttons on right */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[140px]">
              {inv.source}
            </span>

            <div
              className="flex items-center gap-1.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Audio Button */}
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : t.listen}
                title={playing ? "Pause" : t.listen}
                className={`grid size-8 place-items-center rounded-full transition-colors border border-slate-200/80 shadow-xs cursor-pointer ${
                  playing
                    ? "bg-[#388E6C] text-white border-transparent"
                    : "bg-white/90 text-slate-700 hover:bg-white"
                }`}
              >
                {playing ? (
                  <Pause className="size-3.5 fill-current" />
                ) : (
                  <Play className="size-3.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={reset}
                aria-label={t.reset}
                title={t.reset}
                className="grid size-8 place-items-center rounded-full bg-white/90 text-slate-700 hover:bg-white border border-slate-200/80 shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Full Modal View */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Volume2 className="size-4 text-[#388E6C]" />
              {localizedTitle}
            </DialogTitle>
          </DialogHeader>

          {/* Modal Header Image */}
          <div className="h-36 w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={inv.image}
              alt={localizedTitle}
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          </div>

          <div className="space-y-3 pt-2">
            {/* Arabic in FIRST position */}
            <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100/60">
              <p className="text-xs font-semibold text-amber-800/70 mb-1">{t.arabicText}</p>
              <p
                dir="rtl"
                className="font-[var(--font-arabic)] text-2xl leading-loose text-slate-900 text-right"
              >
                {inv.arabic}
              </p>
            </div>

            {/* Transliteration */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t.transliteration}
              </p>
              <p className="mt-0.5 text-sm italic text-slate-700 leading-relaxed">{inv.translit}</p>
            </div>

            {/* Translation */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.translationLabel} ({locale.split("-")[0].toUpperCase()})
                </p>
                <button
                  type="button"
                  onClick={() =>
                    speakReminderText(`inv-trans-${inv.id}`, localizedTranslation, false)
                  }
                  className="text-xs text-[#388E6C] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="size-3" />
                  {t.listenInLang}
                </button>
              </div>
              <p className="mt-0.5 text-sm text-slate-800 leading-relaxed">
                {localizedTranslation}
              </p>
            </div>

            {/* Source */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="font-semibold">{t.sourceLabel}</span>
              <span>{inv.source}</span>
            </div>

            {/* Audio actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={toggle}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#388E6C] py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#2e7559] transition-colors cursor-pointer"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                {playing ? "Pause" : t.listen}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label={t.reset}
                title={t.reset}
                className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
