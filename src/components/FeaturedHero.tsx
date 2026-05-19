/**
 * FeaturedHero — AUTODOSE
 * Centered video slideshow with blurred YouTube BG,
 * touch/pointer swipe, 3-D tilt, parallax scroll, auto-rotate.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import {
  getYouTubeFallbackThumbnail,
  getYouTubeThumbnail,
  getYouTubeVideoId,
} from "@/lib/youtube";
import heroImage from "@/assets/hero-jdm.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Types ────────────────────────────────────────────────────────── */
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

/* ── Constants ────────────────────────────────────────────────────── */
const AUTO_MS = 8000;
const SWIPE_THRESHOLD = 48;

const FALLBACK: FeaturedVideo[] = [
  {
    id: "fb-1",
    title: "Mod In Myanmar Day-2 | Speed Loving Toyota Meet",
    description:
      "Cinematic automotive photography and videography built for launches, meets, builds, and stories that deserve more than a quick scroll.",
    category: "General",
    storage_url: "",
    thumbnail_url: heroImage,
    duration: "04:12",
  },
  {
    id: "fb-2",
    title: "AUTODOSE Visual Garage",
    description:
      "Automotive photography and film from Myanmar streets to midnight meets.",
    category: "Automotive Studio",
    storage_url: "",
    thumbnail_url: heroImage,
    duration: "03:47",
  },
  {
    id: "fb-3",
    title: "JDM Culture Myanmar",
    description:
      "Street stories from the heart of Myanmar's thriving car culture scene.",
    category: "Documentary",
    storage_url: "",
    thumbnail_url: heroImage,
    duration: "05:23",
  },
  {
    id: "fb-4",
    title: "Midnight Run Vol.3",
    description: "Late-night shoots capturing the glow of chrome under streetlights.",
    category: "Night Shots",
    storage_url: "",
    thumbnail_url: heroImage,
    duration: "06:01",
  },
  {
    id: "fb-5",
    title: "Urban Legends Series",
    description: "The city as a backdrop; the machine as the subject.",
    category: "Urban",
    storage_url: "",
    thumbnail_url: heroImage,
    duration: "02:58",
  },
  {
    id: "fb-6",
    title: "Mountain Pass Edit",
    description: "Winding roads, golden hour, and mechanical poetry.",
    category: "Editorial",
    storage_url: "",
    thumbnail_url: heroImage,
    duration: "04:12",
  },
];

/* ── Helpers ──────────────────────────────────────────────────────── */
function wrap(i: number, len: number): number {
  return ((i % len) + len) % len;
}

function centerSlideIndex(count: number): number {
  return Math.max(0, Math.floor((count - 1) / 2));
}

function getPoster(v: FeaturedVideo): string {
  return (
    v.thumbnail_url ||
    getYouTubeThumbnail(v.youtube_video_id || v.youtube_url || v.storage_url) ||
    heroImage
  );
}

function getYtId(v: FeaturedVideo): string | null {
  return getYouTubeVideoId(v.youtube_video_id || v.youtube_url || v.storage_url);
}

