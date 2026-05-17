import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Camera, ArrowRight, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HeroPhoto {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
}

const ROTATE_MS = 6500;

const PhotoHero = () => {
  const [photos, setPhotos] = useState<HeroPhoto[]>([]);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchPhotos = async () => {
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

  const goTo = useCallback((next: number) => {
    setPrevIndex(index);
    setIndex(next);
  }, [index]);

  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => {
        setPrevIndex(i);
        return (i + 1) % photos.length;
      });
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [photos.length]);

  if (loading) {
    return (
      <div className="relative h-[55vh] md:h-[85vh] bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
    );
  }
  if (photos.length === 0) return null;

  const current = photos[index];

  return (
    <section className="relative h-[60vh] md:h-[88vh] w-full overflow-hidden bg-black">
      {/* Previous photo fading out */}
      <AnimatePresence>
        {prevIndex !== null && prevIndex !== index && photos[prevIndex] && (
          <motion.img
            key={`prev-${photos[prevIndex].id}`}
            src={photos[prevIndex].storage_url}
            alt=""
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Current photo — Ken Burns slow zoom */}
      <AnimatePresence>
        <motion.img
          key={`photo-${current.id}`}
          src={current.storage_url}
          alt={current.title}
          initial={{ opacity: 0, scale: 1.10 }}
          animate={{
            opacity: 1,
            scale: reduceMotion ? 1.02 : 1.06,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/18 to-transparent" />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-14 md:pb-28 px-4 sm:px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + "-text"}
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl space-y-4 md:space-y-6"
          >
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary font-orbitron"
            >
              <Camera size={13} />
              Featured Photography
              {current.category && <span className="text-white/50">· {current.category}</span>}
            </motion.span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-orbitron font-bold text-white leading-tight drop-shadow-lg">
              {current.title}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-white/75 max-w-xl drop-shadow">
              Step into the AUTODOSE gallery — a curated collection of JDM photography capturing
              speed, style and Japanese automotive soul.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <Link to="/gallery">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow btn-red-glow hover:scale-[1.04] active:scale-[0.97] transition-transform duration-200"
                >
                  <ImageIcon className="mr-2" size={17} />
                  Explore Gallery
                </Button>
              </Link>
              <Link to="/gallery">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/28 bg-white/10 text-white hover:bg-white/18 hover:text-white hover:border-white/45 hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
                >
                  View All
                  <ArrowRight className="ml-2" size={17} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => goTo((index - 1 + photos.length) % photos.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 md:left-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/15 text-white hover:bg-primary hover:border-primary transition-all duration-200 hover:scale-110 active:scale-90 opacity-0 hover:opacity-100 focus:opacity-100"
            style={{ opacity: undefined }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo((index + 1) % photos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 md:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/15 text-white hover:bg-primary hover:border-primary transition-all duration-200 hover:scale-110 active:scale-90"
            aria-label="Next photo"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicator dots + counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-6 right-4 sm:right-6 md:right-12 z-20 flex items-center gap-3">
          <span className="font-orbitron text-xs text-white/35 tracking-widest">
            {String(index + 1).padStart(2, "0")}/{String(photos.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                className="focus:outline-none"
              >
                <motion.span
                  animate={{
                    width: i === index ? 28 : 7,
                    backgroundColor: i === index ? "hsl(var(--primary))" : "rgba(255,255,255,0.28)",
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="block h-1.5 rounded-full"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoHero;
