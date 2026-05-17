import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getYouTubeThumbnail, getYouTubeVideoId } from "@/lib/youtube";

interface EditVideoDialogProps {
  video: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ChapterRow {
  time: string; // user input "mm:ss" or "h:mm:ss" or seconds
  title: string;
}

const parseTime = (input: string): number | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  const parts = trimmed.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
};

const formatTimeInput = (sec: number): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const EditVideoDialog = ({ video, open, onOpenChange, onSuccess }: EditVideoDialogProps) => {
  const [title, setTitle] = useState(video.title);
  const [category, setCategory] = useState(video.category || "");
  const [description, setDescription] = useState(video.description || "");
  const [youtubeUrl, setYoutubeUrl] = useState(video.youtube_url || video.storage_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnail_url || "");
  const [hlsUrl, setHlsUrl] = useState(video.hls_url || "");
  const [chapters, setChapters] = useState<ChapterRow[]>(
    Array.isArray(video.chapters) && video.chapters.length
      ? video.chapters.map((c: any) => ({ time: formatTimeInput(c.time), title: c.title }))
      : []
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addChapter = () => setChapters([...chapters, { time: "", title: "" }]);
  const removeChapter = (i: number) => setChapters(chapters.filter((_, idx) => idx !== i));
  const updateChapter = (i: number, field: keyof ChapterRow, value: string) =>
    setChapters(chapters.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate + normalize chapters
      const parsed: { time: number; title: string }[] = [];
      for (const c of chapters) {
        if (!c.title.trim() && !c.time.trim()) continue;
        const t = parseTime(c.time);
        if (t === null || t < 0) {
          throw new Error(`Invalid chapter time: "${c.time}". Use mm:ss or h:mm:ss.`);
        }
        if (!c.title.trim()) {
          throw new Error(`Chapter at ${c.time} needs a title.`);
        }
        parsed.push({ time: t, title: c.title.trim() });
      }
      parsed.sort((a, b) => a.time - b.time);
      const youtubeVideoId = getYouTubeVideoId(youtubeUrl);

      const { error } = await supabase
        .from("videos")
        .update({
          title,
          category,
          description: description || null,
          source_type: youtubeVideoId ? "youtube" : video.source_type || "file",
          youtube_url: youtubeVideoId ? youtubeUrl.trim() : null,
          youtube_video_id: youtubeVideoId,
          storage_url: youtubeVideoId ? youtubeUrl.trim() : video.storage_url,
          thumbnail_url: thumbnailUrl.trim() || (youtubeVideoId ? getYouTubeThumbnail(youtubeVideoId) : null),
          hls_url: hlsUrl.trim() || null,
          chapters: parsed as any,
        } as any)
        .eq("id", video.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-video-title">Video Title</Label>
            <Input
              id="edit-video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-video-category">Category</Label>
            <Input
              id="edit-video-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-video-description">Description</Label>
            <Input
              id="edit-video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-video-youtube">YouTube URL</Label>
            <Input
              id="edit-video-youtube"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-video-thumbnail">Thumbnail URL</Label>
            <Input
              id="edit-video-thumbnail"
              placeholder="Leave blank to use YouTube thumbnail"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-video-hls">HLS Stream URL (optional)</Label>
            <Input
              id="edit-video-hls"
              placeholder="https://.../master.m3u8"
              value={hlsUrl}
              onChange={(e) => setHlsUrl(e.target.value)}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Add an .m3u8 URL to enable adaptive quality (Auto / 1080p / 720p / 480p).
              Leave blank to use the standard MP4.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Chapters</Label>
              <Button type="button" size="sm" variant="outline" onClick={addChapter}>
                <Plus className="mr-1" size={14} />
                Add Chapter
              </Button>
            </div>
            {chapters.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No chapters yet. Add timestamped markers to show on the player timeline.
              </p>
            ) : (
              <div className="space-y-2">
                {chapters.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="0:00"
                      value={c.time}
                      onChange={(e) => updateChapter(i, "time", e.target.value)}
                      className="w-24 bg-background border-border"
                    />
                    <Input
                      placeholder="Chapter title"
                      value={c.title}
                      onChange={(e) => updateChapter(i, "title", e.target.value)}
                      className="flex-1 bg-background border-border"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeChapter(i)}
                      aria-label="Remove chapter"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Time format: mm:ss (e.g. 1:30) or h:mm:ss (e.g. 1:05:20).
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
