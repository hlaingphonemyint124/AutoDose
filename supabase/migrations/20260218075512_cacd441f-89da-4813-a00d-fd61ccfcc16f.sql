-- Add featured flags to photos and videos for homepage sections
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS is_homepage_featured boolean DEFAULT false;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_homepage_featured boolean DEFAULT false;

-- RLS: Admin can update featured flag (already covered by existing admin update policies)
-- No new policies needed since existing "Only admins can update" policies cover this
