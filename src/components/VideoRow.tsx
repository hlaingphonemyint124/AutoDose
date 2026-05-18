import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getYouTubeFallbackThumbnail, getYouTubeThumbnail } from "@/lib/youtube";

export interface RowVideo {
  id: string;
  title: string;
  category: string | null;
  storage_url: string;
  hls_url?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  source_type?: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  description?: string | null;
  progress_pct?: number;
}

interface Props {
  title: string;
  videos: RowVideo[];
  onSelect: (video: RowVideo) => void;
  variant?: "compact" | "featured";
}

const VideoRow = ({ title, videos, onSelect, variant = "compact" }: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!videos.length) return null;

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  const isFeatured = variant === "featured";

  return (
    <section
      className={
        isFeatured
          ? "group/row relative overflow-hidden border-y border-primary/10 bg-[radial-gradient(circle_at_50%_0%,hsla(var(--primary)/0.11),transparent_34%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.72)_48%,hsl(var(--background))_100%)] py-8 md:py-10"
          : "group/row relative py-8"
      }
    >
      {isFeatured && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      )}

      <div className={`${isFeatured ? "px-5 md:px-12 lg:px-16" : "px-4 md:px-12"} mb-5 flex items-end justify-between`}>
        <motion.h2
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`${isFeatured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"} font-orbitron font-bold text-foreground flex items-center gap-3`}
        >
          <span className={`${isFeatured ? "h-7 w-1" : "h-4 w-1"} block bg-primary rounded-full shadow-glow`} />
          {title}
        </motion.h2>
        {isFeatured && (
          <p className="hidden max-w-md text-right text-sm leading-relaxed text-muted-foreground md:block">
            Fresh AUTODOSE films, meet coverage, build features, and street sessions.
          </p>
        )}
      </div>

      <div className="relative auto-perspective">
        {/* Left fade + arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`${isFeatured ? "w-24" : "w-16"} absolute left-0 top-0 bottom-5 z-10 pointer-events-none`}
              style={{ background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)" }}
            />
          )}
        </AnimatePresence>
        <button
          onClick={() => scroll("left")}
          className={`${isFeatured ? "left-4 h-16 w-12" : "left-2 h-14 w-10"} hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 items-center justify-center bg-background/80 border border-border rounded-r-lg text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 opacity-0 group-hover/row:opacity-100 shadow-md hover:shadow-glow active:scale-95`}
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className={`${isFeatured ? "gap-4 px-5 pb-5 md:gap-5 md:px-12 lg:px-16" : "gap-3.5 px-4 pb-5 md:px-12 md:gap-4"} flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-hide`}
        >
          {videos.map((video, i) => {
            const thumb = video.thumbnail_url || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.35), ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, y: -7, zIndex: 5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(video)}
                className={`${isFeatured ? "w-[82vw] rounded-lg border-primary/20 md:w-[520px] lg:w-[620px]" : "w-[280px] rounded-md border-border md:w-[340px]"} group/card relative aspect-video flex-shrink-0 snap-start cursor-pointer overflow-hidden border bg-card shadow-card card-glow-hover transform-gpu transition-colors duration-300`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={video.title}
                    onError={(e) => {
                      const fb = getYouTubeFallbackThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
                      if (fb && (e.target as HTMLImageElement).src !== fb) (e.target as HTMLImageElement).src = fb;
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-108"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="text-primary" size={40} />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className={`${isFeatured ? "opacity-100" : "opacity-80 md:opacity-0"} absolute inset-0 bg-gradient-to-t from-black/92 via-black/22 to-transparent transition-opacity duration-300 group-hover/card:opacity-100`} />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent cinematic-scan opacity-0 group-hover/card:opacity-100" />
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-all duration-300 md:opacity-0 md:group-hover/card:opacity-100">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`${isFeatured ? "h-16 w-16 md:h-20 md:w-20" : "h-14 w-14"} grid place-items-center rounded-full border border-white/20 bg-primary shadow-glow transition-shadow duration-300 group-hover/card:shadow-intense`}
                  >
                    <Play className="text-primary-foreground ml-0.5" size={isFeatured ? 30 : 22} fill="currentColor" />
                  </motion.div>
                </div>

                {/* Duration badge */}
                {video.duration && (
                  <div className="duration-badge opacity-100 group-hover/card:opacity-0 transition-opacity duration-200">
                    {video.duration}
                  </div>
                )}

                {/* Title on hover */}
                <div className={`${isFeatured ? "p-5 md:p-6 md:opacity-100 md:translate-y-0" : "p-3.5 md:opacity-0 md:translate-y-1 md:group-hover/card:opacity-100 md:group-hover/card:translate-y-0"} absolute bottom-0 left-0 right-0 opacity-100 transition-all duration-300`}>
                  <h3 className={`${isFeatured ? "text-lg md:text-2xl font-orbitron" : "text-sm md:text-base"} font-semibold text-white line-clamp-2 drop-shadow-md`}>
                    {video.title}
                  </h3>
                  {video.category && (
                    <p className={`${isFeatured ? "mt-2 text-xs uppercase tracking-[0.2em]" : "mt-1 text-[11px] capitalize tracking-wide"} text-white/65`}>{video.category}</p>
                  )}
                </div>

                {/* Progress bar */}
                {typeof video.progress_pct === "number" && video.progress_pct > 0 && (
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(video.progress_pct, 100)}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Right fade + arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`${isFeatured ? "w-24" : "w-16"} absolute right-0 top-0 bottom-5 z-10 pointer-events-none`}
              style={{ background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)" }}
            />
          )}
        </AnimatePresence>
        <button
          onClick={() => scroll("right")}
          className={`${isFeatured ? "right-4 h-16 w-12" : "right-2 h-14 w-10"} hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 items-center justify-center bg-background/80 border border-border rounded-l-lg text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 opacity-0 group-hover/row:opacity-100 shadow-md hover:shadow-glow active:scale-95`}
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
};

export default VideoRow;
