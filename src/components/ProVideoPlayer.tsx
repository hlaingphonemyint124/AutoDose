import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ListVideo,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl, isYouTubeVideo } from "@/lib/youtube";

export interface Chapter {
  time: number; // seconds
  title: string;
}

export interface PlayerVideo {
  id: string;
  title: string;
  storage_url: string;
  hls_url?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  source_type?: string | null;
  thumbnail_url?: string | null;
  chapters?: Chapter[] | null;
}

interface QualityLevel {
  index: number; // -1 for auto
  label: string;
  height?: number;
}

interface Props {
  video: PlayerVideo;
  videoRef: React.RefObject<HTMLVideoElement>;
  onEnded?: () => void;
  upNextLabel?: string;
  onUpNextClick?: () => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = m.toString().padStart(h ? 2 : 1, "0");
  const ss = sec.toString().padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const ProVideoPlayer = ({ video, videoRef, onEnded, upNextLabel, onUpNextClick }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [activeQuality, setActiveQuality] = useState<number>(-1);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);

  const chapters: Chapter[] = Array.isArray(video.chapters) ? video.chapters : [];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(video.youtube_video_id || video.youtube_url || video.storage_url, {
    autoplay: true,
    controls: true,
  });
  const useYouTube = isYouTubeVideo(video) && !!youtubeEmbedUrl;

