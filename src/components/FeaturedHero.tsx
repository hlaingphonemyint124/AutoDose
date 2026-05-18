import { useEffect, useMemo, useRef, useState, useCallback, type PointerEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Pause, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { getVideoEmbedUrl, getYouTubeFallbackThumbnail, getYouTubeThumbnail, isEmbeddedVideo } from "@/lib/youtube";
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

const HeroMotionBackground = ({
  video,
  poster,
  reduceMotion,
}: {
  video: FeaturedVideo;
  poster: string;
  reduceMotion: boolean;
}) => {
  const [imgSrc, setImgSrc] = useState(poster);
  useEffect(() => { setImgSrc(poster); }, [poster]);
  const embedUrl = getVideoEmbedUrl(video, {
    autoplay: !reduceMotion,
    muted: true,
    controls: false,
    loop: true,
  });
  const canAutoplayMedia = !reduceMotion && (embedUrl || video.storage_url);

  return (
    <>
      {!canAutoplayMedia && (
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
      )}
      {!reduceMotion && embedUrl && (
        <iframe
          key={`embed-bg-${video.id}`}
          src={embedUrl}
          title=""
          className="hero-video-embed hero-cinematic-backdrop opacity-70"
          allow="autoplay; encrypted-media; picture-in-picture"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      {!reduceMotion && !embedUrl && video.storage_url && (
        <video
          key={`native-bg-${video.id}`}
          src={video.storage_url}
          poster={poster}
          muted
          autoPlay
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover hero-cinematic-backdrop opacity-75"
          aria-hidden="true"
        />
      )}
    </>
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
      <section ref={sectionRef} className="relative h-[88svh] min-h-[680px] max-h-[920px] overflow-hidden">
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
      className="relative h-[88svh] min-h-[680px] max-h-[920px] w-full overflow-hidden bg-black text-white"
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
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-28 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ y: copyY, opacity: copyOpacity }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex w-full flex-col gap-5 sm:gap-6"
        >
          <div className="grid items-center gap-5 sm:gap-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(520px,1.14fr)]">
            {/* Left copy */}
            <div className="mx-auto w-full max-w-2xl space-y-4 text-left lg:mx-0">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary sm:text-[11px] sm:tracking-[0.32em]"
              >
                <motion.span
                  className="h-px w-12 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: 44 }}
                  transition={{ duration: 0.9, delay: 0.35 }}
                />
                <span>Featured {active.category ? `- ${active.category}` : "Production"}</span>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id + "-copy"}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -22, filter: "blur(8px)" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4 sm:space-y-5"
                >
                  <h1 className="font-orbitron text-[2rem] font-black leading-[1.08] text-white sm:text-4xl lg:text-5xl xl:text-[3.35rem]">
                    {active.title}
                  </h1>
                  <p className="max-w-xl line-clamp-3 text-sm leading-relaxed text-white/70 sm:text-base lg:text-white/62">
                    {active.description ||
                      "Cinematic automotive photography and videography built for launches, meets, builds, and stories that deserve more than a quick scroll."}
                  </p>
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38 }}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <Button
                  size="lg"
                  onClick={handlePlay}
                  className="h-12 min-w-[150px] rounded-md bg-primary px-5 font-semibold text-primary-foreground shadow-glow transition-all duration-300 hover:scale-[1.04] hover:bg-primary/90 active:scale-[0.97] btn-red-glow sm:px-6"
                >
                  <Play className="mr-2" size={18} fill="currentColor" />
                  Watch Film
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-12 min-w-[150px] rounded-md border-white/25 bg-white/8 px-5 text-white transition-all duration-300 hover:scale-[1.04] hover:border-white/45 hover:bg-white/15 hover:text-white active:scale-[0.97] sm:px-6"
                >
                  View Work
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </motion.div>
            </div>

            {/* Thumbnail cover card over the autoplay hero media */}
            <motion.button
              type="button"
              onClick={handlePlay}
              style={{ rotateX, rotateY }}
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.18, ease: "easeOut" }}
              className="group relative mx-auto aspect-video w-full max-w-[620px] overflow-hidden rounded-[1.1rem] border border-primary/70 bg-black text-left shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_42px_rgba(239,68,68,0.30)] outline-none sm:rounded-[1.35rem] lg:max-w-none lg:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_54px_rgba(239,68,68,0.36)]"
              aria-label={`Play ${active.title}`}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`hero-card-${active.id}`}
                  src={poster}
                  alt={active.title}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  onError={(e) => {
                    const fb = getYouTubeFallbackThumbnail(active.youtube_video_id || active.youtube_url || active.storage_url);
                    if (fb && (e.target as HTMLImageElement).src !== fb) (e.target as HTMLImageElement).src = fb;
                  }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/14 to-transparent" />
              <div className="absolute inset-0 bg-primary/10 mix-blend-screen" />
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/78 sm:left-5 sm:top-5 sm:px-3 sm:py-1.5 sm:text-[10px]">
                <Sparkles size={12} className="text-primary" />
                Hero Preview
              </div>
              {isEmbeddedVideo(active) && (
                <div className="absolute right-3 top-3 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary sm:right-5 sm:top-5 sm:px-3 sm:text-[10px]">
                  Embed
                </div>
              )}
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-primary shadow-[0_0_0_9px_rgba(239,68,68,0.16),0_0_32px_rgba(239,68,68,0.62)] transition duration-300 group-hover:scale-110 sm:h-24 sm:w-24 sm:shadow-[0_0_0_12px_rgba(239,68,68,0.16),0_0_42px_rgba(239,68,68,0.62)]">
                  <Play className="ml-1 text-primary-foreground" size={30} fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                <p className="font-orbitron text-sm font-bold text-white line-clamp-1 sm:text-lg">{active.title}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/48 sm:text-xs sm:tracking-[0.22em]">
                  {active.duration ? `${active.duration} / ` : ""}{active.category || "AUTODOSE"}
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Slideshow controls */}
      {slides.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="absolute bottom-8 right-4 z-20 hidden sm:flex items-center gap-3 sm:right-8 lg:right-12"
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
          className="absolute bottom-8 left-4 z-20 hidden sm:block sm:left-8 lg:left-12 font-orbitron text-xs text-white/38 tracking-[0.25em] select-none"
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
