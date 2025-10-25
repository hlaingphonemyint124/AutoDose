import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Comments } from "@/components/Comments";

interface Photo {
  id: string;
  title: string;
  category: string;
  storage_url: string;
}

const Gallery = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="text-primary">PHOTO</span> GALLERY
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
            Capturing the essence of Japanese automotive culture through our lens
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No photos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group overflow-hidden rounded-lg cursor-pointer aspect-[4/3]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.storage_url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    y: hoveredIndex === index ? 0 : 20,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 p-6"
                >
                  <span className="inline-block px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-orbitron font-bold rounded-full mb-2">
                    {photo.category}
                  </span>
                  <h3 className="text-2xl font-orbitron font-bold text-foreground">
                    {photo.title}
                  </h3>
                </motion.div>

                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-7xl p-0 bg-background max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Photo Viewer</DialogTitle>
          <DialogDescription className="sr-only">
            View {selectedPhoto?.title}
          </DialogDescription>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute -top-10 right-0 z-50 text-white hover:text-primary transition-colors"
          >
            <X size={24} />
          </button>
          {selectedPhoto && (
            <div className="p-6 space-y-6">
              <div className="relative">
                <img
                  src={selectedPhoto.storage_url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedPhoto.title}
                    </h2>
                    <p className="text-muted-foreground capitalize">
                      {selectedPhoto.category}
                    </p>
                  </div>
                </div>
                
                <Comments photoId={selectedPhoto.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
