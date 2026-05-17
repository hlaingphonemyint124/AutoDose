import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Heart, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getYouTubeEmbedUrl, getYouTubeFallbackThumbnail, getYouTubeThumbnail, isYouTubeVideo } from "@/lib/youtube";

interface Video {
  id: string;
  title: string;
  storage_url: string;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  source_type?: string | null;
  thumbnail_url: string | null;
  category: string | null;
  duration: string | null;
  likes: number | null;
}

const LatestVideosSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedVideos = async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, title, storage_url, thumbnail_url, category, duration, likes, source_type, youtube_url, youtube_video_id")
        .eq("is_homepage_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setVideos(data || []);
      setLoading(false);
    };
    fetchFeaturedVideos();
  }, []);

  if (loading) return null;
  if (videos.length === 0) return null;

  return (
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-primary font-inter text-sm uppercase tracking-widest mb-2">Featured</p>
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-foreground">
              LATEST <span className="text-primary">VIDEOS</span>
            </h2>
          </div>
          <Link to="/videos">
            <Button variant="outline" className="hidden md:flex gap-2 border-border hover:border-primary hover:text-primary">
              View All
              <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>

        <div className={`grid gap-6 ${videos.length === 1 ? "grid-cols-1 max-w-2xl mx-auto" : videos.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
          {videos.map((video, index) => {
            const thumb = video.thumbnail_url || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
            const youtubeEmbedUrl = getYouTubeEmbedUrl(video.youtube_video_id || video.youtube_url || video.storage_url, {
              autoplay: true,
              controls: true,
            });
            return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300"
            >
              {/* Video / Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-secondary">
                {playingId === video.id ? (
                  isYouTubeVideo(video) && youtubeEmbedUrl ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      title={video.title}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={video.storage_url}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                      onEnded={() => setPlayingId(null)}
                    />
                  )
                ) : (
                  <>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={video.title}
                        onError={(event) => {
                          const fallback = getYouTubeFallbackThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url);
                          if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <Play size={48} className="text-muted-foreground" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div
                      className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                      onClick={() => setPlayingId(video.id)}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-glow-intense">
                        <Play className="text-primary-foreground ml-1" size={28} fill="currentColor" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-background/90 rounded text-xs font-inter font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        {video.duration}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                {video.category && (
                  <span className="text-primary text-xs font-inter uppercase tracking-wider">{video.category}</span>
                )}
                <h3 className="text-foreground font-orbitron font-bold mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Heart size={12} />
                  <span>{video.likes || 0} likes</span>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Link to="/videos">
            <Button variant="outline" className="gap-2 border-border hover:border-primary hover:text-primary">
              View All Videos
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestVideosSection;
