import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { PhotoCard } from "./components/PhotoCard";
import { LightboxModal } from "./components/LightboxModal";
import { AdminSettingsModal } from "./components/AdminSettingsModal";
import { UploadModal } from "./components/UploadModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { EmptyState } from "./components/EmptyState";
import { Photo, GalleryLayout, SortOption, AdminAuthState } from "./types";
import { Sparkles, Shield, Image as ImageIcon, Heart } from "lucide-react";

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Auth State
  const [adminAuth, setAdminAuth] = useState<AdminAuthState>(() => {
    try {
      const saved = localStorage.getItem("titus_admin_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isUnlocked && parsed.code === "titus_2012") {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { isUnlocked: false, code: "" };
  });

  // UI Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Layout
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [layout, setLayout] = useState<GalleryLayout>("masonry");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load photos from backend
  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/photos");
      const data = await res.json();
      if (data.success && Array.isArray(data.photos)) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Fotos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Verify Admin Code
  const handleVerifyCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const newAuth = { isUnlocked: true, code };
        setAdminAuth(newAuth);
        localStorage.setItem("titus_admin_session", JSON.stringify(newAuth));
        showToast("Admin-Modus aktiviert (Titus)");
        return true;
      }
    } catch (err) {
      console.error("Auth verification failed:", err);
    }
    return false;
  };

  const handleLogout = () => {
    const newAuth = { isUnlocked: false, code: "" };
    setAdminAuth(newAuth);
    localStorage.removeItem("titus_admin_session");
    showToast("Admin-Modus beendet");
  };

  // Upload handler
  const handleUploadSuccess = (newPhotos: Photo[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
    showToast(`${newPhotos.length} ${newPhotos.length === 1 ? "Foto" : "Fotos"} erfolgreich hinzugefügt!`);
  };

  // Delete handler
  const handleConfirmDelete = async (photo: Photo) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: "DELETE",
        headers: {
          "x-admin-code": adminAuth.code,
        },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setDeletePhotoTarget(null);
        if (lightboxPhoto?.id === photo.id) {
          setLightboxPhoto(null);
        }
        showToast(`"${photo.title}" wurde gelöscht.`);
      } else {
        alert(data.message || "Fehler beim Löschen");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Netzwerkfehler beim Löschen.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Computed Formats & Tags
  const allFormats = useMemo(() => {
    const fmts = new Set<string>();
    photos.forEach((p) => {
      if (p.format) fmts.add(p.format.toUpperCase());
    });
    return Array.from(fmts);
  }, [photos]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach((p) => {
      p.tags?.forEach((t) => tags.add(t));
    });
    return Array.from(tags);
  }, [photos]);

  // Filtered & Sorted Photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.originalFilename.toLowerCase().includes(q) ||
          p.format.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Format filter
    if (selectedFormat) {
      result = result.filter(
        (p) => p.format.toUpperCase() === selectedFormat.toUpperCase()
      );
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((p) => p.tags && p.tags.includes(selectedTag));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortOption === "highest_res") {
        return (b.width * b.height) - (a.width * a.height);
      }
      if (sortOption === "largest_size") {
        return b.size - a.size;
      }
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [photos, searchQuery, selectedFormat, selectedTag, sortOption]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-emerald-500/50 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white text-xs pl-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header with Gear Wheel in top-left */}
      <Header
        adminAuth={adminAuth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        allTags={allTags}
        selectedFormat={selectedFormat}
        onSelectFormat={setSelectedFormat}
        allFormats={allFormats}
        layout={layout}
        onLayoutChange={setLayout}
        sortOption={sortOption}
        onSortChange={setSortOption}
        totalPhotos={photos.length}
        filteredCount={filteredPhotos.length}
      />

      {/* Gallery Main Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Admin Banner (if logged in) */}
        {adminAuth.isUnlocked && (
          <div className="mb-6 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-200 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-900/60 rounded-lg text-emerald-300">
                <Shield className="w-4 h-4" />
              </span>
              <span>
                <strong>Admin-Modus aktiv</strong>: Du kannst Fotos hochladen und verwalten. Alle anderen Besucher haben reinen Ansichts- & Download-Zugriff.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              + Foto hochladen
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-stone-400">Lade Galerie-Bilder in bester Qualität...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <EmptyState
            isSearch={Boolean(searchQuery || selectedFormat || selectedTag)}
            adminAuth={adminAuth}
            onResetSearch={() => {
              setSearchQuery("");
              setSelectedFormat(null);
              setSelectedTag(null);
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <div>
            {/* Gallery Layout Modes */}
            {layout === "masonry" && (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid">
                    <PhotoCard
                      photo={photo}
                      layout={layout}
                      adminAuth={adminAuth}
                      onOpenLightbox={setLightboxPhoto}
                      onRequestDelete={setDeletePhotoTarget}
                    />
                  </div>
                ))}
              </div>
            )}

            {layout === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    layout={layout}
                    adminAuth={adminAuth}
                    onOpenLightbox={setLightboxPhoto}
                    onRequestDelete={setDeletePhotoTarget}
                  />
                ))}
              </div>
            )}

            {layout === "large" && (
              <div className="max-w-4xl mx-auto space-y-6">
                {filteredPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    layout={layout}
                    adminAuth={adminAuth}
                    onOpenLightbox={setLightboxPhoto}
                    onRequestDelete={setDeletePhotoTarget}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-900 bg-stone-950 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Titus Fotogalerie • Höchste Bildtreue & Freier Download</p>
          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Unterstützt alle Bildformate</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-stone-400 hover:text-amber-300 transition-colors"
            >
              {adminAuth.isUnlocked ? "Admin-Konsole" : "Admin-Login"}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        adminAuth={adminAuth}
        onVerifyCode={handleVerifyCode}
        onLogout={handleLogout}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        adminCode={adminAuth.code}
        onUploadSuccess={handleUploadSuccess}
      />

      <LightboxModal
        isOpen={Boolean(lightboxPhoto)}
        onClose={() => setLightboxPhoto(null)}
        photos={filteredPhotos}
        currentPhoto={lightboxPhoto}
        onSelectPhoto={setLightboxPhoto}
        adminAuth={adminAuth}
        onRequestDelete={(p) => {
          setDeletePhotoTarget(p);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletePhotoTarget)}
        onClose={() => setDeletePhotoTarget(null)}
        photo={deletePhotoTarget}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
