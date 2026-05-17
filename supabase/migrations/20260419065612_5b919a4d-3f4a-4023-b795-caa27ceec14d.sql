-- Photo Stories: curated editorial essays
CREATE TABLE public.photo_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  intro text,
  cover_image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.photo_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photo stories"
  ON public.photo_stories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert photo stories"
  ON public.photo_stories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update photo stories"
  ON public.photo_stories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete photo stories"
  ON public.photo_stories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_photo_stories_updated_at
  BEFORE UPDATE ON public.photo_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Story items: ordered photos within a story, with per-story caption
CREATE TABLE public.photo_story_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.photo_stories(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (story_id, photo_id)
);

ALTER TABLE public.photo_story_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photo story items"
  ON public.photo_story_items FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert photo story items"
  ON public.photo_story_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update photo story items"
  ON public.photo_story_items FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete photo story items"
  ON public.photo_story_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_photo_story_items_story ON public.photo_story_items(story_id, display_order);