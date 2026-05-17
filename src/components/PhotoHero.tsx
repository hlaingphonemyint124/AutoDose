import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HeroPhoto {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
}

const ROTATE_MS = 6000;

const PhotoHero = () => {
  const [photos, setPhotos] = useState<HeroPhoto[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      // Pull from the admin-managed slideshow_photos table so the homepage
      // hero stays in sync with the Admin Dashboard "Slideshow" tab.
      const { data: slideshow } = await supabase
        .from("slideshow_photos")
        .select("id, title, storage_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(8);

      let list: HeroPhoto[] = (slideshow ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        storage_url: p.storage_url,
        category: null,
      }));

      // Fallback to featured/latest photos if no slideshow photos are configured
      if (list.length === 0) {
        const { data: featured } = await supabase
          .from("photos")
          .select("id, title, storage_url, category")
          .eq("is_homepage_featured", true)
          .order("created_at", { ascending: false })
          .limit(5);
        list = featured ?? [];
      }
      if (list.length === 0) {
        const { data: latest } = await supabase
          .from("photos")
          .select("id, title, storage_url, category")
          .order("created_at", { ascending: false })
          .limit(5);
        list = latest ?? [];
      }
      setPhotos(list);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [photos.length]);

  if (loading) {
    return <div className="relative h-[55vh] md:h-[85vh] bg-card animate-pulse" />;
  }
  if (photos.length === 0) return null;

  const current = photos[index];

  return (
    <section className="relative h-[55vh] md:h-[85vh] w-full overflow-hidden bg-background">
      {/* Rotating background photo */}
      <AnimatePresence mode="sync">
        <motion.img
          key={current.id}
          src={current.storage_url}
          alt={current.title}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </AnimatePresence>

      {/* Cinematic gradients (theme-independent dark vignette) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-12 md:pb-24 px-4 sm:px-6 md:px-12">
        <motion.div
          key={current.id + "-text"}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl space-y-4 md:space-y-6"
        >
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary font-orbitron">
            <Camera size={14} />
            Featured Photography
            {current.category && <span className="text-muted-foreground">· {current.category}</span>}
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-orbitron font-bold text-white leading-tight drop-shadow-lg">
            {current.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl drop-shadow">
            Step into the AUTODOSE gallery — a curated collection of JDM photography capturing
            speed, style and Japanese automotive soul.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/gallery">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow"
              >
                <ImageIcon className="mr-2" size={18} />
                Explore Gallery
              </Button>
            </Link>
            <Link to="/gallery">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                View All
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Pagination dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 right-4 sm:right-6 md:right-12 z-20 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-4 bg-foreground/30 hover:bg-foreground/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PhotoHero;
