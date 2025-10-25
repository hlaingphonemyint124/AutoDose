import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Comments } from "@/components/Comments";

interface Video {
  id: string;
  title: string;
  category: string;
  storage_url: string;
  thumbnail_url: string | null;
  duration: string | null;
}

const Videos = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

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
      setVideos(data || []);
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

  const openVideo = (video: Video) => {
    setVideoLoading(true);
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
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

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
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

          {/* Video Grid */}
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
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-glow transition-all duration-300"
                >
                  <div 
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => openVideo(video)}
                  >
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
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
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {video.category}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Video Player Dialog */}
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-7xl p-0 bg-background max-h-[90vh] overflow-y-auto">
              <DialogTitle className="sr-only">Video Player</DialogTitle>
              <DialogDescription className="sr-only">
                Watch {selectedVideo?.title}
              </DialogDescription>
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 z-50 text-white hover:text-primary transition-colors"
              >
                <X size={24} />
              </button>
              {selectedVideo && (
                <div className="p-6 space-y-6">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      key={selectedVideo.id} // ensures video reloads each time
                      controls
                      autoPlay
                      preload="metadata"
                      className="w-full h-full"
                      onLoadedData={() => setVideoLoading(false)}
                      controlsList="nodownload"
                    >
                      <source src={selectedVideo.storage_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <p className="text-white">Loading video...</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedVideo.title}
                      </h2>
                      <p className="text-muted-foreground capitalize">
                        {selectedVideo.category}
                      </p>
                    </div>
                    <Comments videoId={selectedVideo.id} />
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
