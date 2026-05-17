-- Run this in Supabase SQL Editor if the column doesn't exist yet
-- Dashboard → SQL Editor → New Query → Run

ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_homepage_featured BOOLEAN DEFAULT false;

-- Index for fast homepage query
CREATE INDEX IF NOT EXISTS idx_videos_homepage_featured 
  ON videos (is_homepage_featured, created_at DESC);

-- Optional: set your first few videos as featured
-- UPDATE videos SET is_homepage_featured = true WHERE id IN (
--   SELECT id FROM videos ORDER BY created_at DESC LIMIT 5
-- );
