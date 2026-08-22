export interface Photo {
  id: string;
  title: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  format: string;
  size: number;
  width: number;
  height: number;
  uploadedAt: string;
  url: string;
  tags?: string[];
  description?: string;
}

export type GalleryLayout = "masonry" | "grid" | "large" | "compact";

export type SortOption = "newest" | "oldest" | "highest_res" | "largest_size" | "title";

export interface AdminAuthState {
  isUnlocked: boolean;
  code: string;
}

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  width: number;
  height: number;
  size: number;
  format: string;
  mimeType: string;
  tags: string[];
  description: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  errorMessage?: string;
}
