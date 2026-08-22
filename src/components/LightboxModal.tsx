import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Play,
  Pause,
  Info,
  Calendar,
  Layers,
  FileText,
  Tag,
  Sparkles,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Photo, AdminAuthState } from "../types";
import { formatBytes, formatResolution, formatDate, downloadPhotoFile } from "../utils/formatters";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentPhoto: Photo | null;
  onSelectPhoto: (photo: Photo) => void;
  adminAuth: AdminAuthState;
  onRequestDelete: (photo: Photo) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  photos,
  currentPhoto,
  onSelectPhoto,
  adminAuth,
  onRequestDelete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(true);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const slideshowTimerRef = useRef<number | null>(null);

  if (!isOpen || !currentPhoto) return null;

  const currentIndex = photos.findIndex((p) => p.id === currentPhoto.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onSelectPhoto(photos[currentIndex - 1]);
      resetTransform();
    }
  }, [hasPrev, photos, currentIndex, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onSelectPhoto(photos[currentIndex + 1]);
      resetTransform();
    } else if (isSlideshow) {
      // Loop back in slideshow
      onSelectPhoto(photos[0]);
      resetTransform();
    }
  }, [hasNext, photos, currentIndex, onSelectPhoto, isSlideshow]);

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        setIsSlideshow((prev) => !prev);
      } else if (e.key === "d" || e.key === "D") {
        handleDownload();
      } else if (e.key === "i" || e.key === "I") {
        setShowInfo((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Slideshow timer
  useEffect(() => {
    if (isSlideshow) {
      slideshowTimerRef.current = window.setInterval(() => {
        handleNext();
      }, 4000);
    } else {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isSlideshow, handleNext]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 4));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(z - 0.3, 0.5);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const downloadUrl = `/api/photos/${currentPhoto.id}/download`;
    await downloadPhotoFile(
      downloadUrl,
      currentPhoto.originalFilename || `${currentPhoto.title}.${currentPhoto.format.toLowerCase()}`
    );
    setIsDownloading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + currentPhoto.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const res = formatResolution(currentPhoto.width, currentPhoto.height);

  return (
    <div
      id="photo-lightbox-modal"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Controls Bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/80 text-stone-200 z-20">
        {/* Title & Index */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono px-2.5 py-1 bg-stone-800 rounded-lg text-amber-300 border border-stone-700">
            {currentIndex + 1} / {photos.length}
          </span>
          <h2 className="text-sm font-semibold truncate text-stone-100 max-w-[200px] sm:max-w-md">
            {currentPhoto.title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.6}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-30"
              title="Verkleinern"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-stone-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-30"
              title="Vergrößern"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              title="Um 90° drehen"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Slideshow button */}
          <button
            type="button"
            onClick={() => setIsSlideshow(!isSlideshow)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              isSlideshow
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
            title="Diashow starten (Leertaste)"
          >
            {isSlideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden md:inline">{isSlideshow ? "Pause" : "Diashow"}</span>
          </button>

          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-xl border transition-colors ${
              showInfo
                ? "bg-stone-800 border-stone-700 text-amber-300"
                : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
            }`}
            title="Bilddetails anzeigen (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Download button (Beste Auflösung) */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="In Originalqualität downloaden (D)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isDownloading ? "Lädt..." : "Download Original"}
            </span>
          </button>

          {/* Admin Delete Action */}
          {adminAuth.isUnlocked && (
            <button
              type="button"
              onClick={() => onRequestDelete(currentPhoto)}
              className="p-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl transition-colors shadow-md border border-rose-400/40"
              title="Dieses Foto als Admin löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors ml-1"
            title="Schließen (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Nav Arrow */}
        {hasPrev && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white rounded-full border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-90"
            title="Vorheriges Bild (Linke Pfeiltaste)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Nav Arrow */}
        {hasNext && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white rounded-full border border-stone-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-90"
            title="Nächstes Bild (Rechte Pfeiltaste)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Center Canvas / Image */}
        <div
          className={`flex-1 relative flex items-center justify-center p-4 overflow-hidden ${
            zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            draggable={false}
            className="max-h-[82vh] max-w-[85vw] object-contain transition-transform duration-100 ease-out shadow-2xl select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>

        {/* Side Info Sidebar (collapsible) */}
        {showInfo && (
          <div className="w-80 bg-stone-900/95 border-l border-stone-800 p-5 overflow-y-auto z-20 text-stone-200 space-y-4 text-xs animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bild-Informationen</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">
                {currentPhoto.format}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <span className="text-[11px] text-stone-500 font-medium">Titel</span>
              <p className="font-semibold text-stone-100 text-sm">{currentPhoto.title}</p>
              {currentPhoto.description && (
                <p className="text-stone-400 mt-1 text-xs leading-relaxed">
                  {currentPhoto.description}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="bg-stone-950/70 rounded-xl p-3.5 border border-stone-800 space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between items-center text-stone-400">
                <span>Auflösung:</span>
                <span className="text-stone-100 font-semibold">{res.dimensions}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Qualitätsstufe:</span>
                <span className="text-amber-300 font-semibold">{res.badge} ({res.megapixels})</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Seitenverhältnis:</span>
                <span className="text-stone-200">{res.aspectRatio}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Dateigröße:</span>
                <span className="text-stone-200">{formatBytes(currentPhoto.size)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Format / Typ:</span>
                <span className="text-stone-200">{currentPhoto.mimeType || currentPhoto.format}</span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Dateiname:</span>
                <span className="text-stone-300 truncate max-w-[120px]" title={currentPhoto.originalFilename}>
                  {currentPhoto.originalFilename}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Hochgeladen:</span>
                <span className="text-stone-300">{formatDate(currentPhoto.uploadedAt)}</span>
              </div>
            </div>

            {/* Tags */}
            {currentPhoto.tags && currentPhoto.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentPhoto.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded-md border border-stone-700/80 text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-md text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Originaldatei herunterladen</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 transition-colors text-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link kopiert!" : "Bildlink kopieren"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      <div className="h-20 bg-stone-950/90 border-t border-stone-800/80 px-4 flex items-center gap-2 overflow-x-auto scrollbar-thin z-20">
        {photos.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              onSelectPhoto(p);
              resetTransform();
            }}
            className={`relative shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
              p.id === currentPhoto.id
                ? "border-amber-400 scale-105 shadow-md shadow-amber-500/20"
                : "border-stone-800 opacity-50 hover:opacity-100 hover:border-stone-600"
            }`}
          >
            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
