-- Create functions to increment/decrement likes
CREATE OR REPLACE FUNCTION public.increment_photo_likes(photo_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.photos
  SET likes = likes + 1
  WHERE id = photo_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_photo_likes(photo_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.photos
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = photo_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_video_likes(video_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.videos
  SET likes = likes + 1
  WHERE id = video_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_video_likes(video_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.videos
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = video_id;
$$;