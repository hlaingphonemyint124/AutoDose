ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS hls_url text,
  ADD COLUMN IF NOT EXISTS chapters jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.videos.hls_url IS 'Optional URL to an HLS .m3u8 master playlist. When present, the player uses HLS for adaptive quality switching.';
COMMENT ON COLUMN public.videos.chapters IS 'Array of chapter markers: [{ "time": number (seconds), "title": string }]';