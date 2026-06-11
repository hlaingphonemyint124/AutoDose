import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Comments } from "@/components/Comments";

interface Photo {
  id: string;
  title: string;
  category: string;
  storage_url: string;
  created_at: string;
}

const FILTERS = ["All", "JDM", "Supercar", "Street", "Meet", "Build"];

function distribute<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

// ── Photo tile ────────────────────────────────────────────────────────────────
// Uses native loading="lazy" + a fixed aspect-ratio container so the browser
// can observe the element and lazy-load correctly on all devices.
// getOptimizedUrl (Supabase render transform) is intentionally REMOVED —
// that endpoint requires a paid Supabase plan and returns errors on the free tier,
// causing every image to show as broken.
const PhotoTile = ({
  photo,
  onClick,
  priority = false,
}: {
  photo: Photo;
  onClick: () => void;
  priority?: boolean;
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-zinc-900 mb-3 md:mb-4"
      onClick={onClick}
    >
      {/* Fixed aspect-ratio wrapper — always has height so lazy-load triggers */}
      <div className="relative w-full" style={{ paddingTop: "66.67%" }}>

        {/* Shimmer while loading */}
        {status === "loading" && (
          <div className="absolute inset-0 shimmer rounded-xl" />
        )}

        {/* Broken image fallback */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-zinc-600 text-[10px] uppercase tracking-widest font-orbitron px-4 text-center line-clamp-2">
              {photo.title}
            </span>
          </div>
        )}

        {/* Image — always in DOM, always uses the direct storage_url */}
        <img
          src={photo.storage_url}
          alt={photo.title}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-300"
          style={{ opacity: status === "loaded" ? 1 : 0 }}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 md:p-4 rounded-xl">
        <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
          <span className="inline-block px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-orbitron font-bold rounded-full mb-1.5 capitalize">
            {photo.category}
          </span>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
            {photo.title}
          </h3>
        </div>
      </div>

      {/* Zoom icon */}
      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100">
        <ZoomIn size={14} className="text-white" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />
    </div>
  );
};

// ── Lightbox image ─────────────────────────────────────────────────────────────
const LightboxImage = ({ photo }: { photo: Photo }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
      {/* Low-opacity placeholder while full image loads */}
      {!loaded && (
        <div className="absolute inset-0 shimmer" />
      )}
      <img
        src={photo.storage_url}
        alt={photo.title}
        fetchPriority="high"
        decoding="async"
        className="w-full max-h-[65vh] object-contain relative z-10"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent && !parent.querySelector(".img-error-msg")) {
            const div = document.createElement("div");
            div.className = "img-error-msg w-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm py-20 z-10 relative";
            div.textContent = "Image unavailable";
            parent.appendChild(div);
          }
        }}
      />
    </div>
  );
};

// ── Main Gallery ──────────────────────────────────────────────────────────────
const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filtered, setFiltered] = useState<Photo[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cols, setCols] = useState(4);

  // Responsive column count
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 2 : w < 1024 ? 3 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => { fetchPhotos(); }, []);

  useEffect(() => {
    setFiltered(
      activeFilter === "All"
        ? photos
        : photos.filter((p) => p.category?.toLowerCase().includes(activeFilter.toLowerCase()))
    );
  }, [activeFilter, photos]);

  const fetchPhotos = async () => {
    try {
      setFetchError(false);
      const { data, error } = await supabase
        .from("photos")
        .select("id, title, category, storage_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
      setFiltered(data || []);
    } catch (e) {
      console.error(e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const openPhoto = (photo: Photo) => {
    const idx = filtered.findIndex((p) => p.id === photo.id);
    setSelectedIndex(idx);
    setSelectedPhoto(photo);
  };

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const next = (selectedIndex + dir + filtered.length) % filtered.length;
      setSelectedIndex(next);
      setSelectedPhoto(filtered[next]);
    },
    [selectedIndex, filtered]
  );

  // Preload adjacent lightbox images
  useEffect(() => {
    if (!selectedPhoto || filtered.length === 0) return;
    const preloadIdx = [
      (selectedIndex + 1) % filtered.length,
      (selectedIndex - 1 + filtered.length) % filtered.length,
    ];
    preloadIdx.forEach((i) => {
      const img = new Image();
      img.src = filtered[i].storage_url;
    });
  }, [selectedIndex, selectedPhoto, filtered]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") setSelectedPhoto(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedPhoto, navigate]);

  const columns = distribute(filtered, cols);
  // First 8 photos get priority/eager loading
  const priorityIds = new Set(filtered.slice(0, 8).map((p) => p.id));

  return (
    <section id="gallery" className="py-16 md:py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-orbitron mb-3">
            Visual Archive
          </span>
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="text-primary">PHOTO</span>{" "}
            <span className="text-foreground">GALLERY</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-inter max-w-xl mx-auto">
            Capturing the essence of Japanese automotive culture through our lens.
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-8 md:mb-12"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsla(var(--primary)/0.4)]"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Count */}
        <motion.p
          key={filtered.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-center mb-6"
        >
          {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
        </motion.p>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] rounded-xl shimmer" />
            ))}
          </div>
        ) : fetchError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 space-y-4">
            <p className="text-muted-foreground">Couldn't load photos. Check your connection.</p>
            <button
              onClick={() => { setLoading(true); fetchPhotos(); }}
              className="px-5 py-2 text-sm border border-primary/40 text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-muted-foreground"
          >
            No photos in this category yet.
          </motion.div>
        ) : (
          <motion.div
            key={activeFilter}
            className="flex gap-3 md:gap-4 items-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {columns.map((col, ci) => (
              <div key={ci} className="flex-1 min-w-0">
                {col.map((photo, pi) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.38,
                      ease: [0.22, 1, 0.36, 1],
                      delay: pi < 4 ? ci * 0.04 + pi * 0.05 : 0,
                    }}
                  >
                    <PhotoTile
                      photo={photo}
                      onClick={() => openPhoto(photo)}
                      priority={priorityIds.has(photo.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-6xl p-0 bg-black/95 border-border/40 max-h-[95vh] overflow-hidden">
          <DialogTitle className="sr-only">Photo Viewer — {selectedPhoto?.title}</DialogTitle>
          <DialogDescription className="sr-only">View full size photo</DialogDescription>

          <button
            onClick={() => navigate(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-primary/80 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-primary/80 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-black/60 hover:bg-primary border border-white/10 flex items-center justify-center text-white transition-all duration-200"
          >
            <X size={16} />
          </button>

          <div className="absolute top-3 left-3 z-50 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-white text-xs font-mono">
            {selectedIndex + 1} / {filtered.length}
          </div>

          <AnimatePresence mode="wait">
            {selectedPhoto && (
              <motion.div
                key={selectedPhoto.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="overflow-y-auto max-h-[95vh]"
              >
                <LightboxImage photo={selectedPhoto} />
                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs font-orbitron font-bold rounded-full mb-2 capitalize">
                      {selectedPhoto.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-orbitron font-bold text-white">
                      {selectedPhoto.title}
                    </h2>
                  </div>
                  <Comments photoId={selectedPhoto.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;