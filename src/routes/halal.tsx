import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Barcode, Folder, Images, Loader2, Pencil, ScanLine, Search, Star, X } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { PermissionBanner } from "@/components/PermissionBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";
import { getWidgetThemeById } from "@/lib/customization-themes";
import { getHalalGuide } from "@/lib/halal-guide";
import { fetchByBarcode, searchByName, type ProductResult } from "@/lib/halal";
import { analyzeIngredientsPhoto } from "@/lib/ingredients.functions";
import { HalalIngredientsHint } from "@/components/AppFeatureHints";

export const Route = createFileRoute("/halal")({
  head: () => ({
    meta: [
      { title: "Scanner Halal / Haram — Islam-Noor" },
      {
        name: "description",
        content:
          "Scannez un code-barres ou cherchez un produit pour obtenir un verdict halal, haram ou douteux avec ses sources.",
      },
      { property: "og:title", content: "Scanner Halal / Haram — Islam-Noor" },
      { property: "og:description", content: "Verdict à trois niveaux avec sources affichées." },
    ],
  }),
  component: HalalPage,
});

type BarcodeDetectorLike = {
  detect: (src: CanvasImageSource | Blob) => Promise<{ rawValue: string }[]>;
};

type ActivePanel = "scanner" | "manual" | "gallery" | "saved" | null;

