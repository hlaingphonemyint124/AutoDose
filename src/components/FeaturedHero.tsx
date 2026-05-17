import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Film, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import { getYouTubeEmbedUrl, getYouTubeFallbackThumbnail, getYouTubeThumbnail, isYouTubeVideo } from "@/lib/youtube";
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

const ROTATE_MS = 7000;

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
  const youtubeEmbed = isYouTubeVideo(video)
    ? getYouTubeEmbedUrl(video.youtube_video_id || video.youtube_url || video.storage_url, {
        autoplay: true,
        muted: true,
        controls: false,
        loop: true,
      })
    : null;
  const directVideo = !youtubeEmbed ? video.hls_url || video.storage_url : null;

  if (youtubeEmbed && !reduceMotion) {
    return (
      <iframe
        key={`yt-${video.id}`}
        src={youtubeEmbed}
        title={`${video.title} autoplay background`}
        className="hero-video-embed"
        allow="autoplay; encrypted-media; picture-in-picture"
        aria-hidden="true"
        tabIndex={-1}
      />
    );
  }

  if (directVideo && !reduceMotion) {
    return (
      <video
        key={`video-${video.id}`}
        className="absolute inset-0 h-full w-full object-cover"
        src={directVideo}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      key={`poster-${video.id}`}
      src={poster}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      aria-hidden="true"
    />
  );
};

const FeaturedHero = ({ onPlay }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
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

  const heroScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -58]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const rotateX = useTransform(pointerY, [-1, 1], reduceMotion ? [0, 0] : [4, -4]);
  const rotateY = useTransform(pointerX, [-1, 1], reduceMotion ? [0, 0] : [-7, 7]);
  const lightX = useTransform(pointerX, [-1, 1], reduceMotion ? [0, 0] : [-18, 18]);
  const lightY = useTransform(pointerY, [-1, 1], reduceMotion ? [0, 0] : [-10, 10]);

  const slides = videos.length ? videos : [fallbackSlide];
  const active = slides[activeIndex] ?? slides[0];
  const poster = useMemo(() => getPoster(active), [active]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (!hasSupabaseConfig) {
        setLoading(false);
        return;
      }

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
      setActiveIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const handlePlay = () => {
    if (active.id !== fallbackSlide.id) {
      onPlay(active);
      return;
    }
    document.getElementById("latest-releases")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  if (loading) {
    return (
      <section ref={sectionRef} className="relative h-[86vh] min-h-[640px] bg-card animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[900px] w-full overflow-hidden bg-black text-white sm:min-h-[760px] lg:h-[92svh] lg:min-h-[720px]"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: reduceMotion ? 1.04 : 1.08, y: reduceMotion ? 0 : [0, -10, 0] }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: reduceMotion ? 0.8 : 8, ease: "easeInOut" }}
          style={{ scale: heroScale, y: heroY }}
          className="hero-cinematic-backdrop absolute inset-[-5%] overflow-hidden will-change-transform"
        >
          <HeroMotionBackground video={active} poster={poster} reduceMotion={!!reduceMotion} />
          <img
            src={poster}
            alt=""
            onError={(event) => {
              const fallback = getYouTubeFallbackThumbnail(active.youtube_video_id || active.youtube_url || active.storage_url);
              if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>

      <motion.div
        aria-hidden="true"
        style={{ x: lightX, y: lightY }}
        className="absolute inset-0 opacity-60"
      >
        <div className="absolute left-[-8%] top-[18%] h-[2px] w-[42%] rotate-[-14deg] bg-gradient-to-r from-transparent via-primary/80 to-transparent blur-[1px]" />
        <div className="absolute right-[-10%] top-[40%] h-[1px] w-[50%] rotate-[-14deg] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="absolute bottom-[22%] left-[6%] h-[1px] w-[36%] rotate-[-14deg] bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.93),rgba(0,0,0,0.48)_50%,rgba(0,0,0,0.76))]" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/78 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[900px] max-w-7xl items-center px-4 pb-28 pt-24 sm:min-h-[760px] sm:px-6 lg:h-full lg:min-h-[720px] lg:px-8 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ y: copyY, opacity: copyOpacity }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid w-full items-center gap-7 sm:gap-10 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px]"
        >
          <div className="max-w-3xl space-y-5 sm:space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary sm:text-[11px] sm:tracking-[0.32em]"
            >
              <span className="h-px w-10 bg-primary sm:w-12" />
              <span>Featured {active.category ? `· ${active.category}` : "Production"}</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id + "-copy"}
                initial={{ opacity: 0, y: 24, rotateX: -8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -18, rotateX: 8 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="space-y-5"
              >
                <h1 className="max-w-4xl text-3xl font-bold leading-[1.04] tracking-normal text-white sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-orbitron">
                  {active.title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/76 sm:text-lg sm:leading-7">
                  {active.description ||
                    "Cinematic automotive photography and videography built for launches, meets, builds, and stories that deserve more than a quick scroll."}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handlePlay}
                className="h-12 rounded-md bg-primary px-6 font-semibold text-primary-foreground shadow-glow hover:bg-primary/90"
              >
                <Play className="mr-2" size={18} fill="currentColor" />
                Watch Film
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("latest-releases")?.scrollIntoView({ behavior: "smooth" })}
                className="h-12 rounded-md border-white/25 bg-white/8 px-6 text-white hover:bg-white/15 hover:text-white"
              >
                View Work
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>

            <div className="grid max-w-2xl grid-cols-3 gap-2 pt-1 text-white/80 sm:gap-3 sm:pt-2">
              {[
                ["4K", "Visual-ready edits"],
                ["JDM", "Culture stories"],
                ["Photo", "Editorial shoots"],
              ].map(([value, label]) => (
                <div key={value} className="border-l border-white/18 pl-3 sm:pl-4">
                  <div className="font-orbitron text-xl font-bold text-white sm:text-2xl">{value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/52 sm:text-xs sm:tracking-[0.18em]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="perspective-hero mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:block lg:max-w-[360px] xl:max-w-none"
            initial={{ opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0, rotateY: -6 }}
            style={{ rotateX, rotateY }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative preserve-3d">
              <div className="absolute -inset-6 translate-x-8 translate-y-8 rotate-3 rounded-md border border-white/10 bg-white/5" />
              <div className="relative overflow-hidden rounded-md border border-white/16 bg-white/8 shadow-2xl">
                <img
                  src={poster}
                  alt=""
                  onError={(event) => {
                    const fallback = getYouTubeFallbackThumbnail(active.youtube_video_id || active.youtube_url || active.storage_url);
                    if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                  }}
                  className="aspect-[16/10] w-full object-cover lg:aspect-[4/5]"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/70">
                    <Film size={14} />
                    Hero Poster
                  </div>
                  <p className="line-clamp-2 font-orbitron text-xl font-bold text-white">{active.title}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-20 right-4 z-20 flex items-center gap-3 sm:right-6 lg:bottom-24 lg:right-10">
          <button
            onClick={() => setPaused((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-primary hover:text-primary"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          >
            {paused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
          </button>
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${slide.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-10 bg-primary" : "w-5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/45 md:flex"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>

    </section>
  );
};

export default FeaturedHero;
