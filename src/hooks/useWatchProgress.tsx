import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Saves video playback progress every 5 seconds for the logged-in user.
 * Pass a ref to the <video> element and the video id.
 */
export const useWatchProgress = (
  videoRef: React.RefObject<HTMLVideoElement>,
  videoId: string | null | undefined
) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!videoId || !videoRef.current) return;
    let userId: string | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      userId = session?.user?.id ?? null;
      if (!userId) return;

      // Restore previous position
      supabase
        .from("watch_progress")
        .select("position_seconds, duration_seconds")
        .eq("user_id", userId)
        .eq("video_id", videoId)
        .maybeSingle()
        .then(({ data }) => {
          if (data && videoRef.current && data.position_seconds > 5) {
            // Only resume if not finished
            if (!data.duration_seconds || data.position_seconds < data.duration_seconds - 10) {
              videoRef.current.currentTime = Number(data.position_seconds);
            }
          }
        });

      const save = async () => {
        const v = videoRef.current;
        if (!v || !userId || v.paused || !v.duration || isNaN(v.duration)) return;
        const completed = v.currentTime >= v.duration - 10;
        await supabase.from("watch_progress").upsert(
          {
            user_id: userId,
            video_id: videoId,
            position_seconds: Math.floor(v.currentTime),
            duration_seconds: Math.floor(v.duration),
            completed,
          },
          { onConflict: "user_id,video_id" }
        );
      };

      intervalRef.current = setInterval(save, 5000);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId, videoRef]);
};
