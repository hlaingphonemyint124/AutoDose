import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        loadProfile(session.user.id);
      }
    });
  }, [navigate]);

  const loadProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !userId) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("photos").getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);

    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatar() || avatarUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });

      setProfile({ ...profile, avatar_url: avatarUrl });
      setAvatarFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-orbitron font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground mb-8">
              Manage your public profile information
            </p>

            <Card className="bg-card border-border shadow-glow">
              <CardHeader>
                <CardTitle className="text-foreground">Public Profile</CardTitle>
                <CardDescription>
                  This information will be visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32 border-4 border-primary">
                      <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        <User size={48} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center space-y-2">
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-primary hover:text-primary/80">
                          <Upload size={16} />
                          <span>Upload New Photo</span>
                        </div>
                      </Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      {avatarFile && (
                        <p className="text-sm text-muted-foreground">
                          {avatarFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={(e) =>
                        setProfile({ ...profile, display_name: e.target.value })
                      }
                      placeholder="Your display name"
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      className="bg-background border-border min-h-[120px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileSettings;
