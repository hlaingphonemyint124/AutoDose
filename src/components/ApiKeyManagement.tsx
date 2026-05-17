import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Copy, Trash2, Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a key name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-api-key", {
        body: {
          keyName: newKeyName.trim(),
          expiresIn: expiresIn || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "API key created successfully",
      });

      setNewlyCreatedKey(data.data.api_key);
      setNewKeyName("");
      setExpiresIn("");
      fetchApiKeys();
    } catch (error: any) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!window.confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      fetchApiKeys();
    } catch (error: any) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: !currentStatus })
        .eq("id", keyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `API key ${!currentStatus ? "activated" : "deactivated"}`,
      });

      fetchApiKeys();
    } catch (error: any) {
      console.error("Error toggling API key:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    if (key.length < 12) return key;
    return `${key.substring(0, 8)}${"•".repeat(48)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-foreground">
            API Keys
          </h2>
          <p className="text-muted-foreground">
            Manage API keys for external applications
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for external application access
              </DialogDescription>
            </DialogHeader>
            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your API key (save it now, you won't see it again):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-2 rounded text-sm font-mono break-all">
                      {newlyCreatedKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setNewlyCreatedKey(null);
                    setShowDialog(false);
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiresIn">Expires In (days, optional)</Label>
                  <Input
                    id="expiresIn"
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    placeholder="Leave empty for no expiration"
                    min="1"
                  />
                </div>
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Key size={16} className="mr-2" />
                      Generate Key
                    </>
                  )}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={32} />
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      ) : apiKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">
              No API keys yet. Create one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {apiKeys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={!key.is_active ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{key.key_name}</CardTitle>
                        <CardDescription className="mt-1">
                          Created {new Date(key.created_at).toLocaleDateString()}
                          {key.last_used_at && (
                            <> • Last used {new Date(key.last_used_at).toLocaleDateString()}</>
                          )}
                          {key.expires_at && (
                            <> • Expires {new Date(key.expires_at).toLocaleDateString()}</>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={key.is_active ? "outline" : "default"}
                          onClick={() => handleToggleActive(key.id, key.is_active)}
                        >
                          {key.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-3 rounded text-sm font-mono break-all">
                        {visibleKeys.has(key.id) ? key.api_key : maskKey(key.api_key)}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {visibleKeys.has(key.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(key.api_key)}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
