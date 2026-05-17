// Dynamic sitemap.xml generator — public, no JWT
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const origin = req.headers.get("origin") ?? `${url.protocol}//${url.host}`;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const staticRoutes = ["/", "/videos", "/gallery", "/about", "/contact"];

  const [{ data: stories }, { data: videos }] = await Promise.all([
    supabase.from("photo_stories").select("slug, updated_at"),
    supabase.from("videos").select("id, updated_at").limit(1000),
  ]);

  const urls: string[] = [];

  for (const route of staticRoutes) {
    urls.push(`<url><loc>${origin}${route}</loc><changefreq>weekly</changefreq><priority>${route === "/" ? "1.0" : "0.8"}</priority></url>`);
  }

  for (const s of stories ?? []) {
    urls.push(
      `<url><loc>${origin}/stories/${s.slug}</loc><lastmod>${new Date(s.updated_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
    );
  }

  // Videos appear inside /videos modal — link to the videos page
  // (Optional: deep link if route exists)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
