import { useState } from "react";
import {
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Send,
  Smartphone,
  X,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

const BUG_CATEGORIES = [
  { id: "affichage", key: "bugCatDisplay", fallback: "🎨 Affichage / Interface" },
  { id: "audio_adhan", key: "bugCatAudio", fallback: "🔊 Audio, Adhan & Récitation" },
  { id: "priere_horaires", key: "bugCatPrayer", fallback: "🕌 Horaires de prière & Qibla" },
  { id: "scanner_halal", key: "bugCatScanner", fallback: "📷 Scanner / Halal" },
  { id: "autre", key: "bugCatOther", fallback: "⚙️ Autre dysfonctionnement" },
];

export function BugReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [category, setCategory] = useState("affichage");
  const [description, setDescription] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const appVersion = "1.0.0";
  const technicalInfo = {
    appVersion,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Inconnu",
    screen:
      typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "Inconnu",
    language: typeof navigator !== "undefined" ? navigator.language : "fr",
    path: typeof window !== "undefined" ? window.location.pathname : "/",
    online:
      typeof navigator !== "undefined" ? (navigator.onLine ? "En ligne" : "Hors ligne") : "Inconnu",
    timestamp: new Date().toISOString(),
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      appToast.error(t.fileSizeMax5Mb || "File size must not exceed 5 MB.", { category: "dev" });
      return;
    }

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < 10) {
      appToast.error(
        t.descMin10Chars || "Please provide a more detailed description (at least 10 characters).",
        { category: "dev" },
      );
      return;
    }

    setSubmitting(true);

    try {
      const existingStr = localStorage.getItem("islam_noor_bug_reports") || "[]";
      const existingReports = JSON.parse(existingStr);

      const newReport = {
        id: `bug-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
        user_id: null,
        user_email: "Invité",
        category,
        description: description.trim(),
        app_version: appVersion,
        technical_info: technicalInfo,
        attachment_url: filePreview,
        status: "nouveau" as const,
      };

      const updated = [newReport, ...existingReports];
      localStorage.setItem("islam_noor_bug_reports", JSON.stringify(updated));

      setSubmitting(false);
      setSubmitted(true);
      appToast.success(
        t.reportSentSuccess || "Report submitted successfully! Thank you for your help.",
        { category: "dev" },
      );
    } catch (err: unknown) {
      setSubmitting(false);
      console.error("[BugReport] Submission error:", err);
      appToast.error(t.reportSaveError || "An error occurred while saving the report.", {
        category: "dev",
      });
    }
  };

  const handleReset = () => {
    setDescription("");
    setFilePreview(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass bg-card/95 border border-border rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 pb-3 border-b border-border/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Bug className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t.reportBugTitle || "Signaler un bug"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t.reportBugSub || "Aidez-nous à améliorer Islam-Noor"}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground transition"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="size-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-10 animate-in zoom-in duration-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {t.bugSubmittedTitle || "Signalement transmis !"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {t.bugSubmittedSub ||
                  "Votre message a été enregistré localement. Vous pouvez le consulter dans l'onglet « Consulter les signalements »."}
              </p>
            </div>
            <Button variant="default" className="mt-2" onClick={handleReset}>
              {t.close || "Fermer"}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0 overflow-hidden text-left"
          >
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/50 text-xs flex items-center justify-between">
                <span className="text-muted-foreground">{t.sentAs || "Envoyé en tant que :"}</span>
                <span className="font-bold text-amber-500">{t.guest || "Invité"}</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  {t.bugCatLabel || "Catégorie du dysfonctionnement *"}
                </Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {BUG_CATEGORIES.map((cat) => {
                    const labelText = (t as Record<string, string>)[cat.key] || cat.fallback;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                          category === cat.id
                            ? "border-amber-500 bg-amber-500/10 text-amber-500"
                            : "border-border bg-background/50 hover:bg-accent text-foreground"
                        }`}
                      >
                        <span>{labelText}</span>
                        {category === cat.id && (
                          <div className="size-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  {t.bugDescLabel || "Description détaillée *"}
                </Label>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    t.bugDescPlaceholder ||
                    "Décrivez ce qui s'est passé, les étapes pour reproduire le bug..."
                  }
                  className="text-xs resize-none rounded-2xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  {t.bugScreenshot || "Capture d'écran (optionnel)"}
                </Label>
                {filePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border group">
                    <img src={filePreview} alt="Aperçu" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setFilePreview(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-border hover:border-amber-500/50 bg-muted/20 cursor-pointer transition">
                    <ImageIcon className="size-6 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {t.bugAddImage || "Ajouter une image (max 5 Mo)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Collapsible Tech Info */}
              <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="size-3.5" />
                    {t.bugTechInfo || "Informations techniques incluses"}
                  </span>
                  {showTechDetails ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>

                {showTechDetails && (
                  <div className="p-3 pt-0 border-t border-border/50 text-[10px] space-y-1 font-mono text-muted-foreground">
                    <p>App: Islam-Noor v{technicalInfo.appVersion}</p>
                    <p>Écran: {technicalInfo.screen}</p>
                    <p>Langue: {technicalInfo.language}</p>
                    <p>Chemin: {technicalInfo.path}</p>
                    <p>Réseau: {technicalInfo.online}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-card/95 flex gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="flex-1 text-xs font-bold"
              >
                {t.cancel || "Annuler"}
              </Button>
              <Button
                type="submit"
                disabled={submitting || description.trim().length < 10}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md"
              >
                <Send className="size-3.5" />
                {t.bugSubmit || "Envoyer le signalement"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
