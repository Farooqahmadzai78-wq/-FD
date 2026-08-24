import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import {
  SOLID_BG_THEMES,
  GRADIENT_BG_THEMES,
  RGB_BG_THEMES,
  getThemeName,
  getThemeDesc,
  type BgTheme,
} from "@/lib/customization-themes";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Palette,
  Layers,
  Image as ImageIcon,
  Sliders,
  Upload,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { showCustomizationToast } from "@/lib/customization-toast";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export function BackgroundCustomization({ onBack }: { onBack: () => void }) {
  const { settings, update } = useSettings();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Custom gallery state
  const [galleryImage, setGalleryImage] = useState<string | null>(
    settings.customGalleryBg?.imageUrl || null,
  );
  const [zoom, setZoom] = useState(settings.customGalleryBg?.zoom ?? 100);
  const [blur, setBlur] = useState(settings.customGalleryBg?.blur ?? 0);
  const [brightness, setBrightness] = useState(settings.customGalleryBg?.brightness ?? 100);
  const [contrast, setContrast] = useState(settings.customGalleryBg?.contrast ?? 100);
  const [overlayType, setOverlayType] = useState<"dark" | "light" | "none">(
    settings.customGalleryBg?.overlayType ?? "dark",
  );
  const [overlayOpacity, setOverlayOpacity] = useState(
    settings.customGalleryBg?.overlayOpacity ?? 30,
  );

  const handleSelectTheme = (theme: BgTheme) => {
    update({ bgTheme: theme.id });
    const name = getThemeName(t, theme);
    showCustomizationToast(t("bgApplied").replace("{name}", name), {
      category: "background",
      accentColor:
        theme.category === "rgb" ? "purple" : theme.category === "gradient" ? "sky" : "amber",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        appToast.error(t("imageSizeError") || "Image size must not exceed 10 MB", {
          category: "background",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setGalleryImage(result);
        applyGalleryBackground(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyGalleryBackground = (imgUrl: string = galleryImage || "") => {
    if (!imgUrl)
      return appToast.error(t("selectImageFirst") || "Please select an image first", {
        category: "background",
      });
    const customConfig = {
      imageUrl: imgUrl,
      zoom,
      blur,
      brightness,
      contrast,
      overlayType,
      overlayOpacity,
    };
    update({
      bgTheme: "bg-gallery-custom",
      customGalleryBg: customConfig,
    });
    showCustomizationToast(t("galleryBgApplied"), {
      category: "gallery",
      accentColor: "emerald",
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Container */}
      <div
        data-widget-card
        className="glass p-4 rounded-3xl border border-border/80 shadow-sm flex items-center gap-3"
      >
        <button
          onClick={onBack}
          className="grid size-10 place-items-center rounded-2xl bg-secondary/80 text-foreground transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            {t("bgCustomizationTitle")}
          </h1>
          <p className="text-xs text-muted-foreground">{t("bgCustomizationSub")}</p>
        </div>
      </div>

      {/* Categories in Master White Cards */}
      <div className="space-y-6 pt-2">
        {/* Catégorie 1: Couleurs Unies */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Palette className="size-4 text-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
              {t("solidColors")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {SOLID_BG_THEMES.map((theme) => (
              <BgThemeCard
                key={theme.id}
                theme={theme}
                isActive={settings.bgTheme === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* Catégorie 2: Dégradés Multicolores */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Layers className="size-4 text-sky-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
              {t("gradientsAndMulticolors")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {GRADIENT_BG_THEMES.map((theme) => (
              <BgThemeCard
                key={theme.id}
                theme={theme}
                isActive={settings.bgTheme === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* Catégorie 3: RGB / Couleurs Dynamiques */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="size-4 text-purple-500" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
              {t("rgbDynamicColors")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {RGB_BG_THEMES.map((theme) => (
              <BgThemeCard
                key={theme.id}
                theme={theme}
                isActive={settings.bgTheme === theme.id}
                onSelect={() => handleSelectTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* Catégorie Galerie */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-emerald-500" />
              <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 dark:text-slate-100">
                {t("customGallery")}
              </h2>
            </div>
            {settings.bgTheme === "bg-gallery-custom" && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Check className="size-3" />
                {t("active")}
              </span>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            {/* Choose file button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-2xl gap-2 font-bold cursor-pointer"
              >
                <Upload className="size-4" />
                {t("chooseImageFromPhone")}
              </Button>
            </div>

            {/* Adjustments Controls */}
            {galleryImage && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Sliders className="size-3.5" />
                  <span>{t("imageAdjustments")}</span>
                </div>

                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{t("zoom")}</span>
                    <span className="text-muted-foreground">{zoom}%</span>
                  </div>
                  <Slider
                    value={[zoom]}
                    min={100}
                    max={200}
                    step={1}
                    onValueChange={(val) => setZoom(val[0])}
                  />
                </div>

                {/* Flou */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{t("blur")}</span>
                    <span className="text-muted-foreground">{blur}px</span>
                  </div>
                  <Slider
                    value={[blur]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(val) => setBlur(val[0])}
                  />
                </div>

                {/* Luminosité */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{t("brightness")}</span>
                    <span className="text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider
                    value={[brightness]}
                    min={50}
                    max={150}
                    step={1}
                    onValueChange={(val) => setBrightness(val[0])}
                  />
                </div>

                {/* Contraste */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{t("contrast")}</span>
                    <span className="text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider
                    value={[contrast]}
                    min={50}
                    max={150}
                    step={1}
                    onValueChange={(val) => setContrast(val[0])}
                  />
                </div>

                {/* Voile (Dark or Light) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{t("readabilityOverlay")}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setOverlayType("dark")}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                          overlayType === "dark"
                            ? "bg-black text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t("dark")}
                      </button>
                      <button
                        onClick={() => setOverlayType("light")}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                          overlayType === "light"
                            ? "bg-white text-black border"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t("light")}
                      </button>
                      <button
                        onClick={() => setOverlayType("none")}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                          overlayType === "none"
                            ? "bg-amber-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t("none")}
                      </button>
                    </div>
                  </div>

                  {overlayType !== "none" && (
                    <Slider
                      value={[overlayOpacity]}
                      min={0}
                      max={80}
                      step={5}
                      onValueChange={(val) => setOverlayOpacity(val[0])}
                    />
                  )}
                </div>

                <Button
                  variant="widget"
                  size="xl"
                  onClick={() => applyGalleryBackground()}
                  className="w-full mt-2 font-extrabold gap-2 cursor-pointer"
                >
                  <Check className="size-4" />
                  {t("applyBgImageBtn")}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function BgThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: BgTheme;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { t } = useI18n();
  const themeName = getThemeName(t, theme);
  const themeDesc = getThemeDesc(t, theme);

  return (
    <button
      onClick={onSelect}
      className={`group relative w-full flex flex-col rounded-2xl p-2 sm:p-2.5 transition-all duration-200 text-left cursor-pointer ${
        isActive
          ? "bg-secondary ring-2 ring-amber-500 shadow-md scale-[1.02]"
          : "bg-card/70 hover:bg-secondary/60 border border-border/50"
      }`}
    >
      {/* Active Badge */}
      {isActive && (
        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex items-center gap-0.5 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
          <Check className="size-2 sm:size-2.5" />
          {t("active")}
        </span>
      )}

      {/* Mini Preview Box */}
      <div
        className={`w-full h-16 sm:h-20 rounded-xl overflow-hidden shadow-inner flex flex-col justify-end p-1.5 sm:p-2 border border-white/20 transition ${
          theme.animClass || ""
        }`}
        style={{
          backgroundColor: theme.bgColor,
          backgroundImage: theme.bgImage || undefined,
        }}
      >
        <div className="rounded-lg bg-black/30 backdrop-blur-xs p-1 text-center text-white">
          <p className="text-[9px] font-extrabold truncate">{themeName}</p>
        </div>
      </div>

      {/* Title */}
      <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-bold truncate text-foreground">
        {themeName}
      </p>
      {themeDesc && (
        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate opacity-80">
          {themeDesc}
        </p>
      )}
    </button>
  );
}
