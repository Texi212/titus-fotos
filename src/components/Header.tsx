import React from "react";
import {
  Settings,
  ShieldCheck,
  Upload,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  Maximize2,
  ListFilter,
  Sparkles,
  Lock,
  Camera,
  Layers,
} from "lucide-react";
import { GalleryLayout, SortOption, AdminAuthState } from "../types";

interface HeaderProps {
  adminAuth: AdminAuthState;
  onOpenSettings: () => void;
  onOpenUpload: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: string[];
  selectedFormat: string | null;
  onSelectFormat: (format: string | null) => void;
  allFormats: string[];
  layout: GalleryLayout;
  onLayoutChange: (layout: GalleryLayout) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalPhotos: number;
  filteredCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  adminAuth,
  onOpenSettings,
  onOpenUpload,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  allTags,
  selectedFormat,
  onSelectFormat,
  allFormats,
  layout,
  onLayoutChange,
  sortOption,
  onSortChange,
  totalPhotos,
  filteredCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 text-stone-100 transition-all">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left Side: Settings Wheel ("links oben ein einstellungs rad") */}
        <div className="flex items-center gap-3">
          <button
            id="settings-gear-button"
            type="button"
            onClick={onOpenSettings}
            className={`group relative p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              adminAuth.isUnlocked
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/70 hover:border-emerald-400"
                : "bg-stone-800/90 border-stone-700 text-stone-300 hover:bg-stone-700/80 hover:text-white hover:border-stone-500"
            }`}
            title="Admin-Einstellungen & Code eingeben"
            aria-label="Einstellungen und Admin-Zugang"
          >
            <Settings
              className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-90 ${
                adminAuth.isUnlocked ? "text-emerald-400 animate-spin-slow" : ""
              }`}
            />
            <span className="hidden sm:inline text-xs font-medium">
              {adminAuth.isUnlocked ? "Admin (Aktiv)" : "Einstellungen"}
            </span>

            {/* Glowing active indicator */}
            {adminAuth.isUnlocked && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Title & Brand */}
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-stone-100 via-amber-200 to-stone-300 bg-clip-text text-transparent flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400 inline" />
              <span>TITUS GALERIE</span>
            </h1>
            <span className="hidden md:inline text-xs text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700/60">
              {totalPhotos} {totalPhotos === 1 ? "Foto" : "Fotos"} in Originalauflösung
            </span>
          </div>
        </div>

        {/* Right Side: Admin Upload Trigger & View Controls */}
        <div className="flex items-center gap-2.5">
          {adminAuth.isUnlocked ? (
            <button
              id="admin-upload-button"
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all transform active:scale-95 focus:ring-2 focus:ring-emerald-400"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Fotos hochladen</span>
              <span className="sm:hidden">Upload</span>
            </button>
          ) : (
            <button
              id="visitor-admin-login-hint"
              type="button"
              onClick={onOpenSettings}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 bg-stone-800/50 hover:bg-stone-800 hover:text-stone-200 border border-stone-800 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Admin-Code nötig für Upload</span>
            </button>
          )}

          {/* Layout Switcher */}
          <div className="hidden sm:flex items-center bg-stone-800/80 p-1 rounded-xl border border-stone-700/70">
            <button
              type="button"
              onClick={() => onLayoutChange("masonry")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layout === "masonry"
                  ? "bg-stone-700 text-amber-300 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Masonry-Ansicht (Kompakt & Natürlich)"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layout === "grid"
                  ? "bg-stone-700 text-amber-300 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Gleichmäßiges Raster (Grid)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("large")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layout === "large"
                  ? "bg-stone-700 text-amber-300 shadow-sm"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title="Große Einzelansicht"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-stone-800/60 text-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            id="gallery-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Fotos, Tags, Dateiformate durchsuchen..."
            className="w-full pl-9 pr-8 py-1.5 bg-stone-800/70 border border-stone-700/80 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 text-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Format Filters & Sorting */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Format pills */}
          <div className="flex items-center gap-1.5 bg-stone-800/60 p-1 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => onSelectFormat(null)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedFormat === null
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Alle Formate
            </button>
            {allFormats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onSelectFormat(selectedFormat === fmt ? null : fmt)}
                className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap uppercase transition-colors ${
                  selectedFormat === fmt
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-stone-800/60 px-2 py-1 rounded-xl border border-stone-800">
            <ListFilter className="w-3.5 h-3.5 text-stone-400" />
            <select
              id="gallery-sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-stone-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest" className="bg-stone-900 text-stone-200">Neueste zuerst</option>
              <option value="oldest" className="bg-stone-900 text-stone-200">Älteste zuerst</option>
              <option value="highest_res" className="bg-stone-900 text-stone-200">Höchste Auflösung</option>
              <option value="largest_size" className="bg-stone-900 text-stone-200">Größte Datei</option>
              <option value="title" className="bg-stone-900 text-stone-200">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
