import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

interface CommentsProps {
  photoId?: string;
  videoId?: string;
}

export const Comments = ({ photoId, videoId }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchComments();
  }, [photoId, videoId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

  const fetchComments = async () => {
    try {
      let query = supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (photoId) {
        query = query.eq("photo_id", photoId);
      } else if (videoId) {
        query = query.eq("video_id", videoId);
      }

      const { data: commentsData, error: commentsError } = await query;
      if (commentsError) throw commentsError;

      // Fetch profiles separately
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        if (!profilesError && profilesData) {
          // Merge comments with profiles
          const commentsWithProfiles = commentsData.map(comment => ({
            ...comment,
            profiles: profilesData.find(p => p.id === comment.user_id)
          }));
          setComments(commentsWithProfiles as any);
        } else {
          setComments(commentsData as any || []);
        }
      } else {
        setComments(commentsData as any || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("comments").insert({
        user_id: session.user.id,
        photo_id: photoId || null,
        video_id: videoId || null,
        content: newComment.trim(),
      });

      if (error) throw error;

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });

      setNewComment("");
      fetchComments();
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });

      fetchComments();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-foreground">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="bg-background border-border min-h-[100px]"
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            <Send size={16} className="mr-2" />
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={(comment.profiles as any)?.avatar_url || ""} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {comment.profiles?.display_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {currentUserId === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};
