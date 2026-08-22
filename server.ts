import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const ADMIN_CODE = "titus_2012";

// Middleware to parse large JSON payloads for high-resolution images
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Storage folders
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PHOTOS_FILE = path.join(DATA_DIR, "photos.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface PhotoItem {
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

// Initial sample high-resolution photos for instant showcase
const SAMPLE_PHOTOS: PhotoItem[] = [
  {
    id: "sample-1",
    title: "Alpine Bergseen bei Sonnenaufgang",
    filename: "sample-alps.jpg",
    originalFilename: "Alpine_Sunrise_4K.jpg",
    mimeType: "image/jpeg",
    format: "JPG",
    size: 4820300,
    width: 3840,
    height: 2160,
    uploadedAt: "2026-08-20T08:30:00.000Z",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3840&q=100",
    tags: ["Natur", "Berge", "Landschaft", "4K"],
    description: "Spektakuläre Spiegelung der schneebedeckten Gipfel im stillen Bergsee."
  },
  {
    id: "sample-2",
    title: "Minimalistische Architektur & Licht",
    filename: "sample-arch.jpg",
    originalFilename: "Modern_Architecture_8K.jpg",
    mimeType: "image/jpeg",
    format: "JPG",
    size: 6140200,
    width: 4000,
    height: 3000,
    uploadedAt: "2026-08-21T10:15:00.000Z",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=4000&q=100",
    tags: ["Architektur", "Minimalismus", "Design"],
    description: "Geometrische Linien und warmes Sonnenlicht im modernen Museumsbau."
  },
  {
    id: "sample-3",
    title: "Nordlichter über den Fjorden",
    filename: "sample-aurora.jpg",
    originalFilename: "Aurora_Borealis_RAW.png",
    mimeType: "image/png",
    format: "PNG",
    size: 8930400,
    width: 5120,
    height: 2880,
    uploadedAt: "2026-08-21T23:45:00.000Z",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=5120&q=100",
    tags: ["Aurora", "Nacht", "Norwegen", "5K"],
    description: "Tanzende grüne Polarlichter über den arktischen Fjorden in Tromsø."
  },
  {
    id: "sample-4",
    title: "Küste im Abendlicht",
    filename: "sample-ocean.jpg",
    originalFilename: "Sunset_Coast_UltraHD.webp",
    mimeType: "image/webp",
    format: "WEBP",
    size: 3420100,
    width: 3840,
    height: 2560,
    uploadedAt: "2026-08-22T06:10:00.000Z",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=3840&q=100",
    tags: ["Meer", "Sonnenuntergang", "Strand"],
    description: "Sanfte Wellen am goldenen Sandstrand während der goldenen Stunde."
  },
  {
    id: "sample-5",
    title: "Nebelwald in den Bergen",
    filename: "sample-forest.jpg",
    originalFilename: "Mystic_Foggy_Forest.jpg",
    mimeType: "image/jpeg",
    format: "JPG",
    size: 5210000,
    width: 4200,
    height: 2800,
    uploadedAt: "2026-08-22T09:20:00.000Z",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=4200&q=100",
    tags: ["Wald", "Nebel", "Atmosphäre"],
    description: "Tiefer Nadelwald, eingehüllt in mystischen Morgennebel."
  },
  {
    id: "sample-6",
    title: "Makro Wassertropfen auf Blatt",
    filename: "sample-macro.jpg",
    originalFilename: "Macro_Dew_Drop_Detail.png",
    mimeType: "image/png",
    format: "PNG",
    size: 7100300,
    width: 3600,
    height: 3600,
    uploadedAt: "2026-08-22T11:00:00.000Z",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=3600&q=100",
    tags: ["Makro", "Detail", "Natur"],
    description: "Kristallklare Tautropfen mit faszinierenden Lichtbrechungen."
  }
];

function getPhotos(): PhotoItem[] {
  try {
    if (!fs.existsSync(PHOTOS_FILE)) {
      fs.writeFileSync(PHOTOS_FILE, JSON.stringify(SAMPLE_PHOTOS, null, 2), "utf-8");
      return SAMPLE_PHOTOS;
    }
    const data = fs.readFileSync(PHOTOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading photos file:", error);
    return SAMPLE_PHOTOS;
  }
}

function savePhotos(photos: PhotoItem[]): void {
  try {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving photos file:", error);
  }
}

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
}));

