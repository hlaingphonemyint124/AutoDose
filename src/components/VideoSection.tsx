import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const VideoSection = () => {
  const videos = [
    {
      title: "Night Drift Sessions",
      duration: "12:45",
      views: "250K",
      thumbnail: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
    },
    {
      title: "JDM Legends Showcase",
      duration: "18:30",
      views: "420K",
      thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=450&fit=crop",
    },
    {
      title: "Behind The Scenes",
      duration: "8:15",
      views: "180K",
      thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=450&fit=crop",
    },
  ];

  return (
    <section id="videos" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="text-primary">LATEST</span> VIDEOS
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
            Cinematic storytelling meets automotive passion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border overflow-hidden group cursor-pointer hover:shadow-glow transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-glow-intense">
                        <Play className="text-primary-foreground ml-1" size={28} fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-background/90 rounded text-xs font-inter font-semibold">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-orbitron font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-inter">{video.views} views</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
