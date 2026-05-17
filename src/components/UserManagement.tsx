import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string | null;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User account deleted successfully",
      });
      
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user account",
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {user.display_name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">
                        {user.display_name || "Anonymous User"}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setUserToDelete(user)}
                      disabled={deletingUserId === user.id}
                    >
                      {deletingUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for{" "}
              <strong>{userToDelete?.display_name || "this user"}</strong>? This action
              cannot be undone and will permanently delete all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">User Profile Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {viewingUser.avatar_url ? (
                  <img
                    src={viewingUser.avatar_url}
                    alt={viewingUser.display_name || "User"}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                    <span className="text-2xl font-semibold text-primary">
                      {viewingUser.display_name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {viewingUser.display_name || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">User ID: {viewingUser.id}</p>
                </div>
              </div>
              <div className="space-y-2 border-t border-border pt-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Bio:</span>
                  <p className="text-sm text-foreground mt-1">
                    {viewingUser.bio || "No bio provided"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Member Since:</span>
                  <p className="text-sm text-foreground mt-1">
                    {viewingUser.created_at
                      ? new Date(viewingUser.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
