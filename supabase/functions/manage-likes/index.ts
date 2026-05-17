import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAuth } from "../_shared/auth.ts";

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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { action, contentType, contentId } = await req.json();

    if (action === "toggle") {
      const column = contentType === "video" ? "video_id" : "photo_id";
      
      // Check if like exists
      const { data: existingLike } = await supabaseClient
        .from("likes")
        .select("id")
        .eq("user_id", userId)
        .eq(column, contentId)
        .maybeSingle();

      if (existingLike) {
        // Remove like
        await supabaseClient
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        // Decrement like count
        const funcName = contentType === "video" ? "decrement_video_likes" : "decrement_photo_likes";
        await supabaseClient.rpc(funcName, { 
          [`${contentType}_id`]: contentId 
        });

        return new Response(JSON.stringify({ liked: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        // Add like
        await supabaseClient
          .from("likes")
          .insert({
            user_id: userId,
            [column]: contentId,
          });

        // Increment like count
        const funcName = contentType === "video" ? "increment_video_likes" : "increment_photo_likes";
        await supabaseClient.rpc(funcName, { 
          [`${contentType}_id`]: contentId 
        });

        return new Response(JSON.stringify({ liked: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in manage-likes:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
