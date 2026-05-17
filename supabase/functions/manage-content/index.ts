import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAuth, isAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication (supports both JWT and API keys)
    const { userId } = await validateAuth(req);

    // Check if user is admin
    if (!(await isAdmin(userId))) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { action, contentType, contentId, updates, filePath } = await req.json();

    if (action === "edit") {
      const table = contentType === "video" ? "videos" : contentType === "photo" ? "photos" : "slideshow_photos";
      
      const { data, error } = await supabaseClient
        .from(table)
        .update(updates)
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "delete") {
      const table = contentType === "video" ? "videos" : contentType === "photo" ? "photos" : "slideshow_photos";
      const bucket = contentType === "video" ? "videos" : "photos";

      // Delete from storage
      if (filePath) {
        await supabaseClient.storage.from(bucket).remove([filePath]);
      }

      // Delete from database
      const { error } = await supabaseClient
        .from(table)
        .delete()
        .eq("id", contentId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "bulk-delete") {
      const { videoIds, photoIds } = await req.json();
      
      if (videoIds && videoIds.length > 0) {
        const { data: videos } = await supabaseClient
          .from("videos")
          .select("file_path")
          .in("id", videoIds);

        if (videos) {
          await supabaseClient.storage
            .from("videos")
            .remove(videos.map((v: any) => v.file_path));
        }

        await supabaseClient.from("videos").delete().in("id", videoIds);
      }

      if (photoIds && photoIds.length > 0) {
        const { data: photos } = await supabaseClient
          .from("photos")
          .select("file_path")
          .in("id", photoIds);

        if (photos) {
          await supabaseClient.storage
            .from("photos")
            .remove(photos.map((p: any) => p.file_path));
        }

        await supabaseClient.from("photos").delete().in("id", photoIds);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in manage-content:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
