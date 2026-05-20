/**
 * FeaturedHero — AUTODOSE v7.2 (Pro-Fix: True 16:9 Cards, Auto-Crop Fill, Responsive Simple Dots)
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
import { ChevronDown, Play } from "lucide-react";
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
const AUTO_MS = 12000;

const FALLBACK: FeaturedVideo[] = [
  { id: "fb-1", title: "Mod In Myanmar Day-2 | Speed Loving Toyota Meet", description: "Street stories from Myanmar's thriving car culture.", category: "Car Meet", storage_url: "", thumbnail_url: heroImage, duration: "04:12" },
  { id: "fb-2", title: "AUTODOSE Weekly Vlog-03", description: "Weekly dose of JDM content from Yangon's streets.", category: "Vlog", storage_url: "", thumbnail_url: heroImage, duration: "03:47" },
  { id: "fb-3", title: "JDM Culture Myanmar", description: "Street stories from Myanmar's thriving JDM scene.", category: "Documentary", storage_url: "", thumbnail_url: heroImage, duration: "05:23" },
  { id: "fb-4", title: "Midnight Run Vol.3", description: "Late-night shoots. Chrome under streetlights.", category: "Night Shots", storage_url: "", thumbnail_url: heroImage, duration: "06:01" },
  { id: "fb-5", title: "Subaru WRX Hawkeye Driving Scenes", description: "Raw driving footage from Myanmar's mountain roads.", category: "Driving", storage_url: "", thumbnail_url: heroImage, duration: "02:58" },
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

/* ── Smart Video Engine (Full Crop No Gaps) ─────────────── */
function SmartBackgroundEngine({ ytId, poster }: { ytId: string; poster: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerId = useMemo(() => `yt-engine-${ytId}-${Math.random().toString(36).substring(2, 7)}`, [ytId]);

  useEffect(() => {
    setIsPlaying(false);
    let player: any;
    let isMounted = true;

    const initPlayer = () => {
      if (!(window as any).YT || !isMounted) return;
      player = new (window as any).YT.Player(containerId, {
        videoId: ytId,
        playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: ytId, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1 },
        events: { onStateChange: (event: any) => { if (event.data === 1 && isMounted) setIsPlaying(true); } },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const frameScript = document.getElementsByTagName("script")[0];
      if (frameScript && frameScript.parentNode) {
        frameScript.parentNode.insertBefore(tag, frameScript);
      } else {
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const checkReady = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(checkReady);
          initPlayer();
        }
      }, 60);
    }
    return () => { isMounted = false; if (player && player.destroy) player.destroy(); };
  }, [ytId, containerId]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-none">
      <div 
        style={{
          position: "absolute", top: "-10%", left: "-10%", width: "120%", height: "120%",
          backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(12px) brightness(0.24)", transform: "scale(1.05)",
        }} 
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: isPlaying ? 1 : 0 }} transition={{ duration: 0.65 }} style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "100vw", height: "56.25vw", minHeight: "100vh", minWidth: "177.78vh", transform: "translate(-50%, -50%) scale(1.05)", filter: "blur(4px) saturate(1.15) brightness(0.24)" }}>
          <div id={containerId} style={{ width: "100%", height: "100%", border: "none" }} />
        </div>
      </motion.div>
    </div>
  );
}