  // ---------- Source loading (HLS or MP4) ----------
  useEffect(() => {
    const v = videoRef.current;
    if (!v || useYouTube) return;

    // Cleanup any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hlsUrl = video.hls_url;
    const useHls = hlsUrl && Hls.isSupported();

    if (useHls) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels: QualityLevel[] = [
          { index: -1, label: "Auto" },
          ...hls.levels.map((lvl, i) => ({
            index: i,
            label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}kbps`,
            height: lvl.height,
          })),
        ];
        setQualities(levels);
        setActiveQuality(-1);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (hls.autoLevelEnabled) setActiveQuality(-1);
        else setActiveQuality(data.level);
      });
    } else if (hlsUrl && v.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      v.src = hlsUrl;
      setQualities([]);
    } else {
      v.src = video.storage_url;
      setQualities([]);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [video.id, video.hls_url, video.storage_url, videoRef, useYouTube]);

  // ---------- Video event listeners ----------
  useEffect(() => {
    const v = videoRef.current;
    if (!v || useYouTube) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrent(v.currentTime);
      if (v.buffered.length) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onLoaded = () => setDuration(v.duration || 0);
    const onVol = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };
    const onEnd = () => onEnded?.();
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("volumechange", onVol);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("volumechange", onVol);
      v.removeEventListener("ended", onEnd);
    };
  }, [videoRef, onEnded, useYouTube]);

  // Active chapter tracking
  useEffect(() => {
    if (!chapters.length) {
      setActiveChapterIndex(null);
      return;
    }
    let idx: number | null = null;
    for (let i = 0; i < chapters.length; i++) {
      if (current >= chapters[i].time) idx = i;
    }
    setActiveChapterIndex(idx);
  }, [current, chapters]);

  // ---------- Fullscreen ----------
  useEffect(() => {
    const onFs = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  }, []);

  // ---------- Controls helpers ----------
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  }, [videoRef]);

  const seek = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(t, v.duration || 0));
    },
    [videoRef]
  );

  const skip = useCallback((delta: number) => seek((videoRef.current?.currentTime ?? 0) + delta), [
    seek,
    videoRef,
  ]);

  const handleSpeed = (s: number) => {
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSpeed(s);
  };

  const handleQuality = (idx: number) => {
    if (!hlsRef.current) return;
    if (idx === -1) {
      hlsRef.current.currentLevel = -1; // auto
    } else {
      hlsRef.current.currentLevel = idx;
    }
    setActiveQuality(idx);
  };

  // ---------- Auto-hide controls ----------
  const bumpControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2800);
  }, [videoRef]);

  useEffect(() => {
    bumpControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [bumpControls]);

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowright":
          e.preventDefault();
          skip(5);
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-5);
          break;
        case "arrowup":
          e.preventDefault();
          if (videoRef.current) videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          if (videoRef.current) videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "j":
          skip(-10);
          break;
        case "l":
          skip(10);
          break;
      }
      bumpControls();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleMute, toggleFullscreen, skip, bumpControls, videoRef]);

  if (useYouTube) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-black">
        <iframe
          src={youtubeEmbedUrl}
          title={video.title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const pct = duration ? (current / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group/player select-none"
      onMouseMove={bumpControls}
      onMouseLeave={() => {
        if (videoRef.current && !videoRef.current.paused) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full"
        controlsList="nodownload"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        poster={video.thumbnail_url || undefined}
      />

      {/* Center play overlay when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          aria-label="Play"
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
            <Play className="text-primary-foreground ml-1" size={36} fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 px-4 pb-3 pt-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Active chapter title */}
        {activeChapterIndex !== null && chapters[activeChapterIndex] && (
          <div className="mb-2 text-xs text-white/80 font-medium">
            <span className="text-white/60">Chapter:</span> {chapters[activeChapterIndex].title}
          </div>
        )}

        {/* Progress bar with chapter ticks + buffered */}
        <div className="relative h-2 mb-3 group/scrub">
          <div className="absolute inset-0 rounded-full bg-white/20" />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            style={{ width: `${bufPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${pct}%` }}
          />
          {/* Chapter ticks */}
          {chapters.map((c, i) =>
            duration ? (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/70"
                style={{ left: `${(c.time / duration) * 100}%` }}
                title={c.title}
              />
            ) : null
          )}
          {/* Invisible slider for seeking */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center gap-2 text-white">
          <button onClick={togglePlay} className="p-2 hover:text-primary transition-colors" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
          </button>
          <button onClick={() => skip(-10)} className="p-2 hover:text-primary transition-colors" aria-label="Back 10s">
            <SkipBack size={20} />
          </button>
          <button onClick={() => skip(10)} className="p-2 hover:text-primary transition-colors" aria-label="Forward 10s">
            <SkipForward size={20} />
          </button>

          <div className="flex items-center gap-2 group/vol">
            <button onClick={toggleMute} className="p-2 hover:text-primary transition-colors" aria-label={muted ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="w-0 group-hover/vol:w-20 transition-all overflow-hidden">
              <Slider
                value={[muted ? 0 : volume]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([val]) => {
                  const v = videoRef.current;
                  if (!v) return;
                  v.volume = val;
                  v.muted = val === 0;
                }}
              />
            </div>
          </div>

          <span className="text-xs text-white/90 ml-2 tabular-nums">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Up Next */}
          {upNextLabel && onUpNextClick && (
            <button
              onClick={onUpNextClick}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors"
              title="Up Next"
            >
              <ListVideo size={16} />
              <span className="max-w-[180px] truncate">Up Next: {upNextLabel}</span>
            </button>
          )}

          {/* Chapters menu */}
          {chapters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-1.5 text-xs rounded hover:text-primary transition-colors" aria-label="Chapters">
                  Chapters
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border max-h-72 overflow-y-auto">
                <DropdownMenuLabel>Chapters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {chapters.map((c, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => seek(c.time)}
                    className={cn(
                      "cursor-pointer flex justify-between gap-4",
                      activeChapterIndex === i && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="truncate">{c.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatTime(c.time)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Settings: speed + quality */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:text-primary transition-colors" aria-label="Settings">
                <Settings size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border w-56">
              <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SPEEDS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => handleSpeed(s)}
                  className={cn("cursor-pointer flex justify-between", speed === s && "bg-primary/10 text-primary")}
                >
                  {s === 1 ? "Normal" : `${s}x`}
                  {speed === s && <span>✓</span>}
                </DropdownMenuItem>
              ))}
              {qualities.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Quality</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {qualities.map((q) => (
                    <DropdownMenuItem
                      key={q.index}
                      onClick={() => handleQuality(q.index)}
                      className={cn(
                        "cursor-pointer flex justify-between",
                        activeQuality === q.index && "bg-primary/10 text-primary"
                      )}
                    >
                      {q.label}
                      {activeQuality === q.index && <span>✓</span>}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={toggleFullscreen} className="p-2 hover:text-primary transition-colors" aria-label="Fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProVideoPlayer;
