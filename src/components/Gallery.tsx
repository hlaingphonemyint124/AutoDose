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

// Spread photos across N columns in reading order so date-sort is preserved
function distribute<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

// ── Photo tile ────────────────────────────────────────────────────────────────
const PhotoTile = ({ photo, onClick }: { photo: Photo; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-muted mb-3 md:mb-4"
      onClick={onClick}
    >
      {/* Aspect-ratio shimmer shown until image loads */}
      {!loaded && (
        <div
          className="shimmer w-full rounded-xl"
          style={{ paddingTop: "66.67%" }}
        />
      )}

      {/* Image: absolutely positioned (invisible) until loaded, then static + visible */}
      <img
        src={photo.storage_url}
        alt={photo.title}
        loading="lazy"
        className="w-full h-auto object-cover block"
        style={
          loaded
            ? { opacity: 1, transition: "opacity 0.4s ease" }
            : { opacity: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }
        }
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 md:p-4">
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
        .select("*")
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
                      delay: ci * 0.05 + pi * 0.07,
                    }}
                  >
                    <PhotoTile photo={photo} onClick={() => openPhoto(photo)} />
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
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-y-auto max-h-[95vh]"
              >
                <img
                  src={selectedPhoto.storage_url}
                  alt={selectedPhoto.title}
                  className="w-full max-h-[65vh] object-contain bg-black"
                />
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