/* ── Blurred YouTube background ──────────────────────────────────── */
function YtBlurBg({ ytId }: { ytId: string }) {
  const src = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&modestbranding=1&playsinline=1`;
  return (
    <iframe
      key={ytId}
      src={src}
      title="bg"
      allow="autoplay; encrypted-media"
      tabIndex={-1}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "180%",
        height: "180%",
        transform: "translate(-50%,-50%)",
        filter: "blur(26px) saturate(1.2) brightness(0.4)",
        pointerEvents: "none",
        border: "none",
      }}
    />
  );
}

/* ── Poster blurred background ───────────────────────────────────── */
function PosterBg({ src }: { src: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(20px) saturate(1.1) brightness(0.38)",
        transform: "scale(1.1)",
      }}
    />
  );
}

/* ── Progress ring around pause/play button ──────────────────────── */
function ProgressRing({
  paused,
  dur,
  ringKey,
}: {
  paused: boolean;
  dur: number;
  ringKey: string;
}) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      key={ringKey}
      width="34"
      height="34"
      style={{ position: "absolute", inset: 0, rotate: "-90deg", pointerEvents: "none" }}
    >
      <circle
        cx="17"
        cy="17"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="2"
      />
      {!paused && (
        <motion.circle
          cx="17"
          cy="17"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: dur / 1000, ease: "linear" }}
        />
      )}
    </svg>
  );
}

/* ── Custom pause (rounded bars) ─────────────────────────────────── */
function SlideshowPauseIcon() {
  return (
    <span className="inline-flex items-center justify-center gap-[3px]" aria-hidden>
      <span className="h-3 w-[3.5px] rounded-full bg-current shadow-[0_0_6px_rgba(239,68,68,0.45)]" />
      <span className="h-3 w-[3.5px] rounded-full bg-current shadow-[0_0_6px_rgba(239,68,68,0.45)]" />
    </span>
  );
}

/* ── Side thumbnail card (cinematic vertical stack) ───────────────── */
function SideCard({
  video,
  dist,
  side,
  onClick,
  delay,
  interactive = true,
}: {
  video: FeaturedVideo;
  dist: 1 | 2 | 3;
  side: "left" | "right";
  onClick: () => void;
  delay: number;
  interactive?: boolean;
}) {
  const poster = getPoster(video);
  const opacity = dist === 1 ? 1 : dist === 2 ? 0.72 : 0.45;
  const scale = dist === 1 ? 1 : dist === 2 ? 0.92 : 0.84;
  const rotateY =
    side === "left"
      ? dist === 1
        ? 10
        : dist === 2
          ? 16
          : 22
      : dist === 1
        ? -10
        : dist === 2
          ? -16
          : -22;
  const durationLabel = video.duration?.trim() || "—:—";
  const subtitle = video.category?.trim() || video.description?.trim() || "AUTODOSE";

  const cardClass = [
    "group relative w-full overflow-hidden rounded-2xl border bg-black text-left",
    "shadow-[0_12px_40px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] duration-300",
    interactive
      ? "cursor-pointer outline-none hover:border-primary hover:shadow-[0_0_32px_rgba(239,68,68,0.42)]"
      : "pointer-events-none cursor-default select-none",
    dist === 1 ? "border-white/20" : "border-white/10",
  ].join(" ");

  const motionProps = {
    initial: { opacity: 0, x: side === "left" ? -20 : 20, rotateY: rotateY * 1.2 },
    animate: { opacity, scale, x: 0, rotateY },
    ...(interactive
      ? {
          whileHover: {
            opacity: Math.min(opacity + 0.15, 1),
            scale: scale + 0.035,
            rotateY: rotateY * 0.65,
          },
        }
      : {}),
    transition: { duration: 0.48, delay, ease: "easeOut" as const },
    className: cardClass,
    style: { transformPerspective: 900, transformStyle: "preserve-3d" as const },
  };

  const inner = (
    <div key={video.id} className="relative aspect-[3/4.2] w-full overflow-hidden sm:aspect-[3/4.5]">
      <img
        src={poster}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        onError={(e) => {
          const fb =
            getYouTubeFallbackThumbnail(
              video.youtube_video_id || video.youtube_url || video.storage_url
            ) || heroImage;
          const el = e.target as HTMLImageElement;
          if (el.src !== fb) el.src = fb;
        }}
      />
      <motion.div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
      <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <span className="absolute left-2 top-2 z-10 rounded-md border border-white/12 bg-black/55 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-white/80 backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:text-[10px]">
        {durationLabel}
      </span>

      <motion.div
        aria-hidden
        className={[
          "absolute bottom-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-black/45 backdrop-blur-sm transition-all duration-300 sm:bottom-2.5 sm:left-2.5 sm:h-8 sm:w-8",
          interactive ? "group-hover:border-primary group-hover:bg-primary/90 group-hover:shadow-[0_0_16px_rgba(239,68,68,0.65)]" : "",
        ].join(" ")}
      >
        <Play size={11} fill="white" className="ml-0.5 text-white" />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-2 pt-10 sm:p-2.5 sm:pt-12">
        <p
          className={[
            "font-orbitron font-bold uppercase leading-tight text-white line-clamp-2",
            dist === 1 ? "text-[9px] sm:text-[11px]" : dist === 2 ? "text-[8px] sm:text-[10px]" : "text-[7px] sm:text-[9px]",
          ].join(" ")}
        >
          {video.title}
        </p>
        {dist <= 2 && (
          <p className="mt-0.5 line-clamp-1 text-[8px] leading-snug text-white/55 sm:text-[9px]">{subtitle}</p>
        )}
      </div>
    </div>
  );

  if (interactive) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={`${side === "left" ? "Previous" : "Next"}: ${video.title}`}
        {...motionProps}
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <motion.div aria-hidden {...motionProps}>
      {inner}
    </motion.div>
  );
}

/* ── Animated scroll cue ─────────────────────────────────────────── */
function HeroScrollCue({ onClick }: { onClick: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Scroll down to videos"
      className="mt-3 flex flex-col items-center gap-1.5 text-white/50 transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.05, duration: 0.55 }}
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-white/38">
        Scroll
      </span>
      <motion.span
        animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 1.65, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/50 shadow-[0_0_20px_rgba(0,0,0,0.45)] backdrop-blur-md"
      >
        <ChevronDown size={20} strokeWidth={2.25} className="text-primary" />
      </motion.span>
      <motion.span
        aria-hidden
        className="h-5 w-px bg-gradient-to-b from-primary/70 to-transparent"
        animate={reduceMotion ? undefined : { scaleY: [0.6, 1, 0.6], opacity: [0.35, 0.85, 0.35] }}
        transition={{ duration: 1.65, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.button>
  );
}

/* ═
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function FeaturedHero({ onPlay }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(() => centerSlideIndex(FALLBACK.length));
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const sideCardsInteractive = !isMobile;

  /* ── Parallax ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  /* ── 3-D tilt ── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 36, damping: 20 });
  const smy = useSpring(my, { stiffness: 36, damping: 20 });
  const tiltX = useTransform(smy, [-1, 1], reduceMotion ? [0, 0] : [2.5, -2.5]);
  const tiltY = useTransform(smx, [-1, 1], reduceMotion ? [0, 0] : [-4.5, 4.5]);

  const slides = videos.length > 0 ? videos : FALLBACK;
  const N = slides.length;
  const active = slides[activeIdx];
  const poster = useMemo(() => getPoster(active), [active]);
  const ytId = useMemo(() => getYtId(active), [active]);

  /* ── Navigation ── */
  const goTo = useCallback(
    (next: number) => {
      const safeNext = wrap(next, N);
      setPrevIdx(activeIdx);
      setActiveIdx(safeNext);
    },
    [activeIdx, N]
  );
  const goPrev = useCallback(() => goTo(activeIdx - 1), [activeIdx, goTo]);
  const goNext = useCallback(() => goTo(activeIdx + 1), [activeIdx, goTo]);

  /* ── Fetch data ── */
  useEffect(() => {
    let cancelled = false;
    async function fetchVideos() {
      try {
        if (!hasSupabaseConfig) {
          setLoading(false);
          return;
        }
        const cols =
          "id,title,description,category,storage_url,hls_url,thumbnail_url,duration,source_type,youtube_url,youtube_video_id";
        let { data } = await supabase
          .from("videos")
          .select(cols)
          .eq("is_homepage_featured", true)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!data || data.length === 0) {
          const res = await supabase
            .from("videos")
            .select(cols)
            .order("created_at", { ascending: false })
            .limit(8);
          data = res.data;
        }

        if (!cancelled && data && data.length > 0) {
          setVideos(data as unknown as FeaturedVideo[]);
          setActiveIdx(centerSlideIndex(data.length));
          setPrevIdx(null);
        }
      } catch (err) {
        console.warn("FeaturedHero fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchVideos();
    return () => { cancelled = true; };
  }, []);

  /* ── Auto-rotate ── */
  useEffect(() => {
    if (paused || N < 2) return;
    const id = window.setInterval(() => {
      setActiveIdx((cur) => {
        const next = wrap(cur + 1, N);
        setPrevIdx(cur);
        return next;
      });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, N]);

  /* ── 3D tilt tracking ── */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion || isMobile) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
      my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    },
    [reduceMotion, isMobile, mx, my]
  );
  const handlePointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  /* ── Swipe handlers ── */
  const onSwipeStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
  };
  const onSwipeEnd = (clientX: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = dragStartX.current - clientX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta > 0) goNext();
      else goPrev();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => onSwipeStart(e.clientX);
  const handlePointerUp = (e: React.PointerEvent) => onSwipeEnd(e.clientX);
  const handleTouchStart = (e: React.TouchEvent) => onSwipeStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => onSwipeEnd(e.changedTouches[0].clientX);

  const handlePlay = useCallback(() => {
    if (!active.id.startsWith("fb-")) {
      onPlay(active);
      return;
    }
    document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" });
  }, [active, onPlay]);

  const scrollToVideos = useCallback(() => {
    document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const leftIdxs = useMemo(
    () => [wrap(activeIdx - 1, N), wrap(activeIdx - 2, N), wrap(activeIdx - 3, N)],
    [activeIdx, N]
  );
  const rightIdxs = useMemo(
    () => [wrap(activeIdx + 1, N), wrap(activeIdx + 2, N), wrap(activeIdx + 3, N)],
    [activeIdx, N]
  );

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section
        ref={sectionRef}
        className="relative h-[92svh] min-h-[680px] max-h-[980px] overflow-hidden bg-black"
        aria-label="Loading hero"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(200,0,0,0.07),transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-4">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-2.5 w-36 rounded-full bg-primary/20 animate-pulse" />
            <div
              className="mx-auto h-9 w-80 max-w-full rounded bg-white/10 animate-pulse"
              style={{ animationDelay: "0.1s" }}
            />
          </div>
          <div className="w-full max-w-3xl aspect-video rounded-2xl bg-white/5 animate-pulse border border-white/8" />
        </div>
      </section>
    );
  }

  /* ── Main render ── */
  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative h-[92svh] min-h-[680px] max-h-[980px] w-full overflow-hidden bg-black text-white"
      style={{ userSelect: "none" }}
    >
      {/* ─── Background container with extended inset for parallax ─── */}
      <div
        className="absolute overflow-hidden"
        aria-hidden="true"
        style={{ inset: "-10%" }}
      >
        <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
          {/* Outgoing slide crossfade */}
          <AnimatePresence>
            {prevIdx !== null && prevIdx !== activeIdx && (
              <motion.div
                key={`prev-bg-${slides[prevIdx].id}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <PosterBg src={getPoster(slides[prevIdx])} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active background */}
          <motion.div
            key={`active-bg-${active.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 overflow-hidden"
          >
            {ytId ? <YtBlurBg ytId={ytId} /> : <PosterBg src={poster} />}
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Overlay layers ─── */}
      <div className="absolute inset-0 bg-black/62" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(239,68,68,0.10),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-background via-background/78 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[11%] bg-gradient-to-r from-black/78 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[11%] bg-gradient-to-l from-black/78 to-transparent" />

      {/* ─── Cinematic accent lines ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-0 top-[30%] h-px w-[32%] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute right-0 top-[56%] h-px w-[26%] bg-gradient-to-l from-transparent via-white/14 to-transparent" />
        <div className="absolute left-[8%] bottom-[30%] h-px w-[26%] -rotate-[12deg] bg-gradient-to-r from-transparent via-primary/28 to-transparent" />
      </div>

      {/* ─── Main content (parallax-scrolls) ─── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 h-full flex flex-col"
      >
        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="flex-shrink-0 pt-28 sm:pt-32 flex flex-col items-center gap-2.5 px-4 text-center"
        >
          {/* Label with lines */}
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.30em] text-primary sm:text-[11px]">
            <motion.span
              className="block h-px bg-primary"
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ duration: 0.8, delay: 0.38 }}
            />
            Cinematic Automotive Content
            <motion.span
              className="block h-px bg-primary"
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ duration: 0.8, delay: 0.38 }}
            />
          </div>

          {/* Title crossfade */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={active.id + "-h1"}
              initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-orbitron text-[1.5rem] font-black leading-tight tracking-wide text-white sm:text-3xl lg:text-4xl xl:text-[2.7rem] max-w-[840px]"
            >
              {active.title.toUpperCase()}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* ── Carousel: previous | center | next ── */}
        <motion.div
          className="relative flex flex-1 min-h-0 w-full flex-col items-center justify-center px-1 pb-2 sm:px-4 sm:pb-4"
          {...(!isMobile
            ? {
                onPointerDown: handlePointerDown,
                onPointerUp: handlePointerUp,
                onPointerCancel: handlePointerUp,
                onTouchStart: handleTouchStart,
                onTouchEnd: handleTouchEnd,
                style: { touchAction: "pan-y" as const },
              }
            : { style: { touchAction: "pan-y" as const } })}
        >
          <motion.div
            className="flex w-full max-w-[1540px] items-end justify-center gap-0.5 sm:gap-2 lg:gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {N > 1 && (
              <motion.div
                className="flex flex-shrink-0 items-end justify-end gap-0.5 sm:gap-1.5 lg:gap-2"
                style={{ width: "clamp(52px, 17vw, 300px)" }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
              >
                {N > 3 && (
                  <motion.div key={`l3-${leftIdxs[2]}`} className="block" style={{ width: "26%" }}>
                    <SideCard
                      video={slides[leftIdxs[2]]}
                      dist={3}
                      side="left"
                      onClick={() => goTo(leftIdxs[2])}
                      delay={0.5}
                      interactive={sideCardsInteractive}
                    />
                  </motion.div>
                )}
                {N > 2 && (
                  <div key={`l2-${leftIdxs[1]}`} className="block" style={{ width: "36%" }}>
                    <SideCard
                      video={slides[leftIdxs[1]]}
                      dist={2}
                      side="left"
                      onClick={() => goTo(leftIdxs[1])}
                      delay={0.42}
                      interactive={sideCardsInteractive}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="mb-1 hidden text-center text-[9px] font-semibold uppercase tracking-[0.28em] text-white/38 sm:mb-1.5 sm:block">
                    Previous
                  </p>
                  <SideCard
                    key={`l1-${leftIdxs[0]}`}
                    video={slides[leftIdxs[0]]}
                    dist={1}
                    side="left"
                    onClick={() => goTo(leftIdxs[0])}
                    delay={0.34}
                    interactive={sideCardsInteractive}
                  />
                </div>
              </motion.div>
            )}

            <motion.button
              type="button"
              onClick={goPrev}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden lg:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/14 bg-black/55 text-white/70 backdrop-blur-sm transition-colors hover:border-primary/55 hover:bg-primary/18 hover:text-primary"
              aria-label="Previous video"
            >
              <ChevronLeft size={20} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: "easeOut" }}
              className="relative min-w-0 flex-1 flex-shrink-0"
              style={{ maxWidth: "clamp(148px, 38vw, 880px)" }}
            >
            <motion.div
              style={
                isMobile
                  ? undefined
                  : {
                      rotateX: tiltX,
                      rotateY: tiltY,
                      transformPerspective: 1100,
                    }
              }
              className="w-full"
            >
              <button
                type="button"
                onClick={isMobile ? undefined : handlePlay}
                disabled={isMobile}
                aria-hidden={isMobile}
                tabIndex={isMobile ? -1 : 0}
                className={[
                  "relative block w-full overflow-hidden rounded-xl border border-primary/35 bg-black text-left sm:rounded-2xl",
                  isMobile
                    ? "pointer-events-none cursor-default select-none"
                    : "group outline-none transition-shadow duration-300 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                ].join(" ")}
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 0 55px rgba(239,68,68,0.22), 0 28px 90px rgba(0,0,0,0.88)",
                }}
                aria-label={`Play ${active.title}`}
              >
                <motion.div className="relative aspect-video w-full overflow-hidden">
                  <div className="absolute left-4 top-4 z-10 rounded-sm border border-white/14 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 backdrop-blur-sm">
                    Featured
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`thumb-${active.id}`}
                      src={poster}
                      alt={active.title}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                      className={[
                        "absolute inset-0 h-full w-full object-cover",
                        !isMobile && "transition-transform duration-500 group-hover:scale-[1.02]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onError={(e) => {
                        const fb =
                          getYouTubeFallbackThumbnail(
                            active.youtube_video_id ||
                              active.youtube_url ||
                              active.storage_url
                          ) || heroImage;
                        const el = e.target as HTMLImageElement;
                        if (el.src !== fb) el.src = fb;
                      }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <motion.div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/8" />
                </motion.div>
              </button>
            </motion.div>
            </motion.div>

            <motion.button
              type="button"
              onClick={goNext}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden lg:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/14 bg-black/55 text-white/70 backdrop-blur-sm transition-colors hover:border-primary/55 hover:bg-primary/18 hover:text-primary"
              aria-label="Next video"
            >
              <ChevronRight size={20} />
            </motion.button>

            {N > 1 && (
              <motion.div
                className="flex flex-shrink-0 items-end justify-start gap-0.5 sm:gap-1.5 lg:gap-2"
                style={{ width: "clamp(52px, 17vw, 300px)" }}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 hidden text-center text-[9px] font-semibold uppercase tracking-[0.28em] text-white/38 sm:mb-1.5 sm:block">
                    Up Next
                  </p>
                  <SideCard
                    key={`r1-${rightIdxs[0]}`}
                    video={slides[rightIdxs[0]]}
                    dist={1}
                    side="right"
                    onClick={() => goTo(rightIdxs[0])}
                    delay={0.34}
                    interactive={sideCardsInteractive}
                  />
                </div>
                {N > 2 && (
                  <div key={`r2-${rightIdxs[1]}`} className="block" style={{ width: "36%" }}>
                    <SideCard
                      video={slides[rightIdxs[1]]}
                      dist={2}
                      side="right"
                      onClick={() => goTo(rightIdxs[1])}
                      delay={0.42}
                      interactive={sideCardsInteractive}
                    />
                  </div>
                )}
                {N > 3 && (
                  <div key={`r3-${rightIdxs[2]}`} className="block" style={{ width: "26%" }}>
                    <SideCard
                      video={slides[rightIdxs[2]]}
                      dist={3}
                      side="right"
                      onClick={() => goTo(rightIdxs[2])}
                      delay={0.5}
                      interactive={sideCardsInteractive}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="relative z-10 flex w-full flex-shrink-0 flex-col items-center gap-5 px-4 pb-10 sm:gap-6 sm:pb-12"
        >
          <motion.div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Button
              size="lg"
              onClick={handlePlay}
              className="h-11 w-full rounded-md bg-primary px-6 font-semibold text-white shadow-glow transition-all duration-300 hover:scale-[1.03] hover:bg-primary/90 active:scale-[0.97] btn-red-glow sm:min-w-[160px] sm:w-auto"
            >
              <Play className="mr-2" size={16} fill="currentColor" />
              Watch Film
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" })
              }
              className="h-11 w-full rounded-md border-white/18 bg-white/5 px-6 text-white transition-all duration-300 hover:scale-[1.03] hover:border-white/38 hover:bg-white/10 hover:text-white active:scale-[0.97] sm:min-w-[168px] sm:w-auto"
            >
              Explore Projects
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </motion.div>

          {N > 1 && (
            <div className="flex w-full flex-col items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center justify-center gap-4 rounded-full border border-white/10 bg-black/55 px-5 py-2.5 backdrop-blur-md"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIdx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-[3.25rem] font-orbitron text-[11px] tracking-[0.22em] text-white/40 select-none tabular-nums"
                >
                  {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>

              <div className="relative flex h-[34px] w-[34px] items-center justify-center">
                <ProgressRing
                  paused={paused}
                  dur={AUTO_MS}
                  ringKey={`ring-${activeIdx}-${paused ? "p" : "r"}`}
                />
                <button
                  type="button"
                  onClick={() => setPaused((c) => !c)}
                  aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
                  className="absolute inset-0 grid place-items-center rounded-full text-white transition-colors hover:text-primary focus:outline-none"
                >
                  {paused ? (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  ) : (
                    <SlideshowPauseIcon />
                  )}
                </button>
              </div>

              <motion.div className="flex items-center gap-1.5" aria-hidden={isMobile}>
                {slides.map((s, i) =>
                  isMobile ? (
                    <motion.span
                      key={s.id}
                      animate={{
                        width: i === activeIdx ? 22 : 6,
                        backgroundColor:
                          i === activeIdx ? "rgb(239, 68, 68)" : "rgba(255,255,255,0.22)",
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="block h-1.5 rounded-full"
                    />
                  ) : (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="focus:outline-none"
                    >
                      <motion.span
                        animate={{
                          width: i === activeIdx ? 22 : 6,
                          backgroundColor:
                            i === activeIdx ? "rgb(239, 68, 68)" : "rgba(255,255,255,0.22)",
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="block h-1.5 rounded-full"
                      />
                    </button>
                  )
                )}
              </motion.div>
            </motion.div>
            <HeroScrollCue onClick={scrollToVideos} />
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}