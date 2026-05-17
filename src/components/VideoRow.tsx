import { useRef } from "react";
import { motion } from "framer-motion";
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
}

const VideoRow = ({ title, videos, onSelect }: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!videos.length) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-8 group/row">
      <div className="px-4 md:px-12 mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-orbitron font-bold text-foreground">
          {title}
        </h2>
      </div>

      <div className="relative">
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
          className="flex gap-4 overflow-x-auto scroll-smooth px-4 md:px-12 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video, i) => {
            const thumb = video.thumbnail_url || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
            return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              whileHover={{ scale: 1.06, y: -4, zIndex: 5 }}
              onClick={() => onSelect(video)}
              className="relative flex-shrink-0 w-[280px] md:w-[340px] aspect-video rounded-lg overflow-hidden cursor-pointer bg-card border border-border shadow-card group/card"
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={video.title}
                  onError={(event) => {
                    const fallback = getYouTubeFallbackThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
                    if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="text-primary" size={40} />
                </div>
              )}

              {/* Hover overlay - dark vignette for legibility in both themes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
                  <Play className="text-primary-foreground ml-1" size={24} fill="currentColor" />
                </div>
              </div>

              {/* Duration */}
              {video.duration && (
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-foreground font-medium">
                  {video.duration}
                </div>
              )}

              {/* Title - shown on hover, white over dark vignette */}
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2 drop-shadow-md">
                  {video.title}
                </h3>
                {video.category && (
                  <p className="text-xs text-white/80 capitalize mt-1 drop-shadow">{video.category}</p>
                )}
              </div>

              {/* Progress bar (Continue Watching) */}
              {typeof video.progress_pct === "number" && video.progress_pct > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/60">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(video.progress_pct, 100)}%` }}
                  />
                </div>
              )}
            </motion.div>
            );
          })}
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

export default VideoRow;
