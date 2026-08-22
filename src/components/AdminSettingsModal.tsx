import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  X,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { AdminAuthState } from "../types";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminAuth: AdminAuthState;
  onVerifyCode: (code: string) => Promise<boolean>;
  onLogout: () => void;
  onOpenUpload: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  adminAuth,
  onVerifyCode,
  onLogout,
  onOpenUpload,
}) => {
  const [inputCode, setInputCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg("Bitte gib den Admin-Code ein.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const success = await onVerifyCode(inputCode.trim());
    setIsSubmitting(false);

    if (success) {
      setSuccessMsg("Erfolgreich autorisiert! Du hast jetzt Admin-Rechte zum Hochladen und Löschen.");
      setInputCode("");
    } else {
      setErrorMsg("Ungültiger Code. Zugriff verweigert.");
    }
  };

  const handleOpenUploadAndClose = () => {
    onClose();
    onOpenUpload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="admin-settings-modal"
        className="relative w-full max-w-md bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100 p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`p-3 rounded-xl border ${
              adminAuth.isUnlocked
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-400"
                : "bg-amber-950/60 border-amber-500/30 text-amber-400"
            }`}
          >
            {adminAuth.isUnlocked ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-100">
              {adminAuth.isUnlocked ? "Admin-Bereich Aktiv" : "Admin-Zugang freischalten"}
            </h2>
            <p className="text-xs text-stone-400">
              {adminAuth.isUnlocked
                ? "Du bist autorisiert zum Hochladen und Löschen von Fotos."
                : "Gib deinen persönlichen Code ein, um Upload & Löschfunktionen freizugeben."}
            </p>
          </div>
        </div>

        {/* Content based on Auth status */}
        {adminAuth.isUnlocked ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-200">
                  Status: Titus Admin freigeschaltet
                </p>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  Alle Formate werden in höchster Originalauflösung gespeichert. Besucher können nur ansehen und downloaden.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleOpenUploadAndClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-950/50 transition-all text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Neue Fotos hochladen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setSuccessMsg(null);
                  setErrorMsg(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60 border border-stone-700 text-stone-300 font-medium rounded-xl transition-all text-xs"
              >
                <Lock className="w-4 h-4" />
                <span>Admin-Modus beenden (Abmelden)</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-code-input"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2"
              >
                Sicherheits-Code
              </label>
              <div className="relative">
                <input
                  id="admin-code-input"
                  type={showCode ? "text" : "password"}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Code eingeben..."
                  autoFocus
                  className="w-full px-4 py-2.5 bg-stone-800/90 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                  title={showCode ? "Code verbergen" : "Code anzeigen"}
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-semibold rounded-xl transition-all shadow-md text-sm"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin">⟳</span>
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span>Code bestätigen & freischalten</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-500 text-center pt-1 border-t border-stone-800/60">
              Nur Titus mit dem autorisierten Code kann Bilder verwalten.
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
