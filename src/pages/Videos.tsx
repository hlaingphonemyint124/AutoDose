import { useState, useEffect, useMemo, useRef } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Play, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Comments } from "@/components/Comments";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import ProVideoPlayer, { Chapter, PlayerVideo } from "@/components/ProVideoPlayer";
import UpNextOverlay from "@/components/UpNextOverlay";
import { getYouTubeFallbackThumbnail, getYouTubeThumbnail } from "@/lib/youtube";

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
}

const Videos = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showUpNext, setShowUpNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useWatchProgress(videoRef, selectedVideo?.id);

  const categories = ["all", "photoshoots", "vlogs", "reviews", "tutorials"];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos((data || []) as unknown as Video[]);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos =
    activeFilter === "all"
      ? videos
      : videos.filter((video) => video.category === activeFilter);

  const upNext = useMemo<Video | null>(() => {
    if (!selectedVideo) return null;
    const same = videos.filter((v) => v.category === selectedVideo.category);
    const idx = same.findIndex((v) => v.id === selectedVideo.id);
    if (idx === -1) return null;
    return same[idx + 1] ?? null;
  }, [selectedVideo, videos]);

  const playUpNext = () => {
    if (!upNext) return;
    setShowUpNext(false);
    setSelectedVideo(upNext);
  };

  const playerVideo: PlayerVideo | null = selectedVideo
    ? {
        id: selectedVideo.id,
        title: selectedVideo.title,
        storage_url: selectedVideo.storage_url,
        hls_url: selectedVideo.hls_url,
        youtube_url: selectedVideo.youtube_url,
        youtube_video_id: selectedVideo.youtube_video_id,
        source_type: selectedVideo.source_type,
        thumbnail_url: selectedVideo.thumbnail_url,
        chapters: selectedVideo.chapters ?? [],
      }
    : null;

  const videoJsonLd = filteredVideos.slice(0, 20).map((v) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: `${v.title} — ${v.category} | AUTODOSE`,
    thumbnailUrl: (v.thumbnail_url || getYouTubeThumbnail(v.youtube_video_id || v.youtube_url || v.storage_url))
      ? [v.thumbnail_url || getYouTubeThumbnail(v.youtube_video_id || v.youtube_url || v.storage_url)]
      : undefined,
    contentUrl: v.youtube_url || v.storage_url,
    uploadDate: new Date().toISOString(),
    duration: v.duration ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="Video Gallery — JDM Vlogs, Reviews & Tutorials"
        description="Watch the latest AUTODOSE JDM videos: photoshoots, vlogs, car reviews, and photography tutorials."
        type="video.other"
        image={selectedVideo?.thumbnail_url ?? undefined}
        jsonLd={videoJsonLd}
      />
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold text-foreground mb-4">
              Video <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch our latest JDM content, vlogs, and photography tutorials
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Filter className="text-primary self-center" size={20} />
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setActiveFilter(category)}
                variant={activeFilter === category ? "default" : "outline"}
                className={
                  activeFilter === category
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border hover:bg-card"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No videos found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, index) => {
                const thumb = video.thumbnail_url || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
                return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-glow transition-all duration-300"
                >
                  <div
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => {
                      setShowUpNext(false);
                      setSelectedVideo(video);
                    }}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={video.title}
                        onError={(event) => {
                          const fallback = getYouTubeFallbackThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
                          if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Play className="text-primary" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="text-white ml-1" size={28} fill="white" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize mt-2">
                      {video.category}
                    </p>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}

          <Dialog
            open={!!selectedVideo}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedVideo(null);
                setShowUpNext(false);
              }
            }}
          >
            <DialogContent className="max-w-7xl p-0 bg-background max-h-[95vh] overflow-y-auto">
              <DialogTitle className="sr-only">Video Player</DialogTitle>
              <DialogDescription className="sr-only">
                Watch {selectedVideo?.title}
              </DialogDescription>
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setShowUpNext(false);
                }}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
              {playerVideo && (
                <div className="p-4 md:p-6 space-y-6">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
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
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedVideo?.title}
                      </h2>
                      <p className="text-muted-foreground capitalize">
                        {selectedVideo?.category}
                      </p>
                    </div>
                    <Comments videoId={selectedVideo!.id} />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Videos;
