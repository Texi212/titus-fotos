/**
 * Format bytes to readable string (e.g. 4.2 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format dimension into clean label with MP calculation
 */
export function formatResolution(width: number, height: number): {
  dimensions: string;
  megapixels: string;
  badge: string;
  aspectRatio: string;
} {
  const w = width || 1920;
  const h = height || 1080;
  const mp = ((w * h) / 1000000).toFixed(1) + " MP";
  
  let badge = "HD";
  if (w >= 7680 || h >= 4320) badge = "8K UHD";
  else if (w >= 5120 || h >= 2880) badge = "5K";
  else if (w >= 3840 || h >= 2160) badge = "4K UHD";
  else if (w >= 2560 || h >= 1440) badge = "2K QHD";
  else if (w >= 1920 || h >= 1080) badge = "Full HD";

  // GCD for aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(w, h);
  const ratioX = Math.round(w / divisor);
  const ratioY = Math.round(h / divisor);
  const aspectRatio = `${ratioX}:${ratioY}`;

  return {
    dimensions: `${w} × ${h} px`,
    megapixels: mp,
    badge,
    aspectRatio: (ratioX > 50 || ratioY > 50) ? `${(w / h).toFixed(2)}:1` : aspectRatio,
  };
}

/**
 * Format ISO date string into German locale format
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoDate;
  }
}

/**
 * Direct file download helper that triggers browser save dialogue in full resolution
 */
export async function downloadPhotoFile(url: string, filename: string): Promise<void> {
  try {
    // If it's a relative API or local url, fetch as blob to ensure exact file saving
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download fehlgeschlagen");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "foto_download.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    // Fallback: direct anchor trigger
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "foto_download.jpg";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
