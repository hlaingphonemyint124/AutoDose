import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Filter, X, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Comments } from "@/components/Comments";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import ProVideoPlayer, { Chapter, PlayerVideo } from "@/components/ProVideoPlayer";
import UpNextOverlay from "@/components/UpNextOverlay";
import { getYouTubeFallbackThumbnail, getYouTubeThumbnail, isFacebookVideoUrl } from "@/lib/youtube";

interface Video {
  id: string;
  title: string;
  category: string;
  storage_url: string;
  hls_url: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  source_type: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  likes: number;
  chapters: Chapter[] | null;
  created_at?: string;
}

const CATEGORIES = ["all", "photoshoots", "vlogs", "reviews", "tutorials"];

/* Card component memoised to avoid re-renders */
const VideoCard = ({
  video, index, onClick,
}: { video: Video; index: number; onClick: () => void }) => {
  const thumb = video.thumbnail_url
    || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
  const isFB = video.source_type === "facebook" || isFacebookVideoUrl(video.storage_url);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.22,1,0.36,1] }}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_32px_hsla(var(--primary)/0.15)] cursor-pointer contain-paint"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Play ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumb ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 shimmer" />}
            <img
              src={thumb}
              alt={video.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                const fb = getYouTubeFallbackThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
                if (fb && (e.currentTarget as HTMLImageElement).src !== fb)
                  (e.currentTarget as HTMLImageElement).src = fb;
              }}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : isFB ? (
          <div className="w-full h-full bg-gradient-to-br from-[#0d1b2e] to-[#1a1a2e] flex flex-col items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="#1877F2" className="w-10 h-10 opacity-60">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Facebook</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="text-primary/40" size={40} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_24px_hsla(var(--primary)/0.7)] scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="text-white ml-1" size={22} fill="white" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {video.duration && (
            <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock size={9} /> {video.duration}
            </span>
          )}
        </div>
        {isFB && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1877F2]/90 text-white text-[10px] font-semibold">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 md:p-5">
        <span className="inline-block text-[10px] uppercase tracking-wider text-primary/80 font-orbitron font-bold mb-1.5 capitalize">
          {video.category}
        </span>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug text-sm md:text-base">
          {video.title}
        </h3>
      </div>

      {/* Bottom shimmer line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
    </motion.article>
  );
};

const Videos = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUpNext, setShowUpNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useWatchProgress(videoRef, selectedVideo?.id);

  useEffect(() => {
    supabase
      .from("videos")
      .select("id,title,category,storage_url,hls_url,thumbnail_url,duration,description,chapters,created_at,source_type,youtube_url,youtube_video_id,likes")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Videos fetch:", error.message);
        setVideos((data || []) as unknown as Video[]);
        setLoading(false);
      })
      .catch((e) => { console.error("Videos catch:", e); setLoading(false); });
  }, []);

  const filteredVideos = useMemo(() =>
    activeFilter === "all" ? videos : videos.filter((v) => v.category === activeFilter),
    [activeFilter, videos]
  );

  const upNext = useMemo<Video | null>(() => {
    if (!selectedVideo) return null;
    const same = videos.filter((v) => v.category === selectedVideo.category);
    const idx = same.findIndex((v) => v.id === selectedVideo.id);
    return same[idx + 1] ?? null;
  }, [selectedVideo, videos]);

  const playUpNext = useCallback(() => {
    if (!upNext) return;
    setShowUpNext(false);
    setSelectedVideo(upNext);
  }, [upNext]);

  const handleClose = useCallback(() => {
    setSelectedVideo(null);
    setShowUpNext(false);
  }, []);

  const playerVideo: PlayerVideo | null = selectedVideo ? {
    id: selectedVideo.id,
    title: selectedVideo.title,
    storage_url: selectedVideo.storage_url,
    hls_url: selectedVideo.hls_url,
    youtube_url: selectedVideo.youtube_url,
    youtube_video_id: selectedVideo.youtube_video_id,
    source_type: selectedVideo.source_type,
    thumbnail_url: selectedVideo.thumbnail_url,
    chapters: selectedVideo.chapters ?? [],
  } : null;

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="Videos — JDM Vlogs, Reviews & Cinematic Content"
        description="Watch the latest AUTODOSE JDM videos: photoshoots, vlogs, car reviews, and photography tutorials."
        type="video.other"
      />
      <Navbar />

      <div className="pt-28 md:pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
            className="text-center mb-10 md:mb-14"
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-orbitron mb-3 px-3 py-1 border border-primary/30 rounded-full bg-primary/5">
              Watch Now
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-bold text-foreground mb-4">
              Video <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Cinematic automotive content — JDM meets, builds, and street sessions.
            </p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-12"
          >
            <Filter className="text-primary/50" size={16} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 press-effect capitalize ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_14px_hsla(var(--primary)/0.4)]"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat === "all" ? "All Videos" : cat}
              </button>
            ))}
          </motion.div>

          {/* Count */}
          <AnimatePresence mode="wait">
            <motion.p
              key={filteredVideos.length + activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground text-center mb-6"
            >
              {loading ? "Loading…" : `${filteredVideos.length} video${filteredVideos.length !== 1 ? "s" : ""}`}
            </motion.p>
          </AnimatePresence>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                  <div className="aspect-video shimmer" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-16 shimmer rounded" />
                    <div className="h-4 w-full shimmer rounded" />
                    <div className="h-4 w-3/4 shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-muted-foreground"
            >
              <Play className="mx-auto mb-4 text-primary/30" size={48} />
              <p className="text-lg font-medium">No videos in this category yet.</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              <AnimatePresence>
                {filteredVideos.map((video, i) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    index={i}
                    onClick={() => { setShowUpNext(false); setSelectedVideo(video); }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-5xl p-0 bg-background border-border/50 max-h-[95vh] overflow-y-auto">
          <DialogTitle className="sr-only">Video Player — {selectedVideo?.title}</DialogTitle>
          <DialogDescription className="sr-only">Watch {selectedVideo?.title}</DialogDescription>
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary hover:bg-primary/10 border border-border transition-all press-effect"
          >
            <X size={18} />
          </button>
          {playerVideo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-6 space-y-5"
            >
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                <ProVideoPlayer
                  video={playerVideo}
                  videoRef={videoRef}
                  onEnded={() => upNext && setShowUpNext(true)}
                  upNextLabel={upNext?.title}
                  onUpNextClick={playUpNext}
                />
                {showUpNext && upNext && (
                  <UpNextOverlay
                    nextTitle={upNext.title}
                    nextThumb={upNext.thumbnail_url}
                    onPlayNow={playUpNext}
                    onCancel={() => setShowUpNext(false)}
                  />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs text-primary font-orbitron uppercase tracking-wider capitalize">
                  {selectedVideo?.category}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug">
                  {selectedVideo?.title}
                </h2>
              </div>
              <Comments videoId={selectedVideo!.id} />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Videos;