function HeroScrollCue({ onClick }: { onClick: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button type="button" onClick={onClick} aria-label="Scroll to videos" className="flex flex-col items-center gap-1.5 text-white/35 hover:text-primary transition-colors duration-200 focus:outline-none mt-3 md:mt-4 shrink-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.5 }}>
      <span className="font-orbitron text-[8px] font-semibold uppercase tracking-[0.35em] text-white/30">Scroll</span>
      <motion.span animate={reduceMotion ? undefined : { y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-sm">
        <ChevronDown size={14} strokeWidth={2.5} className="text-primary" />
      </motion.span>
    </motion.button>
  );
}

/* ── Carousel Math Layouts ───────────────────────────────────────── */
type SlotName = "center" | "left1" | "left2" | "left3" | "right1" | "right2" | "right3" | "hidden";
interface SlotConfig { x: number; rotateY: number; scale: number; opacity: number; zIndex: number; width: number; height: number; }

function computeSlots(centerW: number, winWidth: number): Record<SlotName, SlotConfig> {
  const isMobileOrTablet = winWidth < 1024;
  const sideW = isMobileOrTablet ? centerW * 0.88 : centerW * 0.82;
  const gap1 = isMobileOrTablet ? centerW * 0.03 : centerW * 0.05;
  const gap2 = centerW * 0.04;
  const gap3 = centerW * 0.03;
  const s1 = isMobileOrTablet ? 0.85 : 0.86;
  const s2 = isMobileOrTablet ? 0.72 : 0.72;
  const s3 = 0.58;
  
  const x1 = centerW / 2 + (sideW * s1) / 2 + gap1;
  const x2 = x1 + (sideW * s1) / 2 + (sideW * s2) / 2 + gap2;
  const x3 = x2 + (sideW * s2) / 2 + (sideW * s3) / 2 + gap3;
  
  // Strict 16:9 Aspect Ratio enforcement
  const centerH = centerW * (9 / 16);
  const sideH = sideW * (9 / 16);

  return {
    center: { x: 0,   rotateY: 0,   scale: 1,   opacity: 1,    zIndex: 20, width: centerW, height: centerH },
    left1:  { x: -x1, rotateY: 14,  scale: s1,  opacity: 0.85, zIndex: 16, width: sideW,   height: sideH },
    left2:  { x: -x2, rotateY: 22,  scale: s2,  opacity: 0.55, zIndex: 12, width: sideW,   height: sideH },
    left3:  { x: -x3, rotateY: 28,  scale: s3,  opacity: 0.28, zIndex: 8,  width: sideW,   height: sideH },
    right1: { x:  x1, rotateY: -14, scale: s1,  opacity: 0.85, zIndex: 16, width: sideW,   height: sideH },
    right2: { x:  x2, rotateY: -22, scale: s2,  opacity: 0.55, zIndex: 12, width: sideW,   height: sideH },
    right3: { x:  x3, rotateY: -28, scale: s3,  opacity: 0.28, zIndex: 8,  width: sideW,   height: sideH },
    hidden: { x: 0,   rotateY: 0,   scale: 0.4, opacity: 0,    zIndex: 0,  width: sideW,   height: sideH },
  };
}

function useCenterWidth(winWidth: number): number {
  if (winWidth < 400) return winWidth - 32;
  if (winWidth < 640) return Math.max(winWidth - 48, 280); 
  if (winWidth < 1024) return Math.max(winWidth - 120, 480); 
  return Math.round(Math.min(Math.max(winWidth * 0.46, 420), 680)); 
}

/* ── Hero Carousel Card Component ────────────────────────────────── */
interface CardProps {
  video: FeaturedVideo;
  slotName: SlotName;
  slots: Record<SlotName, SlotConfig>;
  isCenter: boolean;
  isMobileOrTablet: boolean;
  onPlayClick: () => void;
}

function HeroCard({ video, slotName, slots, isCenter, isMobileOrTablet, onPlayClick }: CardProps) {
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
      transition={{ type: "spring", stiffness: 140, damping: 22, mass: 1.1, opacity: { duration: 0.35 } }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: slot.width,
        height: slot.height,          
        marginTop: -(slot.height / 2), 
        marginLeft: -(slot.width / 2),
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
        pointerEvents: slotName === "hidden" ? "none" : "auto",
        willChange: "transform, opacity",
      }}
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-300 group"
        style={{
          borderRadius: isCenter ? 14 : 10,
          background: "#0c0c0e",
          border: isCenter ? "1.5px solid rgba(215,35,35,0.85)" : "1px solid rgba(255,255,255,0.09)",
          boxShadow: isCenter ? "0 0 0 1px rgba(215,35,35,0.18), 0 0 54px rgba(195,28,28,0.50), 0 0 110px rgba(170,15,15,0.20), 0 28px 64px rgba(0,0,0,0.95)" : "0 8px 32px rgba(0,0,0,0.70)",
        }}>
        
        <img 
          src={poster} 
          alt={video.title} 
          onError={imgFallback(video)} 
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 scale-[1.03] group-hover:scale-[1.10]" 
        />
        
        {!isCenter && <div className="absolute inset-0 bg-black/45 transition-colors duration-300 group-hover:bg-black/25" />}
        <div className="absolute inset-0" style={{ background: isCenter ? "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.68) 35%, rgba(0,0,0,0.10) 60%, transparent 100%)" : "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.05) 72%, transparent 100%)" }} />

        {isCenter && <div className="absolute inset-x-0 bottom-0 z-30" style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(215,35,35,0.95) 35%, rgba(215,35,35,0.95) 65%, transparent 100%)" }} />}
        
        {isCenter && (
          <div className="absolute left-3 top-3 z-20" style={{ background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 5, padding: "3px 8px", backdropFilter: "blur(6px)" }}>
            <span className="font-orbitron text-[9px] font-semibold uppercase tracking-[0.20em] text-white/82">Featured</span>
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 z-10" style={{ padding: isCenter ? "14px 18px 18px" : "7px 9px 9px" }}>
          <div style={{ display: "inline-block", border: "1px solid rgba(255,255,255,0.20)", borderRadius: 4, padding: "1px 6px", marginBottom: 5 }}>
            <span className="font-orbitron text-[7px] font-semibold uppercase tracking-[0.14em] text-white/52">{video.category || "Film"}</span>
          </div>
          <div className="font-orbitron font-black uppercase leading-none text-white" style={{ fontSize: isCenter ? "clamp(13px, 3.5vw, 18px)" : "clamp(7px, 0.85vw, 11px)", letterSpacing: "0.01em" }}>
            {titleParts.rest && <span className="block leading-tight">{titleParts.rest}</span>}
            <span className="block italic leading-tight" style={{ color: "#e52222", fontSize: "1.16em" }}>{titleParts.last}</span>
          </div>
          {isCenter && video.description && <p className="mt-1.5 line-clamp-2 leading-snug text-white/60" style={{ fontSize: "clamp(10px, 2.5vw, 12px)" }}>{video.description}</p>}
          {isCenter && onPlayClick && (
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={onPlayClick} className="flex flex-1 items-center justify-center gap-2 rounded-lg font-orbitron font-black uppercase tracking-[0.10em] text-white transition-all duration-300 hover:brightness-110 hover:scale-[1.015] active:scale-[0.965] focus:outline-none" style={{ height: isMobileOrTablet ? 40 : 42, fontSize: "clamp(11px,1vw,13px)", background: "linear-gradient(135deg,#aa1515 0%,#de1f1f 100%)", boxShadow: "0 4px 18px rgba(195,25,25,0.45)", border: "none" }}>
                <Play size={12} fill="white" /> Play
              </button>
              <button type="button" className="flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200 focus:outline-none hover:scale-[1.02]" style={{ width: isMobileOrTablet ? 40 : 42, height: isMobileOrTablet ? 40 : 42, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", fontSize: 16, letterSpacing: 2 }}>···</button>
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
    <div className="w-full flex flex-col items-center text-center pointer-events-none select-none z-10 px-2 overflow-visible">
      <motion.div className="flex items-center justify-center flex-nowrap w-full gap-2 md:gap-3 text-primary mb-1 md:mb-2 max-w-[96vw]" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <motion.span className="block h-px bg-primary w-4 md:w-6 shrink-0" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.55, delay: 0.2 }} style={{ maxWidth: 24 }} />
        <span className="font-orbitron shrink-0 whitespace-nowrap" style={{ fontSize: "clamp(8px, 2.2vw, 10px)", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase" }}>
          Cinematic Automotive Content
        </span>
        <motion.span className="block h-px bg-primary w-4 md:w-6 shrink-0" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.55, delay: 0.2 }} style={{ maxWidth: 24 }} />
      </motion.div>
      
      <div className="relative py-1 w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.h1 
            key={active.id} 
            initial={{ y: 8, filter: "blur(5px)", opacity: 0 }} animate={{ y: 0, filter: "blur(0px)", opacity: 1 }} exit={{ y: -8, filter: "blur(4px)", opacity: 0 }} transition={{ duration: 0.52, ease: "easeInOut" }} 
            className="font-orbitron font-black uppercase tracking-wide text-white text-center w-full px-4" 
            style={{ fontSize: "clamp(16px, 4.4vw, 30px)", lineHeight: 1.25, maxWidth: "94vw" }}
          >
            {active.title.toUpperCase()}
          </motion.h1>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Unified Responsive Ticker Progress Controls Bar ────────────────── */
function ControlsBar({ slides, activeIdx, setActiveIdx, scrollToVideos, isMobile }: { slides: FeaturedVideo[]; activeIdx: number; setActiveIdx: (i: number) => void; scrollToVideos: () => void; isMobile: boolean; }) {
  const N = slides.length;
  if (N <= 1) return null;

  // Responsive dimensions for the dots
  const dotHeight = isMobile ? "4px" : "6px";
  const activeWidth = isMobile ? "20px" : "32px";
  const inactiveWidth = isMobile ? "4px" : "6px";

  return (
    <motion.div className="flex flex-col items-center w-full mt-6 md:mt-8 select-none z-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.52 }}>
      <div className="flex items-center flex-nowrap gap-3 md:gap-5 rounded-full border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-xl px-4 md:px-6 py-2 md:py-2.5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] max-w-[92vw] overflow-hidden">
        
        <div className="font-orbitron font-semibold tabular-nums text-[10px] md:text-[12px] tracking-[0.2em] text-white/50 shrink-0 text-center flex items-center">
          {String(activeIdx + 1).padStart(2, "0")} <span className="text-primary italic mx-1.5">/</span> {String(N).padStart(2, "0")}
        </div>

        <div className="w-px h-4 md:h-5 bg-white/[0.12] shrink-0" />

        <div className="flex items-center flex-nowrap gap-1.5 md:gap-2.5 px-1 overflow-x-auto no-scrollbar scroll-smooth min-w-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {slides.map((s, i) => {
            const isCurrent = i === activeIdx;
            return (
              <button 
                key={s.id} 
                type="button" 
                onClick={() => setActiveIdx(i)}
                className="group relative flex-none rounded-full overflow-hidden transition-all duration-300 focus:outline-none cursor-pointer"
                style={{ 
                  height: dotHeight,
                  width: isCurrent ? activeWidth : inactiveWidth, 
                  backgroundColor: isCurrent ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)"
                }}
              >
                {isCurrent && (
                  <motion.div 
                    initial={{ left: "-100%" }} 
                    animate={{ left: "0%" }} 
                    transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                    className="absolute top-0 bottom-0 right-0 bg-primary rounded-full w-full" 
                    style={{ boxShadow: "0 0 10px rgba(215,35,35,0.85)" }}
                  />
                )}
              </button>
            );
          })}
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
  const [winSize, setWinSize]     = useState({ width: typeof window !== "undefined" ? window.innerWidth : 1024 });

  useEffect(() => {
    const handleResize = () => setWinSize({ width: window.innerWidth });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const reduceMotion = useReducedMotion();
  const isMobile     = useIsMobile();
  const centerW      = useCenterWidth(winSize.width);
  const slots        = useMemo(() => computeSlots(centerW, winSize.width), [centerW, winSize.width]);
  const isMobileOrTablet = winSize.width < 1024;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"], layoutEffect: false });
  const bgY            = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const mx = useMotionValue(0); const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 45, damping: 24 });
  const smy = useSpring(my, { stiffness: 45, damping: 24 });
  const tiltX = useTransform(smy, [-1, 1], reduceMotion ? [0, 0] : [1.4, -1.4]);
  const tiltY = useTransform(smx, [-1, 1], reduceMotion ? [0, 0] : [-2.8, 2.8]);

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
    if (N < 2) return;
    const id = window.setInterval(() => setActiveIdx(cur => wrap(cur + 1, N)), AUTO_MS);
    return () => window.clearInterval(id);
  }, [N]);

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

  const scrollToVideos = useCallback(() => document.getElementById("video-rows")?.scrollIntoView({ behavior: "smooth" }), []);

  const showL2 = !isMobile && N > 2;
  const showL3 = !isMobile && N > 4;
  
  // Strict Stage Height Calculation based purely on 16:9 width rules
  const cardStageH = Math.round(slots.center.height);

  if (loading) {
    return (
      <section ref={sectionRef} className="relative overflow-hidden bg-black h-screen">
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
      ref={sectionRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
      className="relative w-full overflow-hidden bg-black text-white px-3 md:px-4 flex flex-col justify-center items-center select-none"
      style={{
        minHeight: isMobileOrTablet ? "auto" : "100vh",
        maxHeight: isMobileOrTablet ? "none" : 1080,
        paddingTop: isMobileOrTablet ? "100px" : "0px",
        paddingBottom: isMobileOrTablet ? "40px" : "0px", 
      }}
    >
      {/* Background Media Engine Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black" aria-hidden="true" style={{ zIndex: 0 }}>
        <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.65, ease: "easeInOut" }} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {activeYtId ? (
                <SmartBackgroundEngine ytId={activeYtId} poster={activePoster} />
              ) : (
                <div style={{ position: "absolute", inset: "-10%", backgroundImage: `url(${activePoster})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(6px) saturate(1.15) brightness(0.24)", transform: "scale(1.1)" }} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cinematic Environmental Filters */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: "rgba(0,0,0,0.25)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: "radial-gradient(ellipse 65% 45% at 50% 52%, rgba(195,28,28,0.18) 0%, transparent 70%)" }} />
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ zIndex: 1, height: "38%", background: "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.78) 55%, transparent 100%)" }} />

      {/* Main Alignment Layout Stage */}
      <motion.div style={{ opacity: contentOpacity, zIndex: 3 }} className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-2 sm:pt-12 md:pt-16 gap-3 sm:gap-6 md:gap-8 h-full">
        
        <TitleBar active={active} />

        <motion.div
          className="w-full flex items-center justify-center"
          style={{
            position: "relative",
            height: cardStageH,
            marginTop: isMobile ? "8px" : "16px",
            marginBottom: isMobile ? "8px" : "16px",
            overflow: "visible",
            perspective: 1300,
            perspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            ...(isMobile ? {} : { rotateX: tiltX, rotateY: tiltY }),
          }}
        >
          {showL3 && N > 5 && (<>
            <HeroCard key={`l3-${wrap(activeIdx-3,N)}`} video={slides[wrap(activeIdx-3,N)]} slotName="left3"  slots={slots} isCenter={false} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
            <HeroCard key={`r3-${wrap(activeIdx+3,N)}`} video={slides[wrap(activeIdx+3,N)]} slotName="right3" slots={slots} isCenter={false} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
          </>)}
          {showL2 && N > 3 && (<>
            <HeroCard key={`l2-${wrap(activeIdx-2,N)}`} video={slides[wrap(activeIdx-2,N)]} slotName="left2"  slots={slots} isCenter={false} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
            <HeroCard key={`r2-${wrap(activeIdx+2,N)}`} video={slides[wrap(activeIdx+2,N)]} slotName="right2" slots={slots} isCenter={false} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
          </>)}
          {N > 1 && (<>
            <HeroCard key={`l1-${wrap(activeIdx-1,N)}`} video={slides[wrap(activeIdx-1,N)]} slotName="left1"  slots={slots} isCenter={false} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
            <HeroCard key={`r1-${wrap(activeIdx+1,N)}`} video={slides[wrap(activeIdx+1,N)]} slotName="right1" slots={slots} isCenter={false} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
          </>)}
          <HeroCard key={`c-${activeIdx}`} video={active} slotName="center" slots={slots} isCenter={true} isMobileOrTablet={isMobileOrTablet} onPlayClick={handlePlay} />
        </motion.div>

        <ControlsBar slides={slides} activeIdx={activeIdx} setActiveIdx={setActiveIdx} scrollToVideos={scrollToVideos} isMobile={isMobile} />
      </motion.div>
    </section>
  );
}