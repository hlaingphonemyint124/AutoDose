import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
  likes: number | null;
  created_at: string;
}

const CATEGORY_ORDER = ["jdm", "lifestyle", "events", "portraits", "street"];

const PhotoRows = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("photos")
        .select("id, title, storage_url, category, likes, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setPhotos(data as Photo[]);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  if (loading || photos.length === 0) return null;

  // Group by category
  const byCategory = photos.reduce<Record<string, Photo[]>>((acc, p) => {
    const cat = (p.category || "uncategorized").toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const sortedCategories = Object.keys(byCategory).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="space-y-2 md:space-y-4">
      {/* Latest Photos row */}
      <PhotoRow title="Latest Photos" photos={photos.slice(0, 14)} />

      {sortedCategories.map((cat) => (
        <PhotoRow
          key={cat}
          title={cat.charAt(0).toUpperCase() + cat.slice(1)}
          photos={byCategory[cat]}
        />
      ))}
    </div>
  );
};

const PhotoRow = ({ title, photos }: { title: string; photos: Photo[] }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!photos.length) return null;

  return (
    <section className="py-6 md:py-8 group/row">
      <div className="px-4 md:px-12 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Camera className="text-primary shrink-0" size={20} />
          <h2 className="text-lg sm:text-xl md:text-2xl font-orbitron font-bold text-foreground truncate">
            {title}
          </h2>
        </div>
        <Link
          to="/gallery"
          className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
        >
          View all →
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-16 items-center justify-center bg-background/70 backdrop-blur-sm border border-border rounded-r-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover/row:opacity-100"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth px-4 md:px-12 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.25) }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
            >
              <Link
                to="/gallery"
                className="block relative aspect-[4/5] rounded-lg overflow-hidden bg-card border border-border shadow-card group/card"
              >
                <img
                  src={photo.storage_url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 space-y-1">
                  <h3 className="text-sm md:text-base font-orbitron font-bold text-foreground line-clamp-1">
                    {photo.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {photo.category && (
                      <span className="text-primary uppercase tracking-wider">
                        {photo.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {photo.likes ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-16 items-center justify-center bg-background/70 backdrop-blur-sm border border-border rounded-l-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover/row:opacity-100"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
};

export default PhotoRows;
