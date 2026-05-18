import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import VideoRow, { RowVideo } from "./VideoRow";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Comments } from "./Comments";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import ProVideoPlayer, { Chapter, PlayerVideo } from "./ProVideoPlayer";
import UpNextOverlay from "./UpNextOverlay";

interface Props {
  externalSelected?: RowVideo | null;
  onCloseExternal?: () => void;
  afterLatestSlot?: React.ReactNode;
  /** When true, hides the "Latest Releases" row (shown in hero filmstrip instead) */
  hideLatestRow?: boolean;
}

interface FullVideo extends RowVideo {
  hls_url?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  source_type?: string | null;
  chapters?: Chapter[] | null;
}

const HomeVideoRows = ({ externalSelected, onCloseExternal, afterLatestSlot, hideLatestRow }: Props) => {
  const [allVideos, setAllVideos] = useState<FullVideo[]>([]);
  const [continueWatching, setContinueWatching] = useState<RowVideo[]>([]);
  const [selected, setSelected] = useState<FullVideo | null>(null);
  const [showUpNext, setShowUpNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeVideo = useMemo<FullVideo | null>(() => {
    if (externalSelected) {
      return allVideos.find((v) => v.id === externalSelected.id) ?? (externalSelected as FullVideo);
    }
    return selected;
  }, [externalSelected, selected, allVideos]);

  useWatchProgress(videoRef, activeVideo?.id);

  // Up Next: next video in same category
  const upNext = useMemo<FullVideo | null>(() => {
    if (!activeVideo) return null;
    const same = allVideos.filter((v) => v.category === activeVideo.category);
    const idx = same.findIndex((v) => v.id === activeVideo.id);
    if (idx === -1) return null;
    return same[idx + 1] ?? null;
  }, [activeVideo, allVideos]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, title, category, storage_url, hls_url, thumbnail_url, duration, description, chapters, created_at, source_type, youtube_url, youtube_video_id")
        .order("created_at", { ascending: false });
      if (data) setAllVideos(data as unknown as FullVideo[]);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("watch_progress")
        .select("video_id, position_seconds, duration_seconds, completed")
        .eq("user_id", session.user.id)
        .eq("completed", false)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (data && data.length && allVideos.length) {
        const list: RowVideo[] = [];
        for (const p of data) {
          const v = allVideos.find((x) => x.id === p.video_id);
          if (v && p.duration_seconds) {
            list.push({
              ...v,
              progress_pct: (Number(p.position_seconds) / Number(p.duration_seconds)) * 100,
            });
          }
        }
        setContinueWatching(list);
      }
    };
    fetchProgress();
  }, [allVideos]);

  // Group by category
  const byCategory = allVideos.reduce<Record<string, FullVideo[]>>((acc, v) => {
    const cat = v.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  const categoryOrder = ["photoshoots", "vlogs", "reviews", "tutorials"];
  const sortedCategories = Object.keys(byCategory).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const handleClose = () => {
    setSelected(null);
    setShowUpNext(false);
    onCloseExternal?.();
  };

  const handleSelect = (v: RowVideo) => {
    const full = allVideos.find((x) => x.id === v.id) ?? (v as FullVideo);
    setShowUpNext(false);
    setSelected(full);
  };

  const playUpNext = () => {
    if (!upNext) return;
    setShowUpNext(false);
    if (externalSelected && onCloseExternal) {
      // External controller — close and let parent handle, then re-open via internal selection
      onCloseExternal();
    }
    setSelected(upNext);
  };

  const playerVideo: PlayerVideo | null = activeVideo
    ? {
        id: activeVideo.id,
        title: activeVideo.title,
        storage_url: activeVideo.storage_url,
        hls_url: activeVideo.hls_url ?? null,
        youtube_url: activeVideo.youtube_url ?? null,
        youtube_video_id: activeVideo.youtube_video_id ?? null,
        source_type: activeVideo.source_type ?? null,
        thumbnail_url: activeVideo.thumbnail_url ?? null,
        chapters: activeVideo.chapters ?? [],
      }
    : null;

  return (
    <div className="bg-background relative z-10 space-y-2 md:space-y-3 pb-3 md:pb-4">
      {continueWatching.length > 0 && (
        <VideoRow title="Continue Watching" videos={continueWatching} onSelect={handleSelect} />
      )}

      {!hideLatestRow && (
        <VideoRow
          title="Latest Releases"
          videos={allVideos.slice(0, 12)}
          onSelect={handleSelect}
          variant="featured"
        />
      )}

      {afterLatestSlot && (
        <div className="my-8 md:my-12">
          {afterLatestSlot}
        </div>
      )}

      {/* Video category rows removed — replaced by PhotoRows on the homepage */}

      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-7xl p-0 bg-background max-h-[95vh] overflow-y-auto">
          <DialogTitle className="sr-only">Video Player</DialogTitle>
          <DialogDescription className="sr-only">
            Watch {activeVideo?.title}
          </DialogDescription>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
          {playerVideo && (
            <div className="p-4 md:p-6 space-y-6">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <ProVideoPlayer
                  video={playerVideo}
                  videoRef={videoRef}
                  onEnded={() => upNext && setShowUpNext(true)}
                  upNextLabel={upNext?.title}
                  onUpNextClick={playUpNext}
                />
                {showUpNext && upNext && (
                  <UpNextOverlay
                    nextTitle={upNext.title}
                    nextThumb={upNext.thumbnail_url}
                    onPlayNow={playUpNext}
                    onCancel={() => setShowUpNext(false)}
                  />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-orbitron font-bold text-foreground">
                    {activeVideo?.title}
                  </h2>
                  {activeVideo?.category && (
                    <p className="text-muted-foreground capitalize mt-1">
                      {activeVideo.category}
                    </p>
                  )}
                  {activeVideo?.description && (
                    <p className="text-foreground mt-3">{activeVideo.description}</p>
                  )}
                </div>
                <Comments videoId={activeVideo!.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeVideoRows;
