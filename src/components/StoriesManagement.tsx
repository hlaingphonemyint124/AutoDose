import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Loader2, GripVertical, X, Star, StarOff, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Story {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  cover_image_url: string | null;
  is_featured: boolean | null;
  display_order: number;
  created_at: string;
}

interface Photo {
  id: string;
  title: string;
  storage_url: string;
  category: string | null;
}

interface StoryItem {
  id: string;
  story_id: string;
  photo_id: string;
  caption: string | null;
  display_order: number;
  photo?: Photo | null;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const StoriesManagement = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newIntro, setNewIntro] = useState("");
  const [newCover, setNewCover] = useState("");
  const [creating, setCreating] = useState(false);

  // Editing items dialog
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [items, setItems] = useState<StoryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("photo_stories")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    setStories(data || []);
  };

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("photos")
      .select("id, title, storage_url, category")
      .order("created_at", { ascending: false });
    setAllPhotos(data || []);
  };

  useEffect(() => {
    Promise.all([fetchStories(), fetchPhotos()]).finally(() => setLoading(false));
  }, []);

  const fetchItems = async (storyId: string) => {
    setItemsLoading(true);
    const { data } = await supabase
      .from("photo_story_items")
      .select("*, photo:photos(id, title, storage_url, category)")
      .eq("story_id", storyId)
      .order("display_order", { ascending: true });
    setItems((data || []) as unknown as StoryItem[]);
    setItemsLoading(false);
  };

  const openEditor = async (story: Story) => {
    setEditingStory(story);
    await fetchItems(story.id);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const slug = slugify(newTitle) + "-" + Math.random().toString(36).slice(2, 6);
      const { error } = await supabase.from("photo_stories").insert({
        title: newTitle.trim(),
        slug,
        intro: newIntro.trim() || null,
        cover_image_url: newCover.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Story created" });
      setNewTitle("");
      setNewIntro("");
      setNewCover("");
      fetchStories();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm("Delete this story? Its photo links will be removed (originals stay safe).")) return;
    const { error } = await supabase.from("photo_stories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Story deleted" });
    fetchStories();
    if (editingStory?.id === id) setEditingStory(null);
  };

  const toggleFeatured = async (s: Story) => {
    const { error } = await supabase
      .from("photo_stories")
      .update({ is_featured: !s.is_featured })
      .eq("id", s.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    fetchStories();
  };

  const updateStoryField = async (field: keyof Story, value: any) => {
    if (!editingStory) return;
    const { error } = await supabase
      .from("photo_stories")
      .update({ [field]: value })
      .eq("id", editingStory.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setEditingStory({ ...editingStory, [field]: value });
    fetchStories();
  };

  const addPhotoToStory = async (photoId: string) => {
    if (!editingStory) return;
    const nextOrder = items.length ? Math.max(...items.map((i) => i.display_order)) + 1 : 0;
    const { error } = await supabase.from("photo_story_items").insert({
      story_id: editingStory.id,
      photo_id: photoId,
      display_order: nextOrder,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    fetchItems(editingStory.id);
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from("photo_story_items").delete().eq("id", itemId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (editingStory) fetchItems(editingStory.id);
  };

  const updateItemCaption = async (itemId: string, caption: string) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, caption } : i)));
    await supabase.from("photo_story_items").update({ caption }).eq("id", itemId);
  };

  const moveItem = async (itemId: string, dir: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) return;
    const a = items[idx];
    const b = items[target];
    const reordered = [...items];
    reordered[idx] = b;
    reordered[target] = a;
    setItems(reordered);
    await Promise.all([
      supabase.from("photo_story_items").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("photo_story_items").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
  };

  const usedPhotoIds = new Set(items.map((i) => i.photo_id));
  const availablePhotos = allPhotos.filter((p) => !usedPhotoIds.has(p.id));

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading stories…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Plus size={20} /> Create New Photo Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tokyo Nights — A Love Letter to JDM"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Intro / Lede (optional)</Label>
            <Textarea
              value={newIntro}
              onChange={(e) => setNewIntro(e.target.value)}
              placeholder="A short editorial intro shown above the first photo…"
              rows={3}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Cover Image URL (optional)</Label>
            <Input
              value={newCover}
              onChange={(e) => setNewCover(e.target.value)}
              placeholder="https://… (use a photo URL from your gallery)"
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Tip: open a photo in your gallery, copy its image URL, and paste it here.
            </p>
          </div>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Story
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">
            No stories yet. Create your first one above.
          </p>
        ) : (
          stories.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="aspect-video bg-muted relative">
                {s.cover_image_url ? (
                  <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="text-muted-foreground" size={32} />
                  </div>
                )}
                {s.is_featured && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded uppercase tracking-wider">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground line-clamp-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {s.intro || "No intro"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditor(s)}>
                    <Edit size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleFeatured(s)}>
                    {s.is_featured ? <StarOff size={14} /> : <Star size={14} />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteStory(s.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingStory} onOpenChange={(o) => !o && setEditingStory(null)}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Story</DialogTitle>
            <DialogDescription>Curate photos and add captions.</DialogDescription>
          </DialogHeader>

          {editingStory && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingStory.title}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    onBlur={(e) => updateStoryField("title", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input
                    value={editingStory.cover_image_url || ""}
                    onChange={(e) =>
                      setEditingStory({ ...editingStory, cover_image_url: e.target.value })
                    }
                    onBlur={(e) => updateStoryField("cover_image_url", e.target.value || null)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Intro</Label>
                <Textarea
                  value={editingStory.intro || ""}
                  onChange={(e) => setEditingStory({ ...editingStory, intro: e.target.value })}
                  onBlur={(e) => updateStoryField("intro", e.target.value || null)}
                  rows={3}
                  className="bg-background border-border"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!!editingStory.is_featured}
                  onCheckedChange={(v) => updateStoryField("is_featured", v)}
                />
                <Label>Featured story</Label>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Photos in story ({items.length})
                  </h3>
                  <Button size="sm" onClick={() => setPhotoPickerOpen(true)}>
                    <Plus size={14} className="mr-1" /> Add photos
                  </Button>
                </div>

                {itemsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading items…</p>
                ) : items.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">
                    No photos yet. Click "Add photos" to pick from your gallery.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 bg-background border border-border rounded-lg"
                      >
                        <div className="flex flex-col gap-1">
                          <Button size="icon" variant="ghost" onClick={() => moveItem(item.id, "up")} disabled={idx === 0}>
                            ↑
                          </Button>
                          <GripVertical className="text-muted-foreground mx-auto" size={14} />
                          <Button size="icon" variant="ghost" onClick={() => moveItem(item.id, "down")} disabled={idx === items.length - 1}>
                            ↓
                          </Button>
                        </div>
                        {item.photo ? (
                          <img
                            src={item.photo.storage_url}
                            alt={item.photo.title}
                            className="w-32 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-32 h-24 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            Missing
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.photo?.title || "Untitled"}
                          </p>
                          <Textarea
                            placeholder="Caption (optional)…"
                            value={item.caption || ""}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id ? { ...i, caption: e.target.value } : i
                                )
                              )
                            }
                            onBlur={(e) => updateItemCaption(item.id, e.target.value)}
                            rows={2}
                            className="bg-card border-border text-sm"
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo picker dialog */}
      <Dialog open={photoPickerOpen} onOpenChange={setPhotoPickerOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Pick photos from your gallery</DialogTitle>
            <DialogDescription>
              Click any photo to add it to this story. Already-added photos are hidden.
            </DialogDescription>
          </DialogHeader>
          {availablePhotos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No more photos available. Upload more in the Gallery tab.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availablePhotos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPhotoToStory(p.id)}
                  className="group relative aspect-square rounded overflow-hidden border border-border hover:border-primary transition-colors"
                >
                  <img
                    src={p.storage_url}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-end p-2 transition-colors">
                    <p className="text-xs text-white opacity-0 group-hover:opacity-100 line-clamp-2 text-left">
                      {p.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
