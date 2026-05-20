/**
 * FeaturedHero — AUTODOSE v4.2 (Vertical Alignment Precision Polish)
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
import { ChevronDown, Play, Pause } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";
import {
  getYouTubeFallbackThumbnail,
  getYouTubeThumbnail,
  getYouTubeVideoId,
} from "@/lib/youtube";
import heroImage from "@/assets/hero-jdm.jpg";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Types ───────────────────────────────────────────────────────── */
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
interface Props { onPlay: (video: FeaturedVideo) => void; }

/* ── Constants ───────────────────────────────────────────────────── */
const AUTO_MS = 7000;

const FALLBACK: FeaturedVideo[] = [
  { id: "fb-1", title: "Mod In Myanmar Day-2 | Speed Loving Toyota Meet", description: "Street stories from Myanmar's thriving car culture.", category: "Car Meet", storage_url: "", thumbnail_url: heroImage, duration: "04:12" },
  { id: "fb-2", title: "AUTODOSE Weekly Vlog-03", description: "Weekly dose of JDM content from Yangon's streets.", category: "Vlog", storage_url: "", thumbnail_url: heroImage, duration: "03:47" },
  { id: "fb-3", title: "JDM Culture Myanmar", description: "Street stories from Myanmar's thriving JDM scene.", category: "Documentary", storage_url: "", thumbnail_url: heroImage, duration: "05:23" },
  { id: "fb-4", title: "Midnight Run Vol.3", description: "Late-night shoots. Chrome under streetlights.", category: "Night Shots", storage_url: "", thumbnail_url: heroImage, duration: "06:01" },
  { id: "fb-5", title: "Subaru WRX Hawkeye Driving Scenes", description: "Raw driving footage from Myanmar's mountain roads.", category: "Driving", storage_url: "", thumbnail_url: heroImage, duration: "02:58" },
  { id: "fb-6", title: "Toyota Aristo | Lower Than Your Granny", description: "Slammed Aristo street session and build breakdown.", category: "Build", storage_url: "", thumbnail_url: heroImage, duration: "04:12" },
  { id: "fb-7", title: "Joy's Farewell Cars & Coffee 5th Feb", description: "A sendoff meet for the books.", category: "Car Meet", storage_url: "", thumbnail_url: heroImage, duration: "03:30" },
  { id: "fb-8", title: "AUTODOSE Weekly Vlog-02", description: "Full-send laps and paddock stories.", category: "Vlog", storage_url: "", thumbnail_url: heroImage, duration: "05:10" },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
function wrap(i: number, len: number) { return ((i % len) + len) % len; }
function getPoster(v: FeaturedVideo) {
  return v.thumbnail_url || getYouTubeThumbnail(v.youtube_video_id || v.youtube_url || v.storage_url) || heroImage;
}
function getYtId(v: FeaturedVideo) {
  return getYouTubeVideoId(v.youtube_video_id || v.youtube_url || v.storage_url);
}
function imgFallback(v: FeaturedVideo) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fb = getYouTubeFallbackThumbnail(v.youtube_video_id || v.youtube_url || v.storage_url) || heroImage;
    const el = e.target as HTMLImageElement;
    if (el.src !== fb) el.src = fb;
  };
}

