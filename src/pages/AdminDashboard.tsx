import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Video, Camera, BarChart3, FileText, Upload, Trash2, Image, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
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
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !videoTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide both video file and title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      let thumbnailUrl = null;
      if (videoThumbnail) {
        const thumbExt = videoThumbnail.name.split(".").pop();
        const thumbFileName = `${session.user.id}/thumb-${Date.now()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage
          .from("videos")
          .upload(thumbFileName, videoThumbnail);

        if (!thumbError) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from("videos")
            .getPublicUrl(thumbFileName);
          thumbnailUrl = thumbUrl;
        }
      }

      const { error: dbError } = await supabase
        .from("videos")
        .insert({
          user_id: session.user.id,
          title: videoTitle,
          category: videoCategory || "General",
          file_path: fileName,
          storage_url: publicUrl,
          thumbnail_url: thumbnailUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Video uploaded successfully.",
      });

      setVideoFile(null);
      setVideoThumbnail(null);
      setVideoTitle("");
      setVideoCategory("");
      const fileInput = document.getElementById("video-upload") as HTMLInputElement;
      const thumbInput = document.getElementById("video-thumbnail") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      if (thumbInput) thumbInput.value = "";
      fetchStats();
      fetchVideos();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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

  const handleDeleteVideo = async (videoId: string, filePath: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await supabase.storage.from("videos").remove([filePath]);
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

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-orbitron font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mb-8">
              Manage your AUTODOSE platform
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <TabsList className="grid w-full grid-cols-5 mb-8">
                  <TabsTrigger value="insights">
                    <BarChart3 size={16} className="mr-2" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="videos">
                    <Video size={16} className="mr-2" />
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="gallery">
                    <Camera size={16} className="mr-2" />
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger value="slideshow">
                    <Image size={16} className="mr-2" />
                    Slideshow
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <Users size={16} className="mr-2" />
                    Users
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="insights">
                  <div className="space-y-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">Platform Overview</CardTitle>
                        <CardDescription>
                          Real-time analytics and engagement metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 bg-background rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-4">
                              <Heart className="h-6 w-6 text-red-500" />
                              <span className="text-3xl font-bold text-foreground">{stats.totalLikes}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Total Likes</p>
                            <p className="text-xs text-primary mt-1">Across all content</p>
                          </div>
                          <div className="p-6 bg-background rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-4">
                              <MessageCircle className="h-6 w-6 text-blue-500" />
                              <span className="text-3xl font-bold text-foreground">{stats.totalComments}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Total Comments</p>
                            <p className="text-xs text-primary mt-1">Community engagement</p>
                          </div>
                          <div className="p-6 bg-background rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-4">
                              <Eye className="h-6 w-6 text-green-500" />
                              <span className="text-3xl font-bold text-foreground">{stats.totalPhotos + stats.totalVideos}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Total Content</p>
                            <p className="text-xs text-primary mt-1">Photos & Videos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">Content Performance</CardTitle>
                        <CardDescription>
                          Most engaging content on your platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div>
                              <p className="font-medium text-foreground">Average Engagement</p>
                              <p className="text-sm text-muted-foreground">Likes + Comments per content</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                              {((stats.totalLikes + stats.totalComments) / Math.max(stats.totalPhotos + stats.totalVideos, 1)).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                            <div>
                              <p className="font-medium text-foreground">Content Library</p>
                              <p className="text-sm text-muted-foreground">Photos to Videos ratio</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                              {stats.totalPhotos}:{stats.totalVideos}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="users">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">User Management</CardTitle>
                      <CardDescription>
                        Manage user accounts and permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                          <div>
                            <p className="font-medium text-foreground">Total Registered Users</p>
                            <p className="text-sm text-muted-foreground">Active members of AUTODOSE</p>
                          </div>
                          <span className="text-2xl font-bold text-primary">{stats.totalUsers}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="videos">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Video Management</CardTitle>
                      <CardDescription>
                        Upload and manage video content
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
                            <Label htmlFor="video-upload">Upload Video *</Label>
                            <Input
                              id="video-upload"
                              type="file"
                              accept="video/*"
                              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                              className="bg-background border-border"
                            />
                            {videoFile && (
                              <p className="text-sm text-muted-foreground">
                                Selected: {videoFile.name}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="video-thumbnail">Thumbnail (Optional)</Label>
                            <Input
                              id="video-thumbnail"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setVideoThumbnail(e.target.files?.[0] || null)}
                              className="bg-background border-border"
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={!videoFile || !videoTitle || isUploading}
                            className="bg-primary hover:bg-primary/90 w-full"
                          >
                            <Upload size={16} className="mr-2" />
                            {isUploading ? "Uploading..." : "Upload Video"}
                          </Button>
                        </form>

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
                                      {video.thumbnail_url ? (
                                        <img
                                          src={video.thumbnail_url}
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
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteVideo(video.id, video.file_path)}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
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
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleDeletePhoto(photo.id, photo.file_path)}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
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
    </div>
  );
};

export default AdminDashboard;
