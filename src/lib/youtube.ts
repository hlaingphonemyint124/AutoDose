const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export const getYouTubeVideoId = (urlOrId?: string | null): string | null => {
  if (!urlOrId) return null;
  const value = urlOrId.trim();
  if (!value) return null;
  if (YOUTUBE_ID_PATTERN.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
      const id = embedIndex >= 0 ? parts[embedIndex + 1] : null;
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeThumbnail = (urlOrId?: string | null): string | null => {
  const id = getYouTubeVideoId(urlOrId);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
};

export const getYouTubeFallbackThumbnail = (urlOrId?: string | null): string | null => {
  const id = getYouTubeVideoId(urlOrId);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

export const getYouTubeEmbedUrl = (
  urlOrId: string,
  options: {
    autoplay?: boolean;
    muted?: boolean;
    controls?: boolean;
    loop?: boolean;
  } = {}
): string | null => {
  const id = getYouTubeVideoId(urlOrId);
  if (!id) return null;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    vq: "hd1080",
  });

  if (options.autoplay) params.set("autoplay", "1");
  if (options.muted) params.set("mute", "1");
  if (options.controls === false) params.set("controls", "0");
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
};

export const isYouTubeVideo = (video: {
  source_type?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  storage_url?: string | null;
}) =>
  video.source_type === "youtube" ||
  !!getYouTubeVideoId(video.youtube_video_id || video.youtube_url || video.storage_url);
