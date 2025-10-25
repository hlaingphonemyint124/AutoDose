-- Create a table for homepage slideshow photos
CREATE TABLE IF NOT EXISTS public.slideshow_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for slideshow_photos
ALTER TABLE public.slideshow_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for slideshow_photos
CREATE POLICY "Anyone can view active slideshow photos"
ON public.slideshow_photos
FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can insert slideshow photos"
ON public.slideshow_photos
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update slideshow photos"
ON public.slideshow_photos
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete slideshow photos"
ON public.slideshow_photos
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));