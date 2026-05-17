import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Video, Camera, MessageCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  type: "video" | "photo" | "comment" | "like";
  message: string;
  time: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchRecentActivity();

    // Set up real-time subscriptions
    const channel = supabase
      .channel("activity-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, () => {
        fetchRecentActivity();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "photos" }, () => {
        fetchRecentActivity();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        fetchRecentActivity();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        fetchRecentActivity();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const [videos, photos, comments, likes] = await Promise.all([
        supabase.from("videos").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("photos").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("comments").select("id, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("likes").select("id, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const activityList: ActivityItem[] = [];

      videos.data?.forEach(v => activityList.push({
        id: v.id,
        type: "video",
        message: `New video uploaded: ${v.title}`,
        time: v.created_at || ""
      }));

      photos.data?.forEach(p => activityList.push({
        id: p.id,
        type: "photo",
        message: `New photo added: ${p.title}`,
        time: p.created_at || ""
      }));

      comments.data?.forEach(c => activityList.push({
        id: c.id,
        type: "comment",
        message: "New comment posted",
        time: c.created_at || ""
      }));

      likes.data?.forEach(l => activityList.push({
        id: l.id,
        type: "like",
        message: "New like received",
        time: l.created_at || ""
      }));

      activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(activityList.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="text-purple-500" size={16} />;
      case "photo": return <Camera className="text-pink-500" size={16} />;
      case "comment": return <MessageCircle className="text-blue-500" size={16} />;
      case "like": return <Heart className="text-red-500" size={16} />;
      default: return <Activity className="text-primary" size={16} />;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="text-primary" />
          Real-time Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="mt-0.5">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.time).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
          {activities.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
