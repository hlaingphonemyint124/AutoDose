-- AUTODOSE YouTube video fix only
-- Paste this if your existing database tables already exist.
-- This changes videos from stored-file-only to YouTube external-link support.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'youtube',
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS hls_url text,
  ADD COLUMN IF NOT EXISTS chapters jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS views integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_homepage_featured boolean DEFAULT false;

ALTER TABLE public.videos
  ALTER COLUMN storage_url DROP NOT NULL,
  ALTER COLUMN storage_url SET DEFAULT '',
  ALTER COLUMN file_path DROP NOT NULL,
  ALTER COLUMN source_type SET DEFAULT 'youtube';

CREATE INDEX IF NOT EXISTS idx_videos_user_id
ON public.videos(user_id);

CREATE INDEX IF NOT EXISTS idx_videos_featured
ON public.videos(is_homepage_featured, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_source_type
ON public.videos(source_type);

CREATE INDEX IF NOT EXISTS idx_videos_youtube_video_id
ON public.videos(youtube_video_id);

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS views integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_homepage_featured boolean DEFAULT false;

ALTER TABLE public.slideshow_photos
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

CREATE TABLE IF NOT EXISTS public.photo_story_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.photo_stories(id) ON DELETE CASCADE,
  photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.photo_story_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Story items are public" ON public.photo_story_items;
CREATE POLICY "Story items are public"
ON public.photo_story_items
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage story items" ON public.photo_story_items;
CREATE POLICY "Admins manage story items"
ON public.photo_story_items
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'hlaingphonemyint20@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

SELECT 'AUTODOSE YouTube fix applied successfully' AS result;