// API Routes

// Verify Admin Code
app.post("/api/auth/verify", (req, res) => {
  const { code } = req.body;
  if (code && code.trim() === ADMIN_CODE) {
    return res.json({ success: true, message: "Admin-Zugang erfolgreich freigeschaltet." });
  }
  return res.status(401).json({ success: false, message: "Ungültiger Code. Zugriff verweigert." });
});

// Get all photos (Public for everyone)
app.get("/api/photos", (req, res) => {
  const photos = getPhotos();
  res.json({ success: true, photos });
});

// Upload a photo (Admin Only - Requires titus_2012)
app.post("/api/photos/upload", (req, res) => {
  const adminCode = req.headers["x-admin-code"] || req.body.adminCode;
  
  if (adminCode !== ADMIN_CODE) {
    return res.status(403).json({
      success: false,
      message: "Keine Berechtigung. Nur der Admin mit Code kann Fotos hochladen."
    });
  }

  const {
    title,
    originalFilename,
    mimeType,
    format,
    size,
    width,
    height,
    base64Data,
    tags,
    description
  } = req.body;

  if (!base64Data) {
    return res.status(400).json({ success: false, message: "Keine Bilddaten übermittelt." });
  }

  try {
    const id = "photo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    // Sanitize extension
    const ext = path.extname(originalFilename || ".jpg") || `.${(format || "jpg").toLowerCase()}`;
    const safeFilename = `${id}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    // Strip header prefix if present (e.g. data:image/jpeg;base64,...)
    const base64Clean = base64Data.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");
    fs.writeFileSync(filePath, buffer);

    const calculatedSize = size || buffer.length;
    const cleanFormat = (format || (mimeType ? mimeType.split("/")[1] : "JPG")).toUpperCase();

    const newPhoto: PhotoItem = {
      id,
      title: (title || originalFilename || "Unbenanntes Foto").replace(/\.[^/.]+$/, ""),
      filename: safeFilename,
      originalFilename: originalFilename || safeFilename,
      mimeType: mimeType || "image/jpeg",
      format: cleanFormat,
      size: calculatedSize,
      width: width || 1920,
      height: height || 1080,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${safeFilename}`,
      tags: Array.isArray(tags) ? tags : [],
      description: description || ""
    };

    const photos = getPhotos();
    photos.unshift(newPhoto);
    savePhotos(photos);

    return res.json({ success: true, photo: newPhoto, message: "Foto erfolgreich hochgeladen!" });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Fehler beim Speichern: " + error.message });
  }
});

// Delete a photo (Admin Only - Requires titus_2012)
app.delete("/api/photos/:id", (req, res) => {
  const adminCode = req.headers["x-admin-code"] || req.body.adminCode;
  
  if (adminCode !== ADMIN_CODE) {
    return res.status(403).json({
      success: false,
      message: "Keine Berechtigung. Nur der Admin mit Code kann Fotos löschen."
    });
  }

  const { id } = req.params;
  const photos = getPhotos();
  const index = photos.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Foto nicht gefunden." });
  }

  const photo = photos[index];
  
  // If it's a locally stored file in uploads, remove it
  if (photo.filename && !photo.filename.startsWith("sample-")) {
    const filePath = path.join(UPLOADS_DIR, photo.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete local file:", err);
      }
    }
  }

  photos.splice(index, 1);
  savePhotos(photos);

  return res.json({ success: true, message: `Foto "${photo.title}" wurde gelöscht.` });
});

// Force download endpoint with exact original filename
app.get("/api/photos/:id/download", (req, res) => {
  const { id } = req.params;
  const photos = getPhotos();
  const photo = photos.find((p) => p.id === id);

  if (!photo) {
    return res.status(404).send("Foto nicht gefunden");
  }

  if (photo.filename && !photo.filename.startsWith("sample-")) {
    const filePath = path.join(UPLOADS_DIR, photo.filename);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, photo.originalFilename || photo.filename);
    }
  }

  // Fallback for external sample URLs: redirect with attachment header or stream
  return res.redirect(photo.url);
});

// Vite / Static SPA setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Foto Galerie Server läuft auf http://localhost:${PORT}`);
  });
}

startServer();