function HalalPage() {
  const { t, locale } = useI18n();
  const { settings, update } = useSettings();
  const activeWidgetTheme = getWidgetThemeById(settings.widgetTheme);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [manualInputCode, setManualInputCode] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [camDenied, setCamDenied] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const ingredientsRef = useRef<HTMLInputElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScan = useCallback(() => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
        html5QrCodeRef.current.clear();
      } catch {
        /* ignore cleanup */
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScan = useCallback(() => {
    setCamDenied(false);
    setScanning(true);
  }, []);

  const togglePanel = useCallback(
    (panel: ActivePanel) => {
      if (activePanel === panel) {
        if (activePanel === "scanner") stopScan();
        setShowSaved(false);
        setActivePanel(null);
      } else {
        if (activePanel === "scanner") stopScan();
        setActivePanel(panel);

        if (panel === "scanner") {
          setShowSaved(false);
          startScan();
        } else if (panel === "saved") {
          setShowSaved(true);
        } else {
          setShowSaved(false);
        }
      }
    },
    [activePanel, startScan, stopScan],
  );

  // Smooth scroll to guide section if requested from home screen
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (
      url.searchParams.get("guide") === "true" ||
      url.hash === "#guide-section" ||
      window.location.hash === "#guide-section"
    ) {
      const timer = setTimeout(() => {
        const el = document.getElementById("guide-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.add("ring-2", "ring-emerald-400", "transition-all", "duration-500");
          setTimeout(() => el.classList.remove("ring-2", "ring-emerald-400"), 2200);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  const searchReqIdRef = useRef(0);

  const executeSearch = useCallback(
    async (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setNotFound(false);
        setBusy(false);
        return;
      }

      const currentReqId = ++searchReqIdRef.current;
      setBusy(true);

      try {
        const r = await searchByName(trimmed);
        if (currentReqId === searchReqIdRef.current) {
          setResults(r);
          setShowSaved(false);
          setNotFound(r.length === 0);
        }
      } catch {
        if (currentReqId === searchReqIdRef.current) {
          appToast.error(t.searchUnavailable || "Search unavailable", { category: "scanner" });
        }
      } finally {
        if (currentReqId === searchReqIdRef.current) {
          setBusy(false);
        }
      }
    },
    [t],
  );

  // Live search as user types with 350ms debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setNotFound(false);
      setBusy(false);
      return;
    }

    setBusy(true);

    const timer = setTimeout(() => {
      void executeSearch(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, executeSearch]);

  const runName = () => {
    void executeSearch(query);
  };

  const runCode = useCallback(
    async (code: string) => {
      setBusy(true);
      try {
        const r = await fetchByBarcode(code);
        setResults(r ? [r] : []);
        setShowSaved(false);
        setNotFound(!r);
      } catch {
        appToast.error(t.searchUnavailable || "Search unavailable", { category: "scanner" });
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  /* Camera initialization & continuous detection loop using Html5Qrcode */
  useEffect(() => {
    if (activePanel !== "scanner" || !scanning) return;
    let isCancelled = false;

    const initCamera = async () => {
      const el = document.getElementById("halal-barcode-reader");
      if (!el) return;

      try {
        const qr = new Html5Qrcode("halal-barcode-reader");
        html5QrCodeRef.current = qr;

        await qr.start(
          { facingMode: "environment" },
          {
            fps: 25,
            qrbox: (viewWidth, viewHeight) => {
              const w = Math.min(viewWidth * 0.9, 360);
              const h = Math.min(viewHeight * 0.7, 260);
              return { width: Math.floor(w), height: Math.floor(h) };
            },
            aspectRatio: 1.777778,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.ITF,
              Html5QrcodeSupportedFormats.CODABAR,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          },
          (decodedText) => {
            if (isCancelled) return;
            if (decodedText && decodedText.trim().length >= 4) {
              isCancelled = true;
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate([40, 30, 40]);
                } catch {
                  /* ignore */
                }
              }
              const barcodeMsg = (t.barcodeDetected || "Barcode detected: {code}").replace(
                "{code}",
                decodedText.trim(),
              );
              appToast.success(barcodeMsg, { category: "scanner" });
              stopScan();
              togglePanel(null);
              void runCode(decodedText.trim());
            }
          },
          () => {
            /* frame tick error, normal */
          },
        );
      } catch (err: unknown) {
        console.warn("Camera barcode scanner error:", err);
        const errStr = String(err).toLowerCase();
        if (
          errStr.includes("notallowederror") ||
          errStr.includes("permission") ||
          errStr.includes("denied")
        ) {
          setCamDenied(true);
        } else {
          appToast.error(t.cannotOpenCamera || "Cannot open camera", { category: "scanner" });
        }
        setScanning(false);
      }
    };

    const timer = setTimeout(() => {
      void initCamera();
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current.clear();
        } catch {
          /* ignore */
        }
        html5QrCodeRef.current = null;
      }
    };
  }, [activePanel, scanning, runCode, stopScan, togglePanel]);

  const fromGallery = async (file: File) => {
    setBusy(true);
    try {
      let detectedCode: string | null = null;

      try {
        const qr = new Html5Qrcode("halal-barcode-reader-hidden");
        const result = await qr.scanFile(file, true);
        if (result) {
          detectedCode = result;
        }
      } catch (e) {
        console.log("Html5Qrcode scanFile failed:", e);
      }

      if (!detectedCode && "BarcodeDetector" in window) {
        try {
          const detector = new (
            window as unknown as { BarcodeDetector: new (o?: unknown) => BarcodeDetectorLike }
          ).BarcodeDetector();
          const bitmap = await createImageBitmap(file);
          const codes = await detector.detect(bitmap);
          if (codes && codes.length > 0 && codes[0].rawValue) {
            detectedCode = codes[0].rawValue;
          }
        } catch {
          /* ignore */
        }
      }

      if (detectedCode) {
        const msg = (t.barcodeExtracted || "Barcode extracted from photo: {code}").replace(
          "{code}",
          detectedCode,
        );
        appToast.success(msg, { category: "scanner" });
        void runCode(detectedCode);
      } else {
        setResults([]);
        setNotFound(true);
        appToast.error(
          t.noBarcodeFoundInPhoto || "No readable barcode found in this photo. Try manual input.",
          { category: "scanner" },
        );
      }
    } catch {
      appToast.error(t.imageAnalysisError || "Image analysis error", { category: "scanner" });
    } finally {
      setBusy(false);
    }
  };

  const analyseIngredients = async (file: File) => {
    setAnalysing(true);
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });
      const r = await analyzeIngredientsPhoto({ data: { image, lang: "fr" } });
      setResults([
        {
          code: `photo-${Date.now()}`,
          name: r.name || t.photoIngredients,
          brand: "",
          verdict: r.verdict,
          reasons: r.reasons,
        } as ProductResult,
      ]);
      setNotFound(false);
      setShowSaved(false);
    } catch {
      appToast.error(t.analysisUnavailable || "Analysis unavailable", { category: "scanner" });
    } finally {
      setAnalysing(false);
    }
  };

  const list = showSaved ? (settings.savedProducts as ProductResult[]) : results;

  return (
    <div className="space-y-5 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        data-widget-card
        className={`widget relative rounded-3xl p-4 sm:p-5 shadow-md border border-white/20 transition-all duration-500 ease-in-out ${
          activeWidgetTheme.animClass || ""
        }`}
        style={{
          background:
            activeWidgetTheme.gradient ||
            `linear-gradient(135deg, ${activeWidgetTheme.from}, ${activeWidgetTheme.to})`,
          color: activeWidgetTheme.fg,
        }}
      >
        <h1
          className="text-2xl font-extrabold tracking-tight drop-shadow-xs"
          style={{ color: activeWidgetTheme.fg }}
        >
          {t.halalTitle}
        </h1>
        <p
          className="text-xs font-medium opacity-90 drop-shadow-2xs mt-0.5"
          style={{ color: activeWidgetTheme.fg }}
        >
          {t.halalSub}
        </p>
      </div>

      {/* Search Input Bar - Neutral White */}
      <div
        data-widget-card
        className="glass flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800"
      >
        <Search className="ml-1 size-4 text-muted-foreground" />
        <Input
          value={query}
          maxLength={60}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runName()}
          placeholder={t.searchPlaceholder}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button variant="widget" size="icon-lg" onClick={runName} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </div>

      {/* Action Widgets Container - Neutral White (Does NOT inherit Halal Title theme color) */}
      <div
        data-widget-card
        className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm text-slate-900 dark:text-slate-100 overflow-hidden"
      >
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <ActionTile
            label={t.scan}
            active={activePanel === "scanner"}
            onClick={() => togglePanel("scanner")}
            icon={
              <span className="relative grid place-items-center">
                <ScanLine className="absolute size-9 opacity-45" strokeWidth={1.6} />
                <Barcode className="size-6" strokeWidth={2.2} />
              </span>
            }
          />
          <ActionTile
            label={t.manual}
            active={activePanel === "manual"}
            onClick={() => togglePanel("manual")}
            icon={
              <span className="relative grid place-items-center">
                <Barcode className="size-7" strokeWidth={1.9} />
                <Pencil className="absolute -right-2 -bottom-2 size-4" strokeWidth={2.4} />
              </span>
            }
          />
          <ActionTile
            label={t.gallery}
            active={activePanel === "gallery"}
            onClick={() => togglePanel("gallery")}
            icon={<Images className="size-7" strokeWidth={1.9} />}
          />
          <ActionTile
            label={t.savedProducts}
            active={activePanel === "saved"}
            onClick={() => togglePanel("saved")}
            icon={
              <span className="relative grid place-items-center">
                <Folder className="size-7" strokeWidth={1.9} />
                <Star className="absolute mt-1 size-3 fill-current" strokeWidth={0} />
              </span>
            }
          />
        </div>
      </div>

      {/* Feature Guide Hint: Photo des ingrédients (Halal / Haram) */}
      <HalalIngredientsHint onTakePhoto={() => ingredientsRef.current?.click()} />

      {/* Accordion Content Panel (Only one panel open at a time) */}
      {activePanel && (
        <section className="glass p-4 rounded-3xl border border-emerald-500/30 shadow-md animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              {activePanel === "scanner" && t.panelScanner}
              {activePanel === "manual" && t.panelManual}
              {activePanel === "gallery" && t.panelGallery}
              {activePanel === "saved" && t.panelSaved}
            </h3>
            <button
              type="button"
              onClick={() => togglePanel(null)}
              aria-label={t.close || "Fermer"}
              className="grid size-7 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition active:scale-90 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Hidden element for gallery file scanning */}
          <div id="halal-barcode-reader-hidden" className="hidden" />

          {/* 1. Scanner */}
          {activePanel === "scanner" && (
            <div className="space-y-3">
              {camDenied ? (
                <PermissionBanner
                  side="left"
                  message={t.cameraDenied}
                  actionLabel={t.allow}
                  onDismiss={() => setCamDenied(false)}
                  onRetry={() => {
                    setCamDenied(false);
                    startScan();
                  }}
                />
              ) : (
                <div className="overflow-hidden rounded-2xl bg-black relative aspect-video min-h-[220px] flex items-center justify-center border border-emerald-500/30 shadow-inner">
                  <div
                    id="halal-barcode-reader"
                    className="w-full h-full relative overflow-hidden rounded-2xl"
                  />
                  <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-2xl pointer-events-none flex items-center justify-center z-10">
                    <div className="w-48 h-28 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-500/10 animate-pulse relative flex items-center justify-center">
                      <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground text-center">{t.scannerHint}</p>
            </div>
          )}

          {/* 2. Saisir manuellement */}
          {activePanel === "manual" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t.manualHint}</p>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={14}
                  value={manualInputCode}
                  onChange={(e) => setManualInputCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualInputCode.length >= 6) {
                      void runCode(manualInputCode);
                      togglePanel(null);
                    }
                  }}
                  placeholder="3017620422003"
                  className="font-mono text-sm"
                />
                <Button
                  variant="widget"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shrink-0 cursor-pointer"
                  onClick={() => {
                    if (manualInputCode.length < 6)
                      return appToast.error(t.codeTooShort || "Barcode must be at least 6 digits", {
                        category: "scanner",
                      });
                    void runCode(manualInputCode);
                    togglePanel(null);
                  }}
                >
                  <Search className="size-3.5 mr-1" />
                  {t.searchBtn}
                </Button>
              </div>
            </div>
          )}

          {/* 3. Galerie */}
          {activePanel === "gallery" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">{t.galleryHint}</p>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/15 cursor-pointer transition text-center">
                  <Images className="size-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-foreground">{t.barcodePhoto}</span>
                  <span className="text-[10px] text-muted-foreground">{t.galleryImage}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        void fromGallery(e.target.files[0]);
                        togglePanel(null);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  disabled={analysing}
                  onClick={() => ingredientsRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-dashed border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/15 cursor-pointer transition text-center"
                >
                  {analysing ? (
                    <Loader2 className="size-6 text-sky-600 animate-spin mb-1" />
                  ) : (
                    <Pencil className="size-6 text-sky-600 dark:text-sky-400 mb-1" />
                  )}
                  <span className="text-xs font-bold text-foreground">{t.photoIngredients}</span>
                  <span className="text-[10px] text-muted-foreground">{t.ingredientsAI}</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Produits Sauvegardés */}
          {activePanel === "saved" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>{t.favoritesList}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {settings.savedProducts.length} {t.itemsSaved}
                </span>
              </div>
              {!settings.savedProducts.length && (
                <p className="text-xs text-center text-muted-foreground py-4 italic">
                  {t.noSavedProducts}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Hidden capture input used by the ingredient fallback flow */}
      <input
        ref={ingredientsRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && analyseIngredients(e.target.files[0])}
      />

      {notFound && !showSaved && (
        <section className="widget anim-pop p-4">
          <p className="text-sm font-semibold">{t.notFoundIngredients}</p>
          <Button
            variant="glass"
            size="xl"
            className="mt-3 w-full"
            disabled={analysing}
            onClick={() => ingredientsRef.current?.click()}
          >
            {analysing ? <Loader2 className="size-4 animate-spin" /> : null}
            {analysing ? t.analysing : t.photoIngredients}
          </Button>
        </section>
      )}

      <div className="space-y-3">
        {list.map((p) => (
          <article key={p.code + p.name} className="glass p-4">
            <div className="flex gap-3">
              {p.image && <img src={p.image} alt="" className="size-16 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold">{p.name}</h2>
                <p className="truncate text-[11px] text-muted-foreground">{p.brand}</p>
                <VerdictBadge verdict={p.verdict} />
              </div>
            </div>
            {"reasons" in p && (
              <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                {p.reasons?.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">
              {t.source}: Open Food Facts {p.certified ? "· certification halal déclarée" : ""} —{" "}
              {t.disclaimer}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                variant="soft"
                size="sm"
                onClick={() => {
                  const exists = settings.savedProducts.some((s) => s.code === p.code);
                  update({
                    savedProducts: exists
                      ? settings.savedProducts.filter((s) => s.code !== p.code)
                      : [
                          ...settings.savedProducts,
                          {
                            code: p.code,
                            name: p.name,
                            brand: p.brand,
                            verdict: p.verdict,
                            image: p.image,
                          },
                        ],
                  });
                  appToast.success(
                    exists ? t.removedFromFavorites || t.remove : t.addedToFavorites || t.saved,
                    { category: "scanner" },
                  );
                }}
              >
                {settings.savedProducts.some((s) => s.code === p.code) ? t.remove : t.save}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  appToast.success(
                    t.reportSentThanks || "Report submitted, thank you for your help!",
                    { category: "scanner" },
                  )
                }
              >
                {t.report}
              </Button>
            </div>
          </article>
        ))}
      </div>

      <section id="guide-section" className="widget p-4">
        <h2 className="text-sm font-bold">{t.howTitle}</h2>
        <div className="mt-3 space-y-3">
          {getHalalGuide(locale).map((b) => (
            <div key={b.title}>
              <h3 className="text-xs font-bold">{b.title}</h3>
              <ul className="mt-1 space-y-0.5 text-[11px] opacity-90">
                {b.lines.map((l) => (
                  <li key={l}>• {l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: ProductResult["verdict"] }) {
  const { t } = useI18n();
  const map = {
    halal: { label: t.verdictHalal, color: "var(--halal)" },
    haram: { label: t.verdictHaram, color: "var(--haram)" },
    doubtful: { label: t.verdictDoubt, color: "var(--doubt)" },
    unknown: { label: t.verdictUnknown, color: "var(--muted-foreground)" },
  }[verdict];

  return (
    <span
      className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
      style={{ backgroundColor: map.color }}
    >
      {map.label}
    </span>
  );
}

/** Big rounded action tile with a round pictogram badge on top. */
function ActionTile({
  label,
  icon,
  active = false,
  onClick,
  as = "button",
  children,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  as?: "button" | "label";
  children?: React.ReactNode;
}) {
  const baseCls =
    "flex cursor-pointer flex-col items-center justify-start gap-2.5 rounded-2xl px-3 py-3.5 text-center transition-all duration-300 active:scale-[0.98]";

  const colorCls = active
    ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600"
    : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80";

  const badgeCls = active
    ? "bg-white/20 text-white"
    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs border border-slate-200/60 dark:border-slate-600";

  const cls = `${baseCls} ${colorCls}`;

  const inner = (
    <>
      <span className={`grid size-14 place-items-center rounded-full ${badgeCls}`}>{icon}</span>
      <span className="text-[12.5px] leading-tight font-semibold">{label}</span>
      {children}
    </>
  );

  if (as === "label") {
    return (
      <label data-widget-card className={cls}>
        {inner}
      </label>
    );
  }

  return (
    <button data-widget-card type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
