-- Watch progress tracking per user
CREATE TABLE public.watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  position_seconds NUMERIC NOT NULL DEFAULT 0,
  duration_seconds NUMERIC,
  completed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watch progress"
ON public.watch_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch progress"
ON public.watch_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch progress"
ON public.watch_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch progress"
ON public.watch_progress FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_watch_progress_user_updated ON public.watch_progress (user_id, updated_at DESC);

CREATE TRIGGER update_watch_progress_updated_at
BEFORE UPDATE ON public.watch_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();