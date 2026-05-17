ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'youtube',
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text;

ALTER TABLE public.videos
  ALTER COLUMN storage_url DROP NOT NULL,
  ALTER COLUMN storage_url SET DEFAULT '';

ALTER TABLE public.videos
  ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_videos_source_type ON public.videos(source_type);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_video_id ON public.videos(youtube_video_id);

COMMENT ON COLUMN public.videos.source_type IS 'Video provider, usually youtube. Legacy uploaded videos can use file.';
COMMENT ON COLUMN public.videos.youtube_url IS 'Original YouTube watch, shorts, live, or youtu.be URL.';
COMMENT ON COLUMN public.videos.youtube_video_id IS 'Parsed 11-character YouTube video id for embedding and thumbnails.';