/* ── Background Video Render ─────────────────────────────────────── */
function VideoIframe({ ytId }: { ytId: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden" }}>
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3`}
        title="bg-video"
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100vw",
          height: "56.25vw",
          minHeight: "100vh",
          minWidth: "177.78vh",
          transform: "translate(-50%, -50%) scale(1.15)",
          filter: "blur(4px) saturate(1.15) brightness(0.24)",
          border: "none",
        }}
      />
    </div>
  );
}

function StaticImageFallback({ poster }: { poster: string }) {
  return (
    <div 
      aria-hidden="true" 
      style={{
        position: "absolute", 
        inset: 0,
        backgroundImage: `url(${poster})`,
        backgroundSize: "cover", 
        backgroundPosition: "center",
        filter: "blur(4px) saturate(1.15) brightness(0.24)",
        transform: "scale(1.06)",
      }} 
    />
  );
}

function ProgressRing({ paused, dur, ringKey }: { paused: boolean; dur: number; ringKey: string }) {
  const r = 15, circ = 2 * Math.PI * r;
  return (
    <svg key={ringKey} width="38" height="38" style={{ position: "absolute", inset: 0, rotate: "-90deg", pointerEvents: "none" }}>
      <circle cx="19" cy="19" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {!paused && (
        <motion.circle cx="19" cy="19" r={r} fill="none" stroke="#d72323" strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: 0 }}
          transition={{ duration: dur / 1000, ease: "linear" }}
        />
      )}
    </svg>
  );
}

function HeroScrollCue({ onClick }: { onClick: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button" onClick={onClick} aria-label="Scroll to videos"
      className="flex flex-col items-center gap-1.5 text-white/35 hover:text-primary transition-colors duration-200 focus:outline-none mt-3"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.5 }}
    >
      <span className="font-orbitron text-[7px] font-semibold uppercase tracking-[0.35em] text-white/25">Scroll</span>
      <motion.span
        animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-sm"
      >
        <ChevronDown size={14} strokeWidth={2.5} className="text-primary" />
      </motion.span>
    </motion.button>
  );
}

/* ── Carousel Math Layouts ───────────────────────────────────────── */
type SlotName = "center" | "left1" | "left2" | "left3" | "right1" | "right2" | "right3" | "hidden";
interface SlotConfig { x: number; rotateY: number; scale: number; opacity: number; zIndex: number; width: number; }

function computeSlots(centerW: number, isMobile: boolean): Record<SlotName, SlotConfig> {
  const sideW = isMobile ? centerW * 0.88 : centerW * 0.82;
  const gap1 = isMobile ? centerW * 0.04 : centerW * 0.05;
  const gap2 = centerW * 0.04;
  const gap3 = centerW * 0.03;
  const s1 = isMobile ? 0.85 : 0.86;
  const s2 = isMobile ? 0.70 : 0.72;
  const s3 = 0.58;
  const x1 = centerW / 2 + (sideW * s1) / 2 + gap1;
  const x2 = x1 + (sideW * s1) / 2 + (sideW * s2) / 2 + gap2;
  const x3 = x2 + (sideW * s2) / 2 + (sideW * s3) / 2 + gap3;
  return {
    center: { x: 0,   rotateY: 0,   scale: 1,   opacity: 1,    zIndex: 20, width: centerW },
    left1:  { x: -x1, rotateY: 14,  scale: s1,  opacity: 0.88, zIndex: 16, width: sideW },
    left2:  { x: -x2, rotateY: 22,  scale: s2,  opacity: 0.60, zIndex: 12, width: sideW },
    left3:  { x: -x3, rotateY: 28,  scale: s3,  opacity: 0.32, zIndex: 8,  width: sideW },
    right1: { x:  x1, rotateY: -14, scale: s1,  opacity: 0.88, zIndex: 16, width: sideW },
    right2: { x:  x2, rotateY: -22, scale: s2,  opacity: 0.60, zIndex: 12, width: sideW },
    right3: { x:  x3, rotateY: -28, scale: s3,  opacity: 0.32, zIndex: 8,  width: sideW },
    hidden: { x: 0,   rotateY: 0,   scale: 0.4, opacity: 0,    zIndex: 0,  width: sideW },
  };
}

function useCenterWidth(isMobile: boolean): number {
  const calc = useCallback(() => {
    const vw = window.innerWidth;
    if (isMobile) return Math.round(Math.min(vw * 0.78, 320));
    return Math.round(Math.min(Math.max(vw * 0.46, 380), 640));
  }, [isMobile]);
  const [width, setWidth] = useState(calc);
  useEffect(() => {
    setWidth(calc());
    const ro = new ResizeObserver(() => setWidth(calc()));
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [calc]);
  return width;
}

/* ── Hero Carousel Card Component ────────────────────────────────── */
interface CardProps {
  video: FeaturedVideo;
  slotName: SlotName;
  slots: Record<SlotName, SlotConfig>;
  isCenter: boolean;
  isMobile: boolean;
  onPlayClick: () => void;
}

function HeroCard({ video, slotName, slots, isCenter, isMobile, onPlayClick }: CardProps) {
  const slot   = slots[slotName];
  const poster = getPoster(video);

  const titleParts = useMemo(() => {
    const words = video.title.toUpperCase().split(" ");
    const last  = words.pop() ?? "";
    return { rest: words.join(" "), last };
  }, [video.title]);

  return (
    <motion.div
      aria-hidden={!isCenter}
      animate={{ x: slot.x, rotateY: slot.rotateY, scale: slot.scale, opacity: slot.opacity, zIndex: slot.zIndex }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.4 } }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -(slot.width * (9 / 16) / 2),
        marginLeft: -(slot.width / 2),
        width: slot.width,
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
        pointerEvents: slotName === "hidden" ? "none" : "auto",
        willChange: "transform, opacity",
      }}
    >
      <div className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          borderRadius: isCenter ? 14 : 10,
          background: "#0c0c0e",
          border: isCenter ? "1.5px solid rgba(215,35,35,0.80)" : "1px solid rgba(255,255,255,0.09)",
          boxShadow: isCenter
            ? "0 0 0 1px rgba(215,35,35,0.18), 0 0 48px rgba(195,28,28,0.55), 0 0 100px rgba(170,15,15,0.22), 0 24px 56px rgba(0,0,0,0.90)"
            : "0 8px 32px rgba(0,0,0,0.70)",
        }}>
        <img src={poster} alt={video.title} onError={imgFallback(video)} className="absolute inset-0 h-full w-full object-cover object-center" style={{ transition: "opacity 0.5s ease" }} />
        {!isCenter && <div className="absolute inset-0 bg-black/38" />}
        <div className="absolute inset-0" style={{
          background: isCenter
            ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.68) 32%, rgba(0,0,0,0.12) 58%, transparent 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.05) 72%, transparent 100%)",
        }} />

        {isCenter && <div className="absolute inset-x-0 bottom-0 z-30" style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(215,35,35,0.95) 35%, rgba(215,35,35,0.95) 65%, transparent 100%)" }} />}
        {isCenter && (
          <div className="absolute left-3 top-3 z-20" style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 5, padding: "3px 8px", backdropFilter: "blur(6px)" }}>
            <span className="font-orbitron text-[9px] font-semibold uppercase tracking-[0.20em] text-white/82">Featured</span>
          </div>
        )}
        {video.duration && (
          <div className="absolute right-2.5 top-2.5 z-20" style={{ background: "rgba(0,0,0,0.70)", borderRadius: 4, padding: "2px 7px" }}>
            <span className="font-mono text-[9px] font-semibold text-white/78">{video.duration}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10" style={{ padding: isCenter ? "10px 13px 13px" : "7px 9px 9px" }}>
          <div style={{ display: "inline-block", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 4, padding: "1px 6px", marginBottom: 5 }}>
            <span className="font-orbitron text-[7px] font-semibold uppercase tracking-[0.14em] text-white/52">{video.category || "Film"}</span>
          </div>
          <div className="font-orbitron font-black uppercase leading-none text-white" style={{ fontSize: isCenter ? "clamp(11px, 1.3vw, 17px)" : "clamp(7px, 0.85vw, 11px)", letterSpacing: "0.01em" }}>
            {titleParts.rest && <span className="block leading-tight">{titleParts.rest}</span>}
            <span className="block italic leading-tight" style={{ color: "#e52222", fontSize: "1.16em" }}>{titleParts.last}</span>
          </div>
          {isCenter && video.description && <p className="mt-1.5 line-clamp-2 leading-snug text-white/58" style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}>{video.description}</p>}
          {isCenter && onPlayClick && (
            <div className="mt-2.5 flex items-center gap-2">
              <button type="button" onClick={onPlayClick}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg font-orbitron font-black uppercase tracking-[0.10em] text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.025] active:scale-[0.975] focus:outline-none"
                style={{ height: isMobile ? 34 : 38, fontSize: "clamp(10px,0.95vw,13px)", background: "linear-gradient(135deg,#aa1515 0%,#de1f1f 100%)", boxShadow: "0 4px 18px rgba(195,25,25,0.55)", border: "none" }}>
                <Play size={isMobile ? 11 : 13} fill="white" /> Play
              </button>
              <button type="button" className="flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200 focus:outline-none" style={{ width: isMobile ? 34 : 38, height: isMobile ? 34 : 38, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", fontSize: 15, letterSpacing: 2 }}>···</button>
            </div>
          )}
        </div>
      </div>
      {isCenter && <div aria-hidden="true" style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", width: "70%", height: 14, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(195,28,28,0.32) 0%, transparent 70%)", pointerEvents: "none" }} />}
    </motion.div>
  );
}

/* ── Title Bar Header Component ──────────────────────────────────── */
function TitleBar({ active }: { active: FeaturedVideo }) {
  return (
    <div className="w-full flex flex-col items-center text-center pointer-events-none select-none">
      <motion.div className="flex items-center gap-2 text-primary" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ fontSize: "clamp(7.5px, 0.8vw, 10px)", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "clamp(4px, 0.6vh, 8px)" }}>
        <motion.span className="block h-px bg-primary w-6" initial={{ width: 0 }} animate={{ width: 24 }} transition={{ duration: 0.55, delay: 0.2 }} />
        <span className="font-orbitron whitespace-nowrap">Cinematic Automotive Content</span>
        <motion.span className="block h-px bg-primary w-6" initial={{ width: 0 }} animate={{ width: 24 }} transition={{ duration: 0.55, delay: 0.2 }} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.h1 key={active.id} initial={{ opacity: 0, y: 8, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(8px)" }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }} className="font-orbitron font-black uppercase tracking-wide text-white px-4 break-words line-clamp-2" style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.85rem)", lineHeight: 1.2, maxHeight: "2.4em", maxWidth: "min(860px, 90vw)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {active.title.toUpperCase()}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

/* ── Unified Responsive & Premium Controls Bar ───────────────────── */
function ControlsBar({
  slides, activeIdx, setActiveIdx, paused, setPaused, scrollToVideos,
}: {
  slides: FeaturedVideo[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToVideos: () => void;
}) {
  const N = slides.length;
  if (N <= 1) return null;

  return (
    <motion.div 
      className="flex flex-col items-center w-full mt-4" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      {/* Container: Same styling for desktop and mobile */}
      <div className="flex items-center gap-3 sm:gap-4 rounded-full border border-white/10 bg-black/50 backdrop-blur-md px-5 py-2.5 shadow-2xl">
        
        {/* Index Display */}
        <div className="font-orbitron tabular-nums text-[10px] tracking-[0.2em] text-white/50 min-w-[3.5em] text-center">
          {String(activeIdx + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </div>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Play/Pause Button with Integrated Ring */}
        <button 
          type="button" 
          onClick={() => setPaused(c => !c)} 
          aria-label={paused ? "Resume" : "Pause"}
          className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors"
        >
          <svg className="absolute inset-0 w-8 h-8 rotate-[-90deg] pointer-events-none">
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="2" />
            {!paused && (
              <motion.circle 
                cx="16" cy="16" r="13" fill="none" stroke="#d72323" strokeWidth="2"
                strokeDasharray={2 * Math.PI * 13}
                initial={{ strokeDashoffset: 2 * Math.PI * 13 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
              />
            )}
          </svg>
          {paused ? <Play size={10} fill="white" className="ml-0.5" /> : <Pause size={10} fill="white" />}
        </button>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Slide Progress Indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((s, i) => (
            <motion.button 
              key={s.id} 
              type="button" 
              onClick={() => setActiveIdx(i)}
              className="h-1 rounded-full transition-all duration-300"
              animate={{
                width: i === activeIdx ? 16 : 4,
                backgroundColor: i === activeIdx ? "#d72323" : "rgba(255, 255, 255, 0.25)",
              }}
            />
          ))}
        </div>
      </div>

      <HeroScrollCue onClick={scrollToVideos} />
    </motion.div>
  );
}

/* ── MAIN COMPONENT SECTION ── */
export default function FeaturedHero({ onPlay }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const [videos, setVideos]       = useState<FeaturedVideo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused]       = useState(false);

  const reduceMotion = useReducedMotion();
  const isMobile     = useIsMobile();
  const centerW      = useCenterWidth(isMobile);
  const slots        = useMemo(() => computeSlots(centerW, isMobile), [centerW, isMobile]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"], layoutEffect: false });
  const bgY            = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const mx  = useMotionValue(0); const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 22 });
  const smy = useSpring(my, { stiffness: 40, damping: 22 });
  const tiltX = useTransform(smy, [-1, 1], reduceMotion ? [0, 0] : [1.2, -1.2]);
  const tiltY = useTransform(smx, [-1, 1], reduceMotion ? [0, 0] : [-2.5, 2.5]);

  const slides = videos.length > 0 ? videos : FALLBACK;
  const N      = slides.length;
  const active = slides[activeIdx];

  const activeYtId = useMemo(() => getYtId(active), [active]);
  const activePoster = useMemo(() => getPoster(active), [active]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        if (!hasSupabaseConfig) { setLoading(false); return; }
        const cols = "id,title,description,category,storage_url,hls_url,thumbnail_url,duration,source_type,youtube_url,youtube_video_id";
        let { data } = await supabase.from("videos").select(cols).eq("is_homepage_featured", true).order("created_at", { ascending: false }).limit(8);
        if (!data?.length) {
          const res = await supabase.from("videos").select(cols).order("created_at", { ascending: false }).limit(8);
          data = res.data;
        }
        if (!cancelled && data?.length) { setVideos(data as unknown as FeaturedVideo[]); setActiveIdx(0); }
      } catch (err) { console.warn("FeaturedHero:", err); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (paused || N < 2) return;
    const id = window.setInterval(() => setActiveIdx(cur => wrap(cur + 1, N)), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, N]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }, [reduceMotion, isMobile, mx, my]);
  const handlePointerLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  const handlePlay = useCallback(() => {
    if (!active.id.startsWith("fb-")) { onPlay(active); return; }
    document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" });
  }, [active, onPlay]);

  const scrollToVideos = useCallback(() => {
    document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const showL2 = !isMobile && N > 2;
  const showL3 = !isMobile && N > 4;
  const cardStageH = Math.round(centerW * (9 / 16) * (isMobile ? 1.0 : 1.05));

  if (loading) {
    return (
      <section ref={sectionRef} className="relative overflow-hidden bg-black" style={{ height: "100vh", minHeight: 640, maxHeight: 1080 }}>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
          <div className="h-2 w-32 rounded-full bg-primary/20 animate-pulse" />
          <div className="h-6 w-72 max-w-full rounded bg-white/10 animate-pulse" />
          <div className="rounded-xl bg-white/6 animate-pulse border border-white/8" style={{ width: centerW, aspectRatio: "16/9" }} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full overflow-hidden bg-black text-white px-4 flex flex-col justify-center items-center"
      style={{
        height: isMobile ? "auto" : "100vh",
        minHeight: isMobile ? "auto" : 640,
        maxHeight: isMobile ? "none" : 1080,
        userSelect: "none",
        paddingTop: isMobile ? "40px" : "0px",
        paddingBottom: isMobile ? "40px" : "0px",
      }}
    >
      {/* Background Media Engine Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black" aria-hidden="true" style={{ zIndex: 0 }}>
        <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
          <AnimatePresence mode="popLayout">
            <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {activeYtId ? <VideoIframe ytId={activeYtId} /> : <StaticImageFallback poster={activePoster} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cinematic Environmental Filters */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: "rgba(0,0,0,0.22)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: "radial-gradient(ellipse 65% 45% at 50% 52%, rgba(195,28,28,0.18) 0%, transparent 70%)" }} />
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 1, height: "36%", background: "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.75) 55%, transparent 100%)" }} />

      {/* FIXED CONTENT ARCHITECTURE: Shifted spacing vectors to move the card stage downward into exact geometric center */}
      <motion.div 
        style={{ opacity: contentOpacity, zIndex: 3 }} 
        className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-8 sm:pt-14 md:pt-16 gap-5 sm:gap-7 md:gap-8"
      >
        <TitleBar active={active} />

        <motion.div
          className="w-full flex items-center justify-center"
          style={{
            position: "relative",
            height: cardStageH,
            marginTop: isMobile ? "10px" : "12px",
            marginBottom: isMobile ? "15px" : "12px",
            overflow: "visible",
            perspective: 1300,
            perspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            ...(isMobile ? {} : { rotateX: tiltX, rotateY: tiltY }),
          }}
        >
          {showL3 && N > 5 && (<>
            <HeroCard key={`l3-${wrap(activeIdx-3,N)}`} video={slides[wrap(activeIdx-3,N)]} slotName="left3"  slots={slots} isCenter={false} isMobile={isMobile} onPlayClick={handlePlay} />
            <HeroCard key={`r3-${wrap(activeIdx+3,N)}`} video={slides[wrap(activeIdx+3,N)]} slotName="right3" slots={slots} isCenter={false} isMobile={isMobile} onPlayClick={handlePlay} />
          </>)}
          {showL2 && N > 3 && (<>
            <HeroCard key={`l2-${wrap(activeIdx-2,N)}`} video={slides[wrap(activeIdx-2,N)]} slotName="left2"  slots={slots} isCenter={false} isMobile={isMobile} onPlayClick={handlePlay} />
            <HeroCard key={`r2-${wrap(activeIdx+2,N)}`} video={slides[wrap(activeIdx+2,N)]} slotName="right2" slots={slots} isCenter={false} isMobile={isMobile} onPlayClick={handlePlay} />
          </>)}
          {N > 1 && (<>
            <HeroCard key={`l1-${wrap(activeIdx-1,N)}`} video={slides[wrap(activeIdx-1,N)]} slotName="left1"  slots={slots} isCenter={false} isMobile={isMobile} onPlayClick={handlePlay} />
            <HeroCard key={`r1-${wrap(activeIdx+1,N)}`} video={slides[wrap(activeIdx+1,N)]} slotName="right1" slots={slots} isCenter={false} isMobile={isMobile} onPlayClick={handlePlay} />
          </>)}
          <HeroCard key={`c-${activeIdx}`} video={active} slotName="center" slots={slots} isCenter={true} isMobile={isMobile} onPlayClick={handlePlay} />
        </motion.div>

        <ControlsBar slides={slides} activeIdx={activeIdx} setActiveIdx={setActiveIdx} paused={paused} setPaused={setPaused} scrollToVideos={scrollToVideos} />
      </motion.div>
    </section>
  );
}