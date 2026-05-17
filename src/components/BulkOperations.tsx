import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, CheckSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkOperationsProps {
  videos: any[];
  photos: any[];
  onRefresh: () => void;
}

export const BulkOperations = ({ videos, photos, onRefresh }: BulkOperationsProps) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  const selectAllVideos = () => {
    setSelectedVideos(selectedVideos.length === videos.length ? [] : videos.map(v => v.id));
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(selectedPhotos.length === photos.length ? [] : photos.map(p => p.id));
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      if (selectedVideos.length > 0) {
        const videosToDelete = videos.filter(v => selectedVideos.includes(v.id));
        await Promise.all(
          videosToDelete.map(async (video) => {
            if (video.file_path) await supabase.storage.from("videos").remove([video.file_path]);
            await supabase.from("videos").delete().eq("id", video.id);
          })
        );
      }

      if (selectedPhotos.length > 0) {
        const photosToDelete = photos.filter(p => selectedPhotos.includes(p.id));
        await Promise.all(
          photosToDelete.map(async (photo) => {
            await supabase.storage.from("photos").remove([photo.file_path]);
            await supabase.from("photos").delete().eq("id", photo.id);
          })
        );
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedVideos.length} videos and ${selectedPhotos.length} photos`,
      });

      setSelectedVideos([]);
      setSelectedPhotos([]);
      onRefresh();
      setShowDeleteDialog(false);
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

  const totalSelected = selectedVideos.length + selectedPhotos.length;

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="text-primary" />
            Bulk Content Operations
          </CardTitle>
          <CardDescription>
            Select multiple items to perform bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={selectAllVideos}
                disabled={videos.length === 0}
              >
                {selectedVideos.length === videos.length ? "Deselect" : "Select"} All Videos
              </Button>
              <Button
                variant="outline"
                onClick={selectAllPhotos}
                disabled={photos.length === 0}
              >
                {selectedPhotos.length === photos.length ? "Deselect" : "Select"} All Photos
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={totalSelected === 0 || loading}
                className="ml-auto"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Selected ({totalSelected})
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Videos ({selectedVideos.length}/{videos.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center gap-2 p-2 bg-background rounded border border-border">
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => handleVideoSelect(video.id)}
                      />
                      <span className="text-sm truncate">{video.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Photos ({selectedPhotos.length}/{photos.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {photos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-2 p-2 bg-background rounded border border-border">
                      <Checkbox
                        checked={selectedPhotos.includes(photo.id)}
                        onCheckedChange={() => handlePhotoSelect(photo.id)}
                      />
                      <span className="text-sm truncate">{photo.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {totalSelected} items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
