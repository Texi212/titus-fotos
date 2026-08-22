import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Photo } from "../types";
import { formatBytes } from "../utils/formatters";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: Photo | null;
  onConfirmDelete: (photo: Photo) => void;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  photo,
  onConfirmDelete,
  isDeleting,
}) => {
  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="delete-confirm-modal"
        className="relative w-full max-w-md bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100 p-6"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-100">Foto wirklich löschen?</h2>
            <p className="text-xs text-stone-400">Admin-Aktion kann nicht rückgängig gemacht werden.</p>
          </div>
        </div>

        {/* Photo preview */}
        <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl flex items-center gap-3 mb-5">
          <img
            src={photo.url}
            alt={photo.title}
            className="w-14 h-14 rounded-lg object-cover bg-stone-900 border border-stone-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-100 truncate">{photo.title}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {photo.format} • {photo.width} × {photo.height} px • {formatBytes(photo.size)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-xs transition-colors"
          >
            Abbrechen
          </button>
          <button
            id="confirm-delete-button"
            type="button"
            disabled={isDeleting}
            onClick={() => onConfirmDelete(photo)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-950/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Wird gelöscht..." : "Ja, endgültig löschen"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
