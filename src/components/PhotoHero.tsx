import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Camera, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HeroPhoto {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
}

const ROTATE_MS = 6500;

function wrapIndex(i: number, len: number): number {
  if (len < 1) return 0;
  return ((i % len) + len) % len;
}

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
      setIndex(0);
      setPrevIndex(null);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (photos.length < 1) return;
      const from = wrapIndex(index, photos.length);
      const safeNext = wrapIndex(next, photos.length);
      setPrevIndex(from);
      setIndex(safeNext);
    },
    [index, photos.length]
  );

  useEffect(() => {
    if (photos.length < 1) return;
    setIndex((i) => wrapIndex(i, photos.length));
  }, [photos.length]);

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
      <div className="relative h-[88svh] min-h-[680px] max-h-[920px] bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
    );
  }
  if (photos.length === 0) return null;

  const safeIndex = wrapIndex(index, photos.length);
  const current = photos[safeIndex];
  if (!current) return null;

  return (
    <section className="relative h-[88svh] min-h-[680px] max-h-[920px] w-full overflow-hidden bg-black">
      {/* Previous photo fading out */}
      <AnimatePresence>
        {prevIndex !== null &&
          prevIndex >= 0 &&
          prevIndex < photos.length &&
          prevIndex !== safeIndex &&
          photos[prevIndex] && (
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
          loading="eager"
          fetchPriority="high"
          initial={{ opacity: 0, scale: 1.10 }}
          animate={{
            opacity: 1,
            scale: reduceMotion ? 1.02 : 1.06,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        fetchPriority="high"
        />
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/18 to-transparent" />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />

      {/* Content */}
      <motion.div className="relative z-10 flex h-full flex-col justify-end px-4 pb-28 sm:px-6 sm:pb-32 md:px-12 md:pb-36">
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
      </motion.div>

      {photos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-4 rounded-full border border-white/10 bg-black/55 px-5 py-2.5 backdrop-blur-md sm:bottom-8">
          <span className="min-w-[3.25rem] font-orbitron text-[11px] tracking-[0.22em] text-white/40 tabular-nums">
            {String(safeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                className="focus:outline-none"
              >
                <motion.span
                  animate={{
                    width: i === safeIndex ? 22 : 6,
                    backgroundColor: i === safeIndex ? "rgb(239, 68, 68)" : "rgba(255,255,255,0.22)",
                  }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="block h-1.5 rounded-full"
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
