import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Video, Camera, BarChart3, FileText, Upload, Trash2, Image, TrendingUp, Eye, Heart, MessageCircle, Edit, Loader2, Home, Star, StarOff, Tv } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { UserManagement } from "@/components/UserManagement";
import { EditVideoDialog } from "@/components/EditVideoDialog";
import { EditPhotoDialog } from "@/components/EditPhotoDialog";
import { ActivityFeed } from "@/components/ActivityFeed";
import { BulkOperations } from "@/components/BulkOperations";
import { UserAnalyticsDashboard } from "@/components/UserAnalyticsDashboard";
import { StoriesManagement } from "@/components/StoriesManagement";
import { getVideoSourceType, getYouTubeThumbnail, getYouTubeVideoId } from "@/lib/youtube";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState("");
  const [slideshowFile, setSlideshowFile] = useState<File | null>(null);
  const [slideshowTitle, setSlideshowTitle] = useState("");
  const [slideshowOrder, setSlideshowOrder] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalPhotos: 0,
    pageViews: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0,
  });
  const [videos, setVideos] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [slideshowPhotos, setSlideshowPhotos] = useState<any[]>([]);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [featureLoading, setFeatureLoading] = useState<string | null>(null);
  const videoSourceType = getVideoSourceType(videoUrl);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
    });
    fetchStats();
    fetchVideos();
    fetchPhotos();
    fetchSlideshowPhotos();
    fetchAllPhotos();
    fetchAllVideos();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [usersRes, videosRes, photosRes, likesRes, commentsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("likes").select("id", { count: "exact", head: true }),
        supabase.from("comments").select("id", { count: "exact", head: true }),
      ]);

      const totalContent = (videosRes.count || 0) + (photosRes.count || 0);
      const totalEngagements = (likesRes.count || 0) + (commentsRes.count || 0);
      const engagementRate = totalContent > 0 ? ((totalEngagements / totalContent) * 100).toFixed(1) : 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalVideos: videosRes.count || 0,
        totalPhotos: photosRes.count || 0,
        pageViews: 0,
        totalLikes: likesRes.count || 0,
        totalComments: commentsRes.count || 0,
        engagementRate: Number(engagementRate),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const fetchSlideshowPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("slideshow_photos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setSlideshowPhotos(data || []);
    } catch (error) {
      console.error("Error fetching slideshow photos:", error);
    }
  };

  const fetchAllPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAllPhotos(data || []);
    } catch (error) {
      console.error("Error fetching all photos:", error);
    }
  };

  const fetchAllVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAllVideos(data || []);
    } catch (error) {
      console.error("Error fetching all videos:", error);
    }
  };

  const handleTogglePhotoFeature = async (photoId: string, currentValue: boolean) => {
    setFeatureLoading(photoId);
    try {
      const { error } = await supabase
        .from("photos")
        .update({ is_homepage_featured: !currentValue })
        .eq("id", photoId);
      if (error) throw error;
      setAllPhotos(prev => prev.map(p => p.id === photoId ? { ...p, is_homepage_featured: !currentValue } : p));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setFeatureLoading(null);
    }
  };

  const handleToggleVideoFeature = async (videoId: string, currentValue: boolean) => {
    setFeatureLoading(videoId);
    try {
      const { error } = await supabase
        .from("videos")
        .update({ is_homepage_featured: !currentValue })
        .eq("id", videoId);
      if (error) throw error;
      setAllVideos(prev => prev.map(v => v.id === videoId ? { ...v, is_homepage_featured: !currentValue } : v));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setFeatureLoading(null);
    }
  };

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !photoTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide both photo and title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadingPhoto(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, photoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("photos")
        .insert({
          user_id: session.user.id,
          title: photoTitle,
          category: photoCategory || "General",
          file_path: fileName,
          storage_url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Photo uploaded successfully.",
      });

      setPhotoFile(null);
      setPhotoTitle("");
      setPhotoCategory("");
      const fileInput = document.getElementById("photo-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchStats();
      fetchPhotos();
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadingPhoto(false);
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const youtubeVideoId = getYouTubeVideoId(videoUrl);
    const sourceType = getVideoSourceType(videoUrl);
    if (!videoTitle || !sourceType) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and a valid YouTube or Facebook video URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadingVideo(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const thumbnailUrl = videoThumbnailUrl.trim() || (youtubeVideoId ? getYouTubeThumbnail(youtubeVideoId) : null);

      const { error: dbError } = await supabase
        .from("videos")
        .insert({
          user_id: session.user.id,
          title: videoTitle,
          description: videoDescription || null,
          category: videoCategory || "General",
          source_type: sourceType,
          youtube_url: sourceType === "youtube" ? videoUrl.trim() : null,
          youtube_video_id: sourceType === "youtube" ? youtubeVideoId : null,
          file_path: "",
          storage_url: videoUrl.trim(),
          thumbnail_url: thumbnailUrl,
        } as any);

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: `${sourceType === "facebook" ? "Facebook" : "YouTube"} video added successfully.`,
      });

      setVideoTitle("");
      setVideoDescription("");
      setVideoCategory("");
      setVideoUrl("");
      setVideoThumbnailUrl("");
      fetchStats();
      fetchVideos();
      fetchAllVideos();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadingVideo(false);
    }
  };

  const handleSlideshowUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideshowFile || !slideshowTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide both photo and title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileName = `slideshow-${Date.now()}-${slideshowFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, slideshowFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("slideshow_photos")
        .insert({
          title: slideshowTitle,
          file_path: fileName,
          storage_url: publicUrl,
          display_order: parseInt(slideshowOrder) || 0,
          is_active: true,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Slideshow photo uploaded successfully.",
      });

      setSlideshowFile(null);
      setSlideshowTitle("");
      setSlideshowOrder("");
      const fileInput = document.getElementById("slideshow-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchSlideshowPhotos();
    } catch (error: any) {
      console.error("Error uploading slideshow photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload slideshow photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, filePath: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      await supabase.storage.from("photos").remove([filePath]);
      const { error } = await supabase.from("photos").delete().eq("id", photoId);
      
      if (error) throw error;

      toast({ title: "Success!", description: "Photo deleted successfully." });
      fetchPhotos();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteVideo = async (videoId: string, filePath?: string | null) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      if (filePath) await supabase.storage.from("videos").remove([filePath]);
      const { error } = await supabase.from("videos").delete().eq("id", videoId);
      
      if (error) throw error;

      toast({ title: "Success!", description: "Video deleted successfully." });
      fetchVideos();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteSlideshow = async (slideshowId: string, filePath: string) => {
    if (!window.confirm("Are you sure you want to delete this slideshow photo?")) return;

    try {
      await supabase.storage.from("photos").remove([filePath]);
      const { error } = await supabase.from("slideshow_photos").delete().eq("id", slideshowId);
      
      if (error) throw error;

      toast({ title: "Success!", description: "Slideshow photo deleted successfully." });
      fetchSlideshowPhotos();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statsArray = [
    { label: "Total Users", value: stats.totalUsers.toString(), icon: Users, color: "text-blue-500" },
    { label: "Total Videos", value: stats.totalVideos.toString(), icon: Video, color: "text-purple-500" },
    { label: "Total Photos", value: stats.totalPhotos.toString(), icon: Camera, color: "text-pink-500" },
    { label: "Engagement Rate", value: `${stats.engagementRate}%`, icon: TrendingUp, color: "text-green-500" },
  ];

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background font-inter">
        <Navbar />
        <div className="pt-32 pb-20 px-4 container mx-auto text-foreground">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar />

      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Manage your AUTODOSE platform
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {statsArray.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border hover:shadow-glow transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Management Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
                <Tabs defaultValue="insights" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto gap-1 p-1 mb-6 sm:mb-8">
                  <TabsTrigger value="insights" className="text-xs sm:text-sm py-2">
                    <BarChart3 size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Insights</span>
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="text-xs sm:text-sm py-2">
                    <Video size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Videos</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="text-xs sm:text-sm py-2">
                    <Camera size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Gallery</span>
                  </TabsTrigger>
                  <TabsTrigger value="stories" className="text-xs sm:text-sm py-2">
                    <FileText size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Stories</span>
                  </TabsTrigger>
                  <TabsTrigger value="slideshow" className="text-xs sm:text-sm py-2">
                    <Image size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Slideshow</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="text-xs sm:text-sm py-2">
                    <Users size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Users</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm py-2">
                    <TrendingUp size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Activity</span>
                  </TabsTrigger>
                  <TabsTrigger value="bulk" className="text-xs sm:text-sm py-2">
                    <FileText size={14} className="mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Bulk Ops</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="insights">
                  <div className="space-y-6">
                    <UserAnalyticsDashboard />
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="text-primary" />
                          Content Analytics
                        </CardTitle>
                        <CardDescription>Visual overview of platform metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total Comments</span>
                              <MessageCircle className="text-primary" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-foreground">{stats.totalComments}</div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${Math.min((stats.totalComments / 50) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Engagement Rate</span>
                              <TrendingUp className="text-primary" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-foreground">{stats.engagementRate}%</div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${Math.min(stats.engagementRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="text-primary" />
                          Content Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Video size={16} />
                                Videos
                              </span>
                              <span className="text-sm font-semibold">{stats.totalVideos}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div 
                                className="bg-purple-500 h-3 rounded-full transition-all" 
                                style={{ width: `${(stats.totalVideos / (stats.totalVideos + stats.totalPhotos)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Camera size={16} />
                                Photos
                              </span>
                              <span className="text-sm font-semibold">{stats.totalPhotos}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div 
                                className="bg-pink-500 h-3 rounded-full transition-all" 
                                style={{ width: `${(stats.totalPhotos / (stats.totalVideos + stats.totalPhotos)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityFeed />
                </TabsContent>

                <TabsContent value="bulk">
                  <BulkOperations videos={videos} photos={photos} onRefresh={() => {
                    fetchVideos();
                    fetchPhotos();
                    fetchStats();
                  }} />
                </TabsContent>

                <TabsContent value="videos">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Video Management</CardTitle>
                      <CardDescription>
                        Add YouTube or Facebook videos for the homepage hero slideshow and video gallery
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <form onSubmit={handleVideoUpload} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="video-title">Video Title *</Label>
                            <Input
                              id="video-title"
                              type="text"
                              value={videoTitle}
                              onChange={(e) => setVideoTitle(e.target.value)}
                              placeholder="Enter video title"
                              className="bg-background border-border"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="video-url">Video URL *</Label>
                            <Input
                              id="video-url"
                              type="url"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder="YouTube or Facebook video link"
                              className="bg-background border-border"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Use a direct YouTube video, Shorts, Live, youtu.be, or Facebook video link. Add a thumbnail URL for Facebook posts so the hero card looks premium.
                            </p>
                            {videoUrl && (
                              <p className="text-xs font-medium text-primary">
                                {videoSourceType
                                  ? `Detected ${videoSourceType === "facebook" ? "Facebook" : "YouTube"} video`
                                  : "Paste a supported YouTube or Facebook video URL"}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="video-category">Category</Label>
                            <Input
                              id="video-category"
                              type="text"
                              value={videoCategory}
                              onChange={(e) => setVideoCategory(e.target.value)}
                              placeholder="e.g., photoshoots, vlogs, reviews"
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="video-description">Description</Label>
                            <Input
                              id="video-description"
                              type="text"
                              value={videoDescription}
                              onChange={(e) => setVideoDescription(e.target.value)}
                              placeholder="Short summary shown on the homepage hero"
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="video-thumbnail-url">Thumbnail URL (Optional)</Label>
                            <Input
                              id="video-thumbnail-url"
                              type="url"
                              value={videoThumbnailUrl}
                              onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                              placeholder="Recommended for Facebook, optional for YouTube"
                              className="bg-background border-border"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={!videoTitle || !videoSourceType || isUploading}
                            className="bg-primary hover:bg-primary/90 w-full"
                          >
                            <Tv size={16} className="mr-2" />
                            {isUploading ? "Saving..." : "Add Video"}
                          </Button>
                        </form>

                        <AnimatePresence>
                          {uploadingVideo && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-center justify-center gap-3 p-6 bg-primary/10 rounded-lg border border-primary"
                            >
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="text-foreground font-medium">Saving video...</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div>
                              <p className="font-medium text-foreground">Total Videos</p>
                              <p className="text-sm text-muted-foreground">Published video content</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">{stats.totalVideos}</span>
                          </div>

                          {/* Video List */}
                          {videos.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-muted-foreground">Recent Videos</h3>
                              <div className="grid gap-2">
                                {videos.map((video) => (
                                  <div
                                    key={video.id}
                                    className="flex gap-3 p-2 bg-background rounded border border-border"
                                  >
                                    <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                      {video.thumbnail_url || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url) ? (
                                        <img
                                          src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_video_id || video.youtube_url || video.storage_url) || ""}
                                          alt={video.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Video className="text-primary" size={20} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {video.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {video.category} • {new Date(video.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingVideo(video)}
                                      >
                                        <Edit size={16} />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteVideo(video.id, video.file_path)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="gallery">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Gallery Management</CardTitle>
                      <CardDescription>
                        Upload and manage photo galleries
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <form onSubmit={handlePhotoUpload} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="photo-title">Photo Title *</Label>
                            <Input
                              id="photo-title"
                              type="text"
                              value={photoTitle}
                              onChange={(e) => setPhotoTitle(e.target.value)}
                              placeholder="Enter photo title"
                              className="bg-background border-border"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="photo-category">Category</Label>
                            <Input
                              id="photo-category"
                              type="text"
                              value={photoCategory}
                              onChange={(e) => setPhotoCategory(e.target.value)}
                              placeholder="e.g., Studio, Lifestyle, Action"
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="photo-upload">Upload Photo *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                className="bg-background border-border"
                              />
                              <Button
                                type="submit"
                                disabled={!photoFile || !photoTitle || isUploading}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Upload size={16} className="mr-2" />
                                {isUploading ? "Uploading..." : "Upload"}
                              </Button>
                            </div>
                            {photoFile && (
                              <p className="text-sm text-muted-foreground">
                                Selected: {photoFile.name}
                              </p>
                            )}
                          </div>
                        </form>

                        <AnimatePresence>
                          {uploadingPhoto && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-center justify-center gap-3 p-6 bg-primary/10 rounded-lg border border-primary"
                            >
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="text-foreground font-medium">Uploading photo...</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div>
                              <p className="font-medium text-foreground">Total Photos</p>
                              <p className="text-sm text-muted-foreground">Published photography</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">{stats.totalPhotos}</span>
                          </div>

                          {/* Photo Grid */}
                          {photos.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-muted-foreground">Recent Photos</h3>
                              <div className="grid grid-cols-3 gap-2">
                                {photos.slice(0, 9).map((photo) => (
                                  <div
                                    key={photo.id}
                                    className="relative aspect-square rounded overflow-hidden bg-muted group"
                                  >
                                    <img
                                      src={photo.storage_url}
                                     alt={photo.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingPhoto(photo)}
                                      >
                                        <Edit size={16} />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeletePhoto(photo.id, photo.file_path)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stories">
                  <StoriesManagement />
                </TabsContent>

                <TabsContent value="slideshow">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Image className="w-5 h-5 text-primary" />
                        Homepage Slideshow Management
                      </CardTitle>
                      <CardDescription>
                        Upload high-quality photos that will be displayed on the homepage slideshow. These photos will automatically rotate every 5 seconds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Upload Form */}
                        <div className="bg-background rounded-lg border border-border p-6">
                          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            Upload New Slideshow Photo
                          </h3>
                          <form onSubmit={handleSlideshowUpload} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="slideshow-title" className="text-foreground">
                                Photo Title *
                              </Label>
                              <Input
                                id="slideshow-title"
                                type="text"
                                value={slideshowTitle}
                                onChange={(e) => setSlideshowTitle(e.target.value)}
                                placeholder="e.g., Midnight Purple Skyline GTR"
                                className="bg-background border-border"
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                This title will be displayed on the slideshow
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="slideshow-order" className="text-foreground">
                                Display Order (Optional)
                              </Label>
                              <Input
                                id="slideshow-order"
                                type="number"
                                value={slideshowOrder}
                                onChange={(e) => setSlideshowOrder(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="bg-background border-border"
                              />
                              <p className="text-xs text-muted-foreground">
                                Lower numbers appear first. Leave blank for automatic ordering.
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="slideshow-upload" className="text-foreground">
                                Upload Photo *
                              </Label>
                              <Input
                                id="slideshow-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSlideshowFile(e.target.files?.[0] || null)}
                                className="bg-background border-border cursor-pointer"
                                required
                              />
                              {slideshowFile && (
                                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded border border-primary/20">
                                  <Image className="w-4 h-4 text-primary" />
                                  <p className="text-sm text-foreground">
                                    Selected: {slideshowFile.name}
                                  </p>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Recommended: High-resolution images (1920x1080 or larger) for best quality
                              </p>
                            </div>
                            
                            <Button
                              type="submit"
                              disabled={!slideshowFile || !slideshowTitle || isUploading}
                              className="bg-primary hover:bg-primary/90 w-full"
                            >
                              <Upload size={16} className="mr-2" />
                              {isUploading ? "Uploading..." : "Upload to Slideshow"}
                            </Button>
                          </form>
                        </div>

                        {/* Current Slideshow Photos */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">
                              Current Slideshow Photos ({slideshowPhotos.length})
                            </h3>
                          </div>
                          
                          {slideshowPhotos.length === 0 ? (
                            <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed border-border">
                              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-foreground font-medium mb-2">
                                No slideshow photos yet
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Upload your first photo above to get started with your homepage slideshow
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {slideshowPhotos.map((photo) => (
                                <motion.div
                                  key={photo.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="relative aspect-video rounded-lg overflow-hidden bg-muted group border border-border"
                                >
                                  <img
                                    src={photo.storage_url}
                                    alt={photo.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                      <p className="text-sm font-medium text-white mb-1">
                                        {photo.title}
                                      </p>
                                      <p className="text-xs text-gray-300">
                                        Display Order: {photo.display_order}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteSlideshow(photo.id, photo.file_path)}
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    Delete
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
      
      {editingVideo && (
        <EditVideoDialog
          video={editingVideo}
          open={!!editingVideo}
          onOpenChange={(open) => !open && setEditingVideo(null)}
          onSuccess={fetchVideos}
        />
      )}
      
      {editingPhoto && (
        <EditPhotoDialog
          photo={editingPhoto}
          open={!!editingPhoto}
          onOpenChange={(open) => !open && setEditingPhoto(null)}
          onSuccess={fetchPhotos}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
