import { useSettings } from "@/lib/app-settings";
import { getBgThemeById } from "@/lib/customization-themes";

export function GlobalAppBackground() {
  const { settings } = useSettings();
  const theme = getBgThemeById(settings.bgTheme);

  // Custom gallery background handling
  if (settings.bgTheme === "bg-gallery-custom" && settings.customGalleryBg?.imageUrl) {
    const { zoom, blur, brightness, contrast, overlayType, overlayOpacity } =
      settings.customGalleryBg;
    return (
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url(${settings.customGalleryBg.imageUrl})`,
            transform: `scale(${zoom / 100})`,
            filter: `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%)`,
          }}
        />
        {overlayType !== "none" && (
          <div
            className="absolute inset-0 transition-opacity"
            style={{
              backgroundColor: overlayType === "dark" ? "#000000" : "#ffffff",
              opacity: overlayOpacity / 100,
            }}
          />
        )}
      </div>
    );
  }

  // Pre-defined background themes
  const isAnimated = Boolean(theme.animClass);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-all duration-500 will-change-[background-position] ${
        theme.animClass || ""
      }`}
      style={
        isAnimated
          ? undefined
          : {
              backgroundColor: theme.bgColor,
              backgroundImage: theme.bgImage || undefined,
            }
      }
    >
      {/* Decorative ambient light for premium/RGB themes */}
      {theme.category === "rgb" && (
        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />
      )}
      {theme.category === "premium" && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
      )}
    </div>
  );
}
