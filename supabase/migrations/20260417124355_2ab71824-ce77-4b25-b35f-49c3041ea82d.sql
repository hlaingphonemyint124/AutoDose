-- Create shows table
CREATE TABLE public.shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  cover_image_url TEXT,
  backdrop_image_url TEXT,
  trailer_video_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shows"
  ON public.shows FOR SELECT USING (true);

CREATE POLICY "Only admins can insert shows"
  ON public.shows FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update shows"
  ON public.shows FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete shows"
  ON public.shows FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Add episode metadata to videos
ALTER TABLE public.videos
  ADD COLUMN show_id UUID REFERENCES public.shows(id) ON DELETE SET NULL,
  ADD COLUMN season_number INTEGER,
  ADD COLUMN episode_number INTEGER,
  ADD COLUMN description TEXT;

CREATE INDEX idx_videos_show_id ON public.videos(show_id);
CREATE INDEX idx_shows_is_featured ON public.shows(is_featured) WHERE is_featured = true;

-- Reusable updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_shows_updated_at
  BEFORE UPDATE ON public.shows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();