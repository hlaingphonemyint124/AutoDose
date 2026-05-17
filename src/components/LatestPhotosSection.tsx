import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
  likes: number | null;
}

const LatestPhotosSection = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPhotos = async () => {
      const { data } = await supabase
        .from("photos")
        .select("id, title, storage_url, category, likes")
        .eq("is_homepage_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      setPhotos(data || []);
      setLoading(false);
    };
    fetchFeaturedPhotos();
  }, []);

  if (loading) return null;
  if (photos.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
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
              LATEST <span className="text-primary">PHOTOS</span>
            </h2>
          </div>
          <Link to="/gallery">
            <Button variant="outline" className="hidden md:flex gap-2 border-border hover:border-primary hover:text-primary">
              View All
              <ArrowRight size={16} />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, scale: 1.015 }}
              className={`group relative overflow-hidden rounded-lg cursor-pointer card-glow-hover shadow-card ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              style={{ aspectRatio: index === 0 ? "16/10" : "4/3" }}
            >
              <Link to="/gallery">
                <img
                  src={photo.storage_url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-foreground font-orbitron font-bold text-sm md:text-base truncate">{photo.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {photo.category && (
                      <span className="text-primary text-xs font-inter uppercase tracking-wider">{photo.category}</span>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Heart size={12} />
                      <span>{photo.likes || 0}</span>
                    </div>
                  </div>
                </div>
                {/* Hover icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow">
                  <Eye size={20} className="text-primary-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Link to="/gallery">
            <Button variant="outline" className="gap-2 border-border hover:border-primary hover:text-primary">
              View All Photos
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestPhotosSection;
