import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getYouTubeFallbackThumbnail, getYouTubeThumbnail, isFacebookVideoUrl } from "@/lib/youtube";

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
            const isFacebook = video.source_type === "facebook" || isFacebookVideoUrl(video.storage_url);
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
                className={`${isFeatured ? "w-[72vw] rounded-lg border-primary/20 md:w-[360px] lg:w-[420px]" : "w-[260px] rounded-md border-border md:w-[300px]"} group/card relative aspect-video flex-shrink-0 snap-start cursor-pointer overflow-hidden border bg-card shadow-card card-glow-hover transform-gpu transition-colors duration-300`}
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
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-108"
                  />
                ) : isFacebook ? (
                  /* Facebook video with no thumbnail — branded placeholder */
                  <div className="w-full h-full bg-gradient-to-br from-[#0d1b2e] via-[#0f1f3d] to-[#1a1a2e] flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="#1877F2" className="w-7 h-7">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Facebook Video</p>
                  </div>
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
                    className={`${isFeatured ? "h-14 w-14 md:h-16 md:w-16" : "h-14 w-14"} grid place-items-center rounded-full border border-white/20 bg-primary shadow-glow transition-shadow duration-300 group-hover/card:shadow-intense`}
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

                {/* Facebook badge */}
                {isFacebook && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1877F2]/90 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide shadow-lg">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
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
