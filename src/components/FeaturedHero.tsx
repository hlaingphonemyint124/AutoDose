import { useEffect, useMemo, useRef, useState, useCallback, type PointerEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { getYouTubeFallbackThumbnail, getYouTubeThumbnail } from "@/lib/youtube";
import heroImage from "@/assets/hero-jdm.jpg";

interface FeaturedVideo {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  storage_url: string;
  hls_url?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  source_type?: string | null;
  thumbnail_url: string | null;
  duration?: string | null;
}

interface Props {
  onPlay: (video: FeaturedVideo) => void;
}

const ROTATE_MS = 8000;

const fallbackSlide: FeaturedVideo = {
  id: "autodose-fallback",
  title: "AUTODOSE Visual Garage",
  description: "Automotive photography, film work, and culture-driven stories from Myanmar streets to midnight meets.",
  category: "Automotive Studio",
  storage_url: "",
  thumbnail_url: heroImage,
};

const getPoster = (video: FeaturedVideo) =>
  video.thumbnail_url ||
  getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url) ||
  heroImage;

/** Static thumbnail background — no autoplay video or iframe */
const HeroMotionBackground = ({
  video,
  poster,
  reduceMotion: _reduceMotion,
}: {
  video: FeaturedVideo;
  poster: string;
  reduceMotion: boolean;
}) => {
  const [imgSrc, setImgSrc] = useState(poster);
  useEffect(() => { setImgSrc(poster); }, [poster]);

  return (
    <img
      key={`poster-${video.id}`}
      src={imgSrc}
      alt=""
      className="absolute inset-0 h-full w-full object-cover hero-cinematic-backdrop"
      aria-hidden="true"
      onError={() => {
        const fb =
          getYouTubeFallbackThumbnail(
            video.youtube_video_id || video.youtube_url || video.storage_url
          ) || heroImage;
        if (imgSrc !== fb) setImgSrc(fb);
      }}
    />
  );
};

