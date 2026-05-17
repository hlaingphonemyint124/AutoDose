import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  cover_image_url: string | null;
  is_featured: boolean | null;
}

const PhotoStoriesRow = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStories = async () => {
      const { data } = await supabase
        .from("photo_stories")
        .select("id, title, slug, intro, cover_image_url, is_featured")
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(12);
      if (data) setStories(data);
    };
    fetchStories();
  }, []);

  if (!stories.length) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-16 bg-background group/row">
      <div className="px-4 md:px-12 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="text-primary" size={22} />
          <h2 className="text-xl md:text-2xl font-orbitron font-bold text-foreground">
            Photo Stories
          </h2>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-16 items-center justify-center bg-background/70 backdrop-blur-sm border border-border rounded-r-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover/row:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-4 md:px-12 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="flex-shrink-0 w-[320px] md:w-[400px]"
            >
              <Link
                to={`/stories/${story.slug}`}
                className="block relative aspect-[3/4] rounded-lg overflow-hidden bg-card border border-border shadow-card group/card"
              >
                {story.cover_image_url ? (
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="text-primary" size={48} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                  {story.is_featured && (
                    <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-primary font-orbitron">
                      Featured Story
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl font-orbitron font-bold text-foreground leading-tight">
                    {story.title}
                  </h3>
                  {story.intro && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {story.intro}
                    </p>
                  )}
                  <span className="inline-block pt-2 text-xs text-primary font-medium">
                    Read story →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-16 items-center justify-center bg-background/70 backdrop-blur-sm border border-border rounded-l-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover/row:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default PhotoStoriesRow;
