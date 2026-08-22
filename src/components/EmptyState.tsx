import React from "react";
import { ImageOff, Search, Upload, Lock } from "lucide-react";
import { AdminAuthState } from "../types";

interface EmptyStateProps {
  isSearch: boolean;
  adminAuth: AdminAuthState;
  onResetSearch: () => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearch,
  adminAuth,
  onResetSearch,
  onOpenUpload,
  onOpenSettings,
}) => {
  return (
    <div className="py-20 px-4 text-center flex flex-col items-center justify-center text-stone-300">
      <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl text-amber-400 mb-4 shadow-xl">
        {isSearch ? <Search className="w-8 h-8" /> : <ImageOff className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-bold text-stone-100 mb-1">
        {isSearch ? "Keine passenden Fotos gefunden" : "Noch keine Fotos in der Galerie"}
      </h3>
      <p className="text-xs text-stone-400 max-w-sm mb-6">
        {isSearch
          ? "Versuche es mit einem anderen Suchbegriff oder setze die Filter zurück."
          : "Die Galerie ist aktuell leer. Als Admin kannst du neue Bilder in bester Auflösung hochladen."}
      </p>

      {isSearch ? (
        <button
          type="button"
          onClick={onResetSearch}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
        >
          Suchfilter zurücksetzen
        </button>
      ) : adminAuth.isUnlocked ? (
        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Erste Fotos hochladen</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Admin-Code eingeben für Upload</span>
        </button>
      )}
    </div>
  );
};