// Animated SVG progress ring around pause button
const ProgressRing = ({ active, paused, duration }: { active: boolean; paused: boolean; duration: number }) => {
  const r = 14;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="36" height="36" className="absolute inset-0 pointer-events-none" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      {active && !paused && (
        <motion.circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </svg>
  );
};

const FeaturedHero = ({ onPlay }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const springX = useSpring(pointerX, { stiffness: 55, damping: 22 });
  const springY = useSpring(pointerY, { stiffness: 55, damping: 22 });
  const rotateX = useTransform(springY, [-1, 1], reduceMotion ? [0, 0] : [4, -4]);
  const rotateY = useTransform(springX, [-1, 1], reduceMotion ? [0, 0] : [-7, 7]);
  const lightX = useTransform(springX, [-1, 1], reduceMotion ? [0, 0] : [-20, 20]);
  const lightY = useTransform(springY, [-1, 1], reduceMotion ? [0, 0] : [-12, 12]);

  const slides = videos.length ? videos : [fallbackSlide];
  const active = slides[activeIndex] ?? slides[0];
  const poster = useMemo(() => getPoster(active), [active]);

  const goToSlide = useCallback((index: number) => {
    setPrevIndex(activeIndex);
    setActiveIndex(index);
  }, [activeIndex]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (!hasSupabaseConfig) { setLoading(false); return; }

      const { data } = await supabase
        .from("videos")
        .select("id, title, description, category, storage_url, hls_url, thumbnail_url, duration, source_type, youtube_url, youtube_video_id")
        .eq("is_homepage_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (data && data.length > 0) {
        setVideos(data as unknown as FeaturedVideo[]);
      } else {
        const { data: latest } = await supabase
          .from("videos")
          .select("id, title, description, category, storage_url, hls_url, thumbnail_url, duration, source_type, youtube_url, youtube_video_id")
          .order("created_at", { ascending: false })
          .limit(6);
        if (latest && latest.length > 0) setVideos(latest as unknown as FeaturedVideo[]);
      }
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        setPrevIndex(current);
        return (current + 1) % slides.length;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const handlePlay = () => {
    if (active.id !== fallbackSlide.id) { onPlay(active); return; }
    document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handlePointerLeave = () => { pointerX.set(0); pointerY.set(0); };

  if (loading) {
    return (
      <section ref={sectionRef} className="relative h-[86vh] min-h-[640px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(200,0,0,0.06),transparent_55%)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-32 left-8 right-8 space-y-4 max-w-xl">
          <div className="h-2.5 w-28 bg-white/10 rounded-full animate-pulse" />
          <div className="h-12 w-96 bg-white/12 rounded animate-pulse" style={{ animationDelay: "0.1s" }} />
          <div className="h-4 w-72 bg-white/8 rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-32 bg-primary/30 rounded-md animate-pulse" />
            <div className="h-11 w-28 bg-white/10 rounded-md animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative h-[90svh] min-h-[640px] w-full overflow-hidden bg-black text-white"
    >
      {/* Layered background crossfade */}
      <div className="absolute inset-0">
        {/* Outgoing slide */}
        <AnimatePresence>
          {prevIndex !== null && prevIndex !== activeIndex && slides[prevIndex] && (
            <motion.div
              key={`prev-${slides[prevIndex].id}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-[-5%] overflow-hidden"
            >
              <img
                src={getPoster(slides[prevIndex])}
                alt=""
                className="absolute inset-0 h-full w-full object-cover hero-cinematic-backdrop"
                aria-hidden="true"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active slide */}
        <motion.div
          key={`active-${active.id}`}
          initial={{ opacity: 0, scale: 1.10 }}
          animate={{ opacity: 1, scale: reduceMotion ? 1.03 : 1.06 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-[-5%] overflow-hidden will-change-transform"
        >
          <HeroMotionBackground video={active} poster={poster} reduceMotion={!!reduceMotion} />
          <img
            src={poster}
            alt=""
            onError={(e) => {
              const fb = getYouTubeFallbackThumbnail(active.youtube_video_id || active.youtube_url || active.storage_url);
              if (fb && (e.target as HTMLImageElement).src !== fb) (e.target as HTMLImageElement).src = fb;
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-screen"
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* Cinematic light rays */}
      <motion.div aria-hidden="true" style={{ x: lightX, y: lightY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8%] top-[18%] h-[2px] w-[42%] rotate-[-14deg] bg-gradient-to-r from-transparent via-primary/80 to-transparent blur-[1px]" />
        <div className="absolute right-[-10%] top-[40%] h-[1px] w-[50%] rotate-[-14deg] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute bottom-[22%] left-[6%] h-[1px] w-[36%] rotate-[-14deg] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      </motion.div>

      {/* Gradient vignettes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(255,255,255,0.09),transparent_26%),linear-gradient(90deg,rgba(0,0,0,0.95),rgba(0,0,0,0.44)_52%,rgba(0,0,0,0.70))]" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-7 pt-24 sm:px-10 sm:pb-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ y: copyY, opacity: copyOpacity }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex flex-col w-full gap-5"
        >
          {/* Left copy */}
          <div className="max-w-2xl space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-primary sm:text-[11px] sm:tracking-[0.32em]"
            >
              <motion.span
                className="h-px bg-primary"
                initial={{ width: 0 }}
                animate={{ width: 44 }}
                transition={{ duration: 0.9, delay: 0.35 }}
              />
              <span>Featured {active.category ? `· ${active.category}` : "Production"}</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id + "-copy"}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -22, filter: "blur(8px)" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <h1 className="text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-orbitron">
                  {active.title}
                </h1>
                <p className="max-w-xl line-clamp-2 text-sm leading-relaxed text-white/55 sm:text-base">
                  {active.description ||
                    "Cinematic automotive photography and videography built for launches, meets, builds, and stories that deserve more than a quick scroll."}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                size="lg"
                onClick={handlePlay}
                className="h-12 rounded-md bg-primary px-6 font-semibold text-primary-foreground shadow-glow hover:bg-primary/90 btn-red-glow transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              >
                <Play className="mr-2" size={18} fill="currentColor" />
                Watch Film
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" })}
                className="h-12 rounded-md border-white/25 bg-white/8 px-6 text-white hover:bg-white/15 hover:text-white hover:border-white/45 transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              >
                View Work
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </motion.div>


          </div>

          {/* Thumbnail strip — Netflix style bottom row */}
          {slides.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="flex items-end gap-2 sm:gap-3"
            >
              <button
                onClick={() => { const ni = (activeIndex - 1 + slides.length) % slides.length; setPrevIndex(activeIndex); setActiveIndex(ni); }}
                className="hidden sm:flex shrink-0 mb-0.5 h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/50 hover:border-white/45 hover:text-white transition-all duration-150 focus:outline-none"
                aria-label="Previous"
              ><ChevronLeft size={15} /></button>

              <div className="flex flex-1 gap-2 sm:gap-2.5 overflow-hidden">
                {slides.map((slide, index) => {
                  const thumbSrc = slide.thumbnail_url || getYouTubeThumbnail(slide.youtube_video_id || slide.youtube_url || slide.storage_url) || heroImage;
                  const isActive = index === activeIndex;
                  return (
                    <motion.button
                      key={slide.id}
                      onClick={() => { setPrevIndex(activeIndex); setActiveIndex(index); }}
                      className="relative shrink-0 rounded-sm focus:outline-none group"
                      style={{ width: "clamp(66px, 10.5vw, 114px)" }}
                      animate={{ opacity: isActive ? 1 : 0.42, scale: isActive ? 1 : 0.93 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      aria-label={slide.title}
                    >
                      <div className="aspect-video w-full overflow-hidden rounded-sm">
                        <img
                          src={thumbSrc}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          aria-hidden="true"
                          onError={(e) => {
                            const fb = getYouTubeFallbackThumbnail(slide.youtube_video_id || slide.youtube_url || slide.storage_url);
                            if (fb && (e.target as HTMLImageElement).src !== fb) (e.target as HTMLImageElement).src = fb;
                          }}
                        />
                      </div>
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-sm pointer-events-none"
                          style={{ boxShadow: "0 0 0 2px #dc2626, 0 0 12px rgba(220,38,38,0.5)" }}
                        />
                      )}
                      {isActive && (
                        <motion.div
                          key={"pb-" + activeIndex}
                          className="absolute bottom-0 left-0 h-[3px] bg-primary rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: paused ? "0%" : "100%" }}
                          transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <button
                onClick={() => { const ni = (activeIndex + 1) % slides.length; setPrevIndex(activeIndex); setActiveIndex(ni); }}
                className="hidden sm:flex shrink-0 mb-0.5 h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/50 hover:border-white/45 hover:text-white transition-all duration-150 focus:outline-none"
                aria-label="Next"
              ><ChevronRight size={15} /></button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Slideshow controls */}
      {slides.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="absolute bottom-[4.5rem] right-4 z-20 hidden sm:flex items-center gap-3 sm:right-8 lg:right-12"
        >
          <div className="relative w-9 h-9 flex items-center justify-center">
            <ProgressRing active paused={paused} duration={ROTATE_MS} key={`ring-${activeIndex}-${paused}`} />
            <button
              onClick={() => setPaused((c) => !c)}
              className="absolute inset-0 grid place-items-center rounded-full text-white transition hover:text-primary focus:outline-none"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            >
              {paused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                aria-label={`Show ${slide.title}`}
                className="focus:outline-none"
              >
                <motion.span
                  animate={{
                    width: index === activeIndex ? 30 : 7,
                    backgroundColor: index === activeIndex ? "hsl(var(--primary))" : "rgba(255,255,255,0.28)",
                  }}
                  transition={{ duration: 0.38, ease: "easeInOut" }}
                  className="block h-1.5 rounded-full"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Slide counter */}
      {slides.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="absolute bottom-[4.5rem] left-4 z-20 hidden sm:block sm:left-8 lg:left-12 font-orbitron text-xs text-white/38 tracking-[0.25em] select-none"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Scroll indicator — mouse icon style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/38 md:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/22 flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [0.8, 0.1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-0.5 h-2 rounded-full bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default FeaturedHero;