import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Link } from "react-router-dom";

export interface RowPhoto {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
  likes: number | null;
}

interface Props {
  title: string;
  photos: RowPhoto[];
}

const LatestPhotoRow = ({ title, photos }: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!photos.length) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="group/row py-8">
      <div className="px-4 md:px-12 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="text-primary" size={20} />
          <h2 className="text-xl md:text-2xl font-orbitron font-bold text-foreground">
            {title}
          </h2>
        </div>
        <Link
          to="/gallery"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="relative auto-perspective">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-16 items-center justify-center bg-background/70 backdrop-blur-sm border border-border rounded-r-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover/row:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-5 scrollbar-hide md:px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              whileHover={{ scale: 1.04, y: -8, rotateX: 3, rotateY: i % 2 ? -4 : 4, zIndex: 5 }}
              whileTap={{ scale: 0.98 }}
              className="group/card relative aspect-[4/5] w-[200px] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-md border border-border bg-card shadow-card transform-gpu transition-colors duration-300 hover:border-primary/55 md:w-[280px]"
            >
              <Link to="/gallery" className="block w-full h-full">
                <img
                  src={photo.storage_url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                />

                {/* Hover overlay - dark vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/26 to-transparent opacity-85 transition-opacity md:opacity-0 md:group-hover/card:opacity-100" />
                <div className="absolute left-3 top-3 h-8 w-8 border-l border-t border-white/50 opacity-0 transition md:group-hover/card:opacity-100" />
                <div className="absolute bottom-3 right-3 h-8 w-8 border-b border-r border-primary/75 opacity-0 transition md:group-hover/card:opacity-100" />

                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-100 transition-opacity md:opacity-0 md:group-hover/card:opacity-100">
                  <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2 drop-shadow-md">
                    {photo.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                    {photo.category && (
                      <span className="uppercase tracking-wider drop-shadow">
                        {photo.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-16 items-center justify-center bg-background/70 backdrop-blur-sm border border-border rounded-l-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover/row:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default LatestPhotoRow;
