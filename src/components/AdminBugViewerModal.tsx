import { useEffect, useState } from "react";
import {
  BookOpen,
  Bug,
  CheckCircle,
  Clock,
  Key,
  Lock,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { AzanDevSimulator } from "@/components/AzanDevSimulator";
import { openOnboardingGuide } from "@/lib/onboarding-state";

export type BugReport = {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  category: string;
  description: string;
  app_version: string | null;
  technical_info: Record<string, unknown> | null;
  attachment_url: string | null;
  status: "nouveau" | "en_cours" | "resolu";
};

const DEV_KEY = "QHEHKYUV3251XTTZgzagtfarooq";

export function AdminBugViewerModal({
  isOpen,
  onClose,
  initialTab = "bugs",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "bugs" | "azan" | "guide";
}) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"bugs" | "azan" | "guide">(
    initialTab === "guide" ? "guide" : initialTab,
  );
  const [reports, setReports] = useState<BugReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const loadReports = () => {
    try {
      const stored = localStorage.getItem("islam_noor_bug_reports") || "[]";
      const parsed: BugReport[] = JSON.parse(stored);
      setReports(parsed);
    } catch (err) {
      console.error("Error loading local bug reports:", err);
      setReports([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
      const unlocked = localStorage.getItem("islam_noor_dev_mode") === "true";
      setIsDevUnlocked(unlocked);
      if (initialTab === "azan" && unlocked) {
        setActiveTab("azan");
      } else {
        setActiveTab("bugs");
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleUnlockDev = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === DEV_KEY) {
      setIsDevUnlocked(true);
      localStorage.setItem("islam_noor_dev_mode", "true");
      setShowKeyDialog(false);
      setKeyInput("");
      appToast.success(t.devModeUnlocked || "Developer mode unlocked successfully!", {
        category: "dev",
      });
    } else {
      appToast.error(t.devKeyIncorrect || "Incorrect developer key.", {
        category: "dev",
      });
    }
  };

  const handleLockDev = () => {
    setIsDevUnlocked(false);
    setActiveTab("bugs");
    localStorage.removeItem("islam_noor_dev_mode");
    appToast.info(t.devModeDisabled || "Developer mode disabled.", {
      category: "dev",
    });
  };

  const handleUpdateStatus = (id: string, newStatus: "nouveau" | "en_cours" | "resolu") => {
    const updated = reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setReports(updated);
    localStorage.setItem("islam_noor_bug_reports", JSON.stringify(updated));
    appToast.success(t.bugStatusUpdated || "Bug report status updated!", {
      category: "dev",
    });
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem("islam_noor_bug_reports", JSON.stringify(updated));
    appToast.success(t.reportDeleted || "Report deleted.", {
      category: "dev",
    });
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "tous") return true;
    return r.status === statusFilter;
  });

  const countAll = reports.length;
  const countNouveau = reports.filter((r) => r.status === "nouveau").length;
  const countEnCours = reports.filter((r) => r.status === "en_cours").length;
  const countResolu = reports.filter((r) => r.status === "resolu").length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pb-24 sm:pb-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground transition"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>

        {/* Header & Dev Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isDevUnlocked && activeTab === "azan"
                  ? "Espace Développeur — Tests Azan"
                  : t.bugManageTitle || "Gestion des Bugs & Signalements"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isDevUnlocked
                  ? "Accès réservé au développeur avec clé de sécurité"
                  : t.bugManageSub || "Consultez et suivez l'état des dysfonctionnements"}
              </p>
            </div>
          </div>

          <div>
            {isDevUnlocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLockDev}
                className="text-xs font-bold border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1.5 rounded-xl h-8"
              >
                <Unlock className="size-3.5" />
                {t.devUnlocked || "Mode Développeur Activé"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyDialog(true)}
                className="text-xs font-bold gap-1.5 rounded-xl h-8 border-amber-500/30 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
              >
                <Lock className="size-3.5" />
                {t.devAccess || "Accès Développeur"}
              </Button>
            )}
          </div>
        </div>

        {/* Dev Key Input Dialog */}
        {showKeyDialog && (
          <form
            onSubmit={handleUnlockDev}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <Key className="size-4" />
                {t.devKeyTitle || "Saisir la clé spéciale développeur"}
              </span>
              <button
                type="button"
                onClick={() => setShowKeyDialog(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t.cancel || "Annuler"}
              </button>
            </div>

            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={t.devKeyPlaceholder || "Entrez la clé de sécurité..."}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="h-8 text-xs font-mono"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl px-4"
              >
                {t.validate || "Valider"}
              </Button>
            </div>
          </form>
        )}

        {/* Developer Navigation Tabs (Accessible only if Dev Mode Unlocked) */}
        {isDevUnlocked && (
          <div className="grid grid-cols-3 gap-1.5 bg-muted/40 p-1.5 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("bugs")}
              className={`py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === "bugs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bug className="size-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Bugs ({reports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("azan")}
              className={`py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === "azan"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="shrink-0">🕌</span>
              <span className="truncate">Tests Azan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`py-2 px-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === "guide"
                  ? "bg-emerald-500 text-slate-950 shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-3.5 text-amber-300 shrink-0" />
              <span className="truncate">Pages Présentation</span>
            </button>
          </div>
        )}

        {/* TAB 1: AZAN & REMINDER TEST SIMULATOR (Developer Only) */}
        {isDevUnlocked && activeTab === "azan" && <AzanDevSimulator />}

        {/* TAB 2: PRESENTATION PAGES SIMULATOR / PREVIEW (Developer Only) */}
        {isDevUnlocked && activeTab === "guide" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Sparkles className="size-4 text-amber-500" />
                <span>Simulateur des Pages de Présentation (Mode Développeur)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ce mode vous permet de tester et visualiser l'affichage complet des 7 pages de
                présentation interactives telles que vues par un nouvel utilisateur lors de la
                première installation.
              </p>

              <div className="p-3 rounded-xl bg-card border border-border/60 text-xs space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Navigation intégrée dans chaque page de présentation :
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1 text-[11px]">
                  <li>
                    <strong className="text-foreground">En bas à droite :</strong> Deux boutons
                    visibles sur chaque page —{" "}
                    <span className="font-bold text-foreground">Passer</span> (pour fermer ou aller
                    directement à l'accueil) et{" "}
                    <span className="font-bold text-amber-500">Suivant / Continuer</span> (pour
                    parcourir l'écran suivant).
                  </li>
                  <li>
                    <strong className="text-foreground">Démonstrations interactives :</strong> Test
                    de l'Adhan, lecture Coran/Tajwid, 3 exemples de scanner Halal, Tasbih haptique
                    et boussole Qibla.
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => {
                    onClose();
                    openOnboardingGuide();
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs h-10 rounded-xl shadow-md gap-2"
                >
                  <Sparkles className="size-4" />
                  Lancer les Pages de Présentation (Mode Développeur)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUG MANAGEMENT (Existing Features) */}
        {(!isDevUnlocked || activeTab === "bugs") && (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-muted/50 p-1 rounded-2xl border border-border/50 text-xs">
              <button
                onClick={() => setStatusFilter("tous")}
                className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  statusFilter === "tous"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{t.statusAll || "Tous"}</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {countAll}
                </Badge>
              </button>

              <button
                onClick={() => setStatusFilter("nouveau")}
                className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  statusFilter === "nouveau"
                    ? "bg-amber-500/20 text-amber-500 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{t.statusNew || "Nouveau"}</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {countNouveau}
                </Badge>
              </button>

              <button
                onClick={() => setStatusFilter("en_cours")}
                className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  statusFilter === "en_cours"
                    ? "bg-sky-500/20 text-sky-500 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{t.statusInProgress || "En cours"}</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {countEnCours}
                </Badge>
              </button>

              <button
                onClick={() => setStatusFilter("resolu")}
                className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  statusFilter === "resolu"
                    ? "bg-emerald-500/20 text-emerald-500 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{t.statusResolved || "Résolu"}</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {countResolu}
                </Badge>
              </button>
            </div>

            {/* Bug List */}
            <div className="space-y-3 pt-1 min-h-[200px]">
              {filteredReports.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <Bug className="size-8 mx-auto opacity-40" />
                  <p className="text-xs">{t.noReports || "Aucun signalement trouvé."}</p>
                </div>
              ) : (
                filteredReports.map((bug) => (
                  <div
                    key={bug.id}
                    className="p-4 rounded-2xl border border-border bg-card/60 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px]">
                          {bug.category}
                        </span>
                        <p className="text-muted-foreground text-[10px]">
                          {new Date(bug.created_at).toLocaleString("fr-FR")} —{" "}
                          {bug.user_email || "Invité"}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {bug.status === "nouveau" && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 font-bold text-[10px] flex items-center gap-1">
                            <Clock className="size-3" /> {t.statusNew || "Nouveau"}
                          </span>
                        )}
                        {bug.status === "en_cours" && (
                          <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-500 font-bold text-[10px] flex items-center gap-1">
                            <RefreshCw className="size-3 animate-spin" />{" "}
                            {t.statusInProgress || "En cours"}
                          </span>
                        )}
                        {bug.status === "resolu" && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle className="size-3" /> {t.statusResolved || "Résolu"}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                      {bug.description}
                    </p>

                    {bug.attachment_url && (
                      <div className="mt-2">
                        <a
                          href={bug.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block rounded-xl overflow-hidden border border-border"
                        >
                          <img
                            src={bug.attachment_url}
                            alt="Pièce jointe"
                            className="max-h-36 object-cover"
                          />
                        </a>
                      </div>
                    )}

                    {/* Technical Info Preview */}
                    {bug.technical_info && (
                      <div className="p-2 rounded-xl bg-muted/40 font-mono text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span>App v{bug.app_version || "1.0.0"}</span>
                        <span>Écran: {String(bug.technical_info.screen || "")}</span>
                        <span>Réseau: {String(bug.technical_info.online || "")}</span>
                      </div>
                    )}

                    {/* Developer Actions (if unlocked) */}
                    {isDevUnlocked && (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {t.editStatus || "Modifier le statut :"}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            size="xs"
                            variant={bug.status === "nouveau" ? "default" : "outline"}
                            onClick={() => handleUpdateStatus(bug.id, "nouveau")}
                            className="text-[10px] h-7 px-2"
                          >
                            {t.statusNew || "Nouveau"}
                          </Button>
                          <Button
                            size="xs"
                            variant={bug.status === "en_cours" ? "default" : "outline"}
                            onClick={() => handleUpdateStatus(bug.id, "en_cours")}
                            className="text-[10px] h-7 px-2"
                          >
                            {t.statusInProgress || "En cours"}
                          </Button>
                          <Button
                            size="xs"
                            variant={bug.status === "resolu" ? "default" : "outline"}
                            onClick={() => handleUpdateStatus(bug.id, "resolu")}
                            className="text-[10px] h-7 px-2"
                          >
                            {t.statusResolved || "Résolu"}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDeleteReport(bug.id)}
                            className="text-[10px] h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-3 mr-1" />
                            {t.deleteReport || "Supprimer"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
