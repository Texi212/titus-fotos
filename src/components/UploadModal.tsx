import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  FileText,
  Tag,
} from "lucide-react";
import { UploadItem, Photo } from "../types";
import { formatBytes, formatResolution } from "../utils/formatters";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminCode: string;
  onUploadSuccess: (newPhotos: Photo[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  adminCode,
  onUploadSuccess,
}) => {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overallError, setOverallError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process files selected or dropped
  const handleFiles = async (files: FileList | File[]) => {
    setOverallError(null);
    const newItems: UploadItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && !/\.(jpg|jpeg|png|webp|gif|svg|avif|heic|tiff|bmp|raw|dng|nef|cr2)$/i.test(file.name)) {
        continue;
      }

      // Generate preview and compute dimensions
      const previewUrl = URL.createObjectURL(file);
      const ext = file.name.split(".").pop()?.toUpperCase() || "JPG";

      const dimensions = await getImageDimensions(previewUrl);

      const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

      newItems.push({
        id: "queue_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        file,
        previewUrl,
        title,
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        format: ext,
        mimeType: file.type || "image/jpeg",
        tags: [],
        description: "",
        status: "pending",
        progress: 0,
      });
    }

    if (newItems.length === 0) {
      setOverallError("Keine gültigen Bilddateien erkannt.");
      return;
    }

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || 1920,
          height: img.naturalHeight || 1080,
        });
      };
      img.onerror = () => {
        resolve({ width: 1920, height: 1080 });
      };
      img.src = url;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    setUploadQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateItemTitle = (id: string, title: string) => {
    setUploadQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title } : i))
    );
  };

  const updateItemTags = (id: string, tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setUploadQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, tags } : i))
    );
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const startUpload = async () => {
    if (uploadQueue.length === 0) return;
    setIsUploading(true);
    setOverallError(null);

    const uploadedPhotos: Photo[] = [];

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status === "success") continue;

      // Update status to uploading
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 20 } : it))
      );

      try {
        const base64Data = await fileToBase64(item.file);
        
        setUploadQueue((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, progress: 60 } : it))
        );

        const response = await fetch("/api/photos/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-code": adminCode,
          },
          body: JSON.stringify({
            title: item.title,
            originalFilename: item.file.name,
            mimeType: item.mimeType,
            format: item.format,
            size: item.size,
            width: item.width,
            height: item.height,
            base64Data,
            tags: item.tags,
            description: item.description,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.photo) {
          uploadedPhotos.push(data.photo);
          setUploadQueue((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "success", progress: 100 } : it
            )
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "error", errorMessage: data.message || "Upload fehlgeschlagen" }
                : it
            )
          );
        }
      } catch (err: any) {
        setUploadQueue((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "error", errorMessage: err.message || "Netzwerkfehler" }
              : it
          )
        );
      }
    }

    setIsUploading(false);

    if (uploadedPhotos.length > 0) {
      onUploadSuccess(uploadedPhotos);
      // If all succeeded, close after short delay
      setTimeout(() => {
        onClose();
        setUploadQueue([]);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="upload-modal"
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">
                Fotos in bester Auflösung hochladen
              </h2>
              <p className="text-xs text-stone-400">
                Unterstützt JPG, PNG, WEBP, GIF, SVG, AVIF, HEIC & RAW in Originalqualität
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? "border-emerald-400 bg-emerald-950/30 scale-[0.99]"
                : "border-stone-700 bg-stone-800/40 hover:bg-stone-800/70 hover:border-stone-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.heic,.raw,.dng,.svg,.webp,.avif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
              }}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-stone-800 rounded-full border border-stone-700 text-amber-400">
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-stone-200">
                Bilder hierher ziehen oder <span className="text-amber-400 underline">Dateien auswählen</span>
              </p>
              <p className="text-xs text-stone-400 max-w-sm">
                Mehrere Dateien gleichzeitig möglich. Maximale Auflösung & Format-Treue garantiert.
              </p>
            </div>
          </div>

          {overallError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{overallError}</span>
            </div>
          )}

          {/* Queue List */}
          {uploadQueue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-400 px-1">
                <span>Ausgewählte Bilder ({uploadQueue.length})</span>
                <button
                  type="button"
                  onClick={() => setUploadQueue([])}
                  className="text-rose-400 hover:underline"
                >
                  Alle entfernen
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {uploadQueue.map((item) => {
                  const res = formatResolution(item.width, item.height);
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-800/90 border border-stone-700/80 rounded-xl flex items-center gap-3 text-xs text-stone-200 transition-all"
                    >
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover bg-stone-900 border border-stone-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItemTitle(item.id, e.target.value)}
                            placeholder="Bildtitel..."
                            className="bg-stone-900/80 border border-stone-700 px-2 py-0.5 rounded text-xs text-stone-100 focus:outline-none focus:border-amber-500 w-full"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                          <span className="bg-stone-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                            {item.format}
                          </span>
                          <span>{res.dimensions}</span>
                          <span>({res.megapixels})</span>
                          <span>•</span>
                          <span>{formatBytes(item.size)}</span>
                        </div>

                        {/* Status bar */}
                        {item.status === "uploading" && (
                          <div className="w-full bg-stone-700 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                        {item.status === "error" && (
                          <span className="text-rose-400 font-medium">
                            {item.errorMessage || "Fehler"}
                          </span>
                        )}
                      </div>

                      {/* Status / Action */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {item.status === "success" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-700 rounded-lg transition-colors"
                            title="Entfernen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            {uploadQueue.length > 0
              ? `${uploadQueue.length} ${
                  uploadQueue.length === 1 ? "Datei" : "Dateien"
                } bereit`
              : "Wähle Bilder zum Hochladen"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              id="submit-upload-button"
              type="button"
              disabled={uploadQueue.length === 0 || isUploading}
              onClick={startUpload}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Wird hochgeladen...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Jetzt {uploadQueue.length} Bilder hochladen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
