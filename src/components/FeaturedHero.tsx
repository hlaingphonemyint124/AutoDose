/**
 * FeaturedHero — AUTODOSE
 * Centre carousel with flanking prev/next cards, blurred YouTube BG,
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
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  Settings,
  SkipBack,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import {
  getYouTubeFallbackThumbnail,
  getYouTubeThumbnail,
  getYouTubeVideoId,
} from "@/lib/youtube";
import heroImage from "@/assets/hero-jdm.jpg";

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

/* ── Side thumbnail card ─────────────────────────────────────────── */
function SideCard({
  video,
  dist,
  side,
  onClick,
  delay,
}: {
  video: FeaturedVideo;
  dist: 1 | 2 | 3;
  side: "left" | "right";
  onClick: () => void;
  delay: number;
}) {
  const poster = getPoster(video);
  const opacity = dist === 1 ? 1 : dist === 2 ? 0.55 : 0.28;
  const scale = dist === 1 ? 1 : dist === 2 ? 0.93 : 0.86;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: side === "left" ? -28 : 28 }}
      animate={{ opacity, scale, x: 0 }}
      whileHover={{ opacity: Math.min(opacity + 0.2, 1), scale: scale + 0.02 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={[
        "relative w-full overflow-hidden rounded-xl border bg-black/60 text-left",
        "outline-none backdrop-blur-sm cursor-pointer",
        dist === 1
          ? "border-white/15 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.22)]"
          : "border-white/8 hover:border-white/18",
      ].join(" ")}
      aria-label={`Play ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={poster}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500"
          onError={(e) => {
            const fb =
              getYouTubeFallbackThumbnail(
                video.youtube_video_id || video.youtube_url || video.storage_url
              ) || heroImage;
            const el = e.target as HTMLImageElement;
            if (el.src !== fb) el.src = fb;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {/* Hover play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="h-9 w-9 rounded-full bg-primary/85 flex items-center justify-center shadow-[0_0_18px_rgba(239,68,68,0.6)]">
            <Play size={12} fill="white" className="ml-0.5 text-white" />
          </div>
        </div>
      </div>
      {/* Info — only for closest card */}
      {dist === 1 && (
        <div className="p-2.5">
          <p className="font-orbitron text-[11px] font-bold leading-snug text-white line-clamp-2">
            {video.title}
          </p>
          {video.duration && (
            <p className="mt-0.5 font-mono text-[10px] text-white/38">{video.duration}</p>
          )}
        </div>
      )}
    </motion.button>
  );
}

/* ═════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function FeaturedHero({ onPlay }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const reduceMotion = useReducedMotion();

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
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
      my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    },
    [reduceMotion, mx, my]
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

  /* Side card indices */
  const leftIdxs = [wrap(activeIdx - 1, N), wrap(activeIdx - 2, N), wrap(activeIdx - 3, N)];
  const rightIdxs = [wrap(activeIdx + 1, N), wrap(activeIdx + 2, N), wrap(activeIdx + 3, N)];

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section
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

        {/* ── Carousel ── */}
        <div
          className="flex-1 flex items-center justify-center min-h-0 px-0 pb-2"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div className="w-full max-w-[1540px] flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-4">

            {/* ══ LEFT cards (Previous) ══ */}
            <div
              className="hidden sm:flex items-end justify-end gap-1.5 sm:gap-2 flex-shrink-0"
              style={{ width: "clamp(110px, 21vw, 310px)" }}
            >
              {N > 3 && (
                <div className="hidden xl:block" style={{ width: "27%" }}>
                  <SideCard
                    video={slides[leftIdxs[2]]}
                    dist={3}
                    side="left"
                    onClick={() => goTo(leftIdxs[2])}
                    delay={0.52}
                  />
                </div>
              )}
              {N > 2 && (
                <div className="hidden lg:block" style={{ width: "37%" }}>
                  <SideCard
                    video={slides[leftIdxs[1]]}
                    dist={2}
                    side="left"
                    onClick={() => goTo(leftIdxs[1])}
                    delay={0.44}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.28em] text-white/35"
                >
                  Previous
                </motion.p>
                <SideCard
                  video={slides[leftIdxs[0]]}
                  dist={1}
                  side="left"
                  onClick={() => goTo(leftIdxs[0])}
                  delay={0.36}
                />
              </div>
            </div>

            {/* ══ Left chevron ══ */}
            <motion.button
              type="button"
              onClick={goPrev}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-black/55 text-white/70 backdrop-blur-sm transition-colors duration-200 hover:border-primary/55 hover:bg-primary/18 hover:text-primary"
              aria-label="Previous video"
            >
              <ChevronLeft size={20} />
            </motion.button>

            {/* ══ Center featured card ══ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.88, delay: 0.18, ease: "easeOut" }}
              className="relative flex-1 min-w-0 flex-shrink-0"
              style={{ maxWidth: "clamp(300px, 54vw, 900px)" }}
            >
              <motion.div
                style={{
                  rotateX: tiltX,
                  rotateY: tiltY,
                  transformPerspective: 1100,
                }}
                className="w-full"
              >
                {/* Video card */}
                <div
                  className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-primary/35"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.06), 0 0 55px rgba(239,68,68,0.22), 0 28px 90px rgba(0,0,0,0.88)",
                  }}
                >
                  {/* Badges */}
                  <div className="absolute left-4 top-4 z-10 rounded-sm border border-white/14 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 backdrop-blur-sm">
                    Featured
                  </div>
                  <div className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full border border-white/14 bg-black/55 flex items-center justify-center text-white/55 backdrop-blur-sm">
                    <Volume2 size={13} />
                  </div>

                  {/* Thumbnail */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`thumb-${active.id}`}
                      src={poster}
                      alt={active.title}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.03 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
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

                  {/* Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-primary/5 mix-blend-screen" />

                  {/* Play button */}
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center group"
                    aria-label={`Play ${active.title}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.14 }}
                      whileTap={{ scale: 0.92 }}
                      className="h-16 w-16 sm:h-[72px] sm:w-[72px] lg:h-[84px] lg:w-[84px] rounded-full border border-white/24 bg-primary flex items-center justify-center transition-shadow duration-300"
                      style={{
                        boxShadow:
                          "0 0 0 11px rgba(239,68,68,0.13), 0 0 44px rgba(239,68,68,0.58)",
                      }}
                    >
                      <Play size={28} fill="white" className="ml-1 text-white" />
                    </motion.div>
                  </button>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active.id + "-info"}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.36 }}
                      >
                        <p className="font-orbitron text-sm font-bold text-white line-clamp-1 sm:text-base lg:text-lg">
                          {active.title}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.20em] text-white/38 sm:text-xs">
                          {active.category || "AUTODOSE"}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── Controls bar ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5 }}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-white/8 bg-black/78 px-3 py-2.5 backdrop-blur-md sm:gap-2.5 sm:px-4"
                >
                  <button
                    aria-label="Restart"
                    className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                  >
                    <SkipBack size={15} />
                  </button>
                  <button
                    onClick={handlePlay}
                    aria-label="Play"
                    className="flex-shrink-0 text-white/75 hover:text-primary transition-colors"
                  >
                    <Play size={17} fill="currentColor" />
                  </button>
                  <button
                    aria-label="Volume"
                    className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                  >
                    <Volume2 size={15} />
                  </button>

                  {/* Scrubber */}
                  <div className="flex-1 relative h-1 cursor-pointer rounded-full bg-white/14 overflow-visible">
                    <motion.div
                      key={activeIdx + "-bar"}
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "38%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                    <div
                      className="absolute top-1/2 left-[38%] -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary"
                      style={{ boxShadow: "0 0 7px rgba(239,68,68,0.9)" }}
                    />
                  </div>

                  <span className="flex-shrink-0 font-mono text-[10px] text-white/38 hidden sm:block">
                    01:24&nbsp;/&nbsp;{active.duration || "03:56"}
                  </span>
                  <span className="flex-shrink-0 rounded border border-primary/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                    4K
                  </span>
                  <button
                    aria-label="Settings"
                    className="flex-shrink-0 text-white/45 hover:text-white transition-colors"
                  >
                    <Settings size={14} />
                  </button>
                  <button
                    aria-label="Fullscreen"
                    className="flex-shrink-0 text-white/45 hover:text-white transition-colors"
                  >
                    <Maximize2 size={14} />
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ══ Right chevron ══ */}
            <motion.button
              type="button"
              onClick={goNext}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-black/55 text-white/70 backdrop-blur-sm transition-colors duration-200 hover:border-primary/55 hover:bg-primary/18 hover:text-primary"
              aria-label="Next video"
            >
              <ChevronRight size={20} />
            </motion.button>

            {/* ══ RIGHT cards (Up Next) ══ */}
            <div
              className="hidden sm:flex items-end justify-start gap-1.5 sm:gap-2 flex-shrink-0"
              style={{ width: "clamp(110px, 21vw, 310px)" }}
            >
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.28em] text-white/35"
                >
                  Up Next
                </motion.p>
                <SideCard
                  video={slides[rightIdxs[0]]}
                  dist={1}
                  side="right"
                  onClick={() => goTo(rightIdxs[0])}
                  delay={0.36}
                />
              </div>
              {N > 2 && (
                <div className="hidden lg:block" style={{ width: "37%" }}>
                  <SideCard
                    video={slides[rightIdxs[1]]}
                    dist={2}
                    side="right"
                    onClick={() => goTo(rightIdxs[1])}
                    delay={0.44}
                  />
                </div>
              )}
              {N > 3 && (
                <div className="hidden xl:block" style={{ width: "27%" }}>
                  <SideCard
                    video={slides[rightIdxs[2]]}
                    dist={3}
                    side="right"
                    onClick={() => goTo(rightIdxs[2])}
                    delay={0.52}
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── CTA buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.55 }}
          className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 pb-12 px-4"
        >
          <Button
            size="lg"
            onClick={handlePlay}
            className="h-11 min-w-[150px] rounded-md bg-primary px-6 font-semibold text-white shadow-glow transition-all duration-300 hover:scale-[1.05] hover:bg-primary/90 active:scale-[0.96] btn-red-glow"
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
            className="h-11 min-w-[148px] rounded-md border-white/18 bg-white/5 px-6 text-white transition-all duration-300 hover:scale-[1.05] hover:border-white/38 hover:bg-white/10 hover:text-white active:scale-[0.96]"
          >
            Explore Projects
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </motion.div>
      </motion.div>

      {/* ─── Mobile arrows ─── */}
      {N > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full border border-white/14 bg-black/65 text-white backdrop-blur-sm"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full border border-white/14 bg-black/65 text-white backdrop-blur-sm"
          >
            <ChevronRight size={19} />
          </button>
        </>
      )}

      {/* ─── Bottom dot controls ─── */}
      {N > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.6 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3.5"
        >
          {/* Counter */}
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.24 }}
              className="font-orbitron text-[11px] text-white/28 tracking-[0.26em] select-none"
            >
              {String(activeIdx + 1).padStart(2, "0")} /{" "}
              {String(N).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>

          {/* Pause/play with progress ring */}
          <div className="relative w-[34px] h-[34px] flex items-center justify-center">
            <ProgressRing
              paused={paused}
              dur={AUTO_MS}
              ringKey={`ring-${activeIdx}-${paused ? "p" : "r"}`}
            />
            <button
              onClick={() => setPaused((c) => !c)}
              aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
              className="absolute inset-0 grid place-items-center rounded-full text-white transition-colors hover:text-primary focus:outline-none"
            >
              {paused ? (
                <Play size={11} fill="currentColor" />
              ) : (
                <Pause size={11} fill="currentColor" />
              )}
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="focus:outline-none"
              >
                <motion.span
                  animate={{
                    width: i === activeIdx ? 24 : 6,
                    backgroundColor:
                      i === activeIdx
                        ? "hsl(var(--primary))"
                        : "rgba(255,255,255,0.20)",
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="block h-1.5 rounded-full"
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Scroll cue ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-5 hidden md:flex flex-col items-center gap-1.5 text-white/26"
        style={{
          left: "50%",
          transform: "translateX(calc(-50% + 190px))",
        }}
      >
        <span className="text-[8px] uppercase tracking-[0.33em]">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/18 flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [0.65, 0.08, 0.65] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            className="w-0.5 h-2 rounded-full bg-white/44"
          />
        </div>
      </motion.div>
    </section>
  );
}