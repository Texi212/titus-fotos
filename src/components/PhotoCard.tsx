import React, { useState } from "react";
import {
  Download,
  Trash2,
  Maximize2,
  Eye,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { Photo, GalleryLayout, AdminAuthState } from "../types";
import { formatBytes, formatResolution, formatDate, downloadPhotoFile } from "../utils/formatters";

interface PhotoCardProps {
  photo: Photo;
  layout: GalleryLayout;
  adminAuth: AdminAuthState;
  onOpenLightbox: (photo: Photo) => void;
  onRequestDelete: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  layout,
  adminAuth,
  onOpenLightbox,
  onRequestDelete,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const res = formatResolution(photo.width, photo.height);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    const downloadUrl = `/api/photos/${photo.id}/download`;
    await downloadPhotoFile(downloadUrl, photo.originalFilename || `${photo.title}.${photo.format.toLowerCase()}`);
    setIsDownloading(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDelete(photo);
  };

  return (
    <div
      id={`photo-card-${photo.id}`}
      onClick={() => onOpenLightbox(photo)}
      className={`group relative overflow-hidden bg-stone-900 border border-stone-800/80 rounded-2xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/60 cursor-pointer flex flex-col ${
        layout === "large" ? "mb-8" : "mb-4"
      }`}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-stone-950 flex items-center justify-center">
        {/* Placeholder skeleton while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-stone-800/60 animate-pulse flex items-center justify-center">
            <span className="text-stone-500 text-xs font-mono">Lade Bild...</span>
          </div>
        )}

        <img
          src={photo.url}
          alt={photo.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            layout === "grid" ? "aspect-[4/3]" : layout === "large" ? "max-h-[70vh] object-contain bg-stone-950" : "h-auto"
          } ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-black/75 backdrop-blur-md text-amber-300 rounded-md border border-amber-500/30 shadow-sm">
            {photo.format || "IMG"}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-black/75 backdrop-blur-md text-stone-200 rounded-md border border-stone-700/60 shadow-sm">
            {res.badge}
          </span>
        </div>

        {/* Top Right: File Size & Quick Download */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 text-[10px] font-medium bg-black/75 backdrop-blur-md text-stone-300 rounded-md border border-stone-700/60 shadow-sm pointer-events-none">
            {formatBytes(photo.size)}
          </span>

          {/* Admin Delete Button (Only for Titus Admin) */}
          {adminAuth.isUnlocked && (
            <button
              id={`delete-photo-${photo.id}`}
              type="button"
              onClick={handleDelete}
              className="p-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg backdrop-blur-md transition-all shadow-md active:scale-90 border border-rose-400/40"
              title="Als Admin löschen"
              aria-label="Foto löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hover Center Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 p-4">
          <button
            type="button"
            className="p-3 bg-stone-900/90 hover:bg-amber-500 hover:text-stone-950 text-stone-100 rounded-full border border-stone-700 transition-all transform group-hover:scale-100 scale-90 shadow-lg"
            title="In Vollbild öffnen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg transition-all transform group-hover:scale-100 scale-90 active:scale-95"
            title="In bester Originalauflösung herunterladen"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? "Lädt..." : "Download"}</span>
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3.5 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold text-stone-100 truncate group-hover:text-amber-300 transition-colors">
            {photo.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
            <span>{res.dimensions}</span>
            <span>•</span>
            <span>{res.megapixels}</span>
          </div>
        </div>

        {/* Download action icon */}
        <button
          type="button"
          onClick={handleDownload}
          className="p-2 text-stone-400 hover:text-emerald-400 hover:bg-stone-800 rounded-lg transition-colors shrink-0"
          title="Herunterladen"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
