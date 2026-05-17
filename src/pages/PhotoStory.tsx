import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  slug: string;
  intro: string | null;
  cover_image_url: string | null;
  created_at: string;
}

interface StoryItem {
  id: string;
  caption: string | null;
  display_order: number;
  photo: {
    id: string;
    title: string;
    storage_url: string;
    category: string | null;
  } | null;
}

const PhotoStory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [items, setItems] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (!slug) return;
      setLoading(true);

      const { data: s } = await supabase
        .from("photo_stories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!s) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setStory(s);

      const { data: i } = await supabase
        .from("photo_story_items")
        .select("id, caption, display_order, photo:photos(id, title, storage_url, category)")
        .eq("story_id", s.id)
        .order("display_order", { ascending: true });

      if (i) setItems(i as unknown as StoryItem[]);
      setLoading(false);
    };
    fetchStory();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-inter">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">Loading story…</div>
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-screen bg-background font-inter">
        <Navbar />
        <div className="pt-32 pb-20 text-center space-y-4">
          <BookOpen className="mx-auto text-muted-foreground" size={48} />
          <h1 className="text-3xl font-orbitron font-bold text-foreground">Story not found</h1>
          <Link to="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title={`${story.title} — Photo Story`}
        description={story.intro ?? `A curated AUTODOSE photo story: ${story.title}.`}
        type="article"
        image={story.cover_image_url ?? undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: story.title,
          description: story.intro ?? undefined,
          image: story.cover_image_url ? [story.cover_image_url] : undefined,
          datePublished: story.created_at,
          author: { "@type": "Organization", name: "AUTODOSE" },
          publisher: {
            "@type": "Organization",
            name: "AUTODOSE",
          },
        }}
      />
      <Navbar />

      {/* HERO */}
      <header className="relative h-[80vh] w-full overflow-hidden">
        {story.cover_image_url ? (
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={story.cover_image_url}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-card to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />

        <div className="relative z-10 h-full flex items-end pb-20 px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl space-y-4"
          >
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2" size={16} />
              All stories
            </Link>
            <span className="block text-xs uppercase tracking-[0.3em] text-primary font-orbitron">
              Photo Story
            </span>
            <h1 className="text-4xl md:text-7xl font-orbitron font-bold text-foreground leading-tight">
              {story.title}
            </h1>
            {story.intro && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {story.intro}
              </p>
            )}
          </motion.div>
        </div>
      </header>

      {/* MAGAZINE LAYOUT */}
      <article className="py-16 md:py-24 space-y-12 md:space-y-20">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">This story has no photos yet.</p>
        ) : (
          (() => {
            const blocks: JSX.Element[] = [];
            let i = 0;
            let blockIndex = 0;
            while (i < items.length) {
              // Pattern: full-bleed, then a 2-column pair, repeating
              if (blockIndex % 2 === 0 || i === items.length - 1) {
                const item = items[i];
                blocks.push(
                  <FullBleed key={item.id} item={item} index={i} />
                );
                i += 1;
              } else {
                const a = items[i];
                const b = items[i + 1];
                blocks.push(
                  <TwoColumn key={`${a.id}-${b.id}`} a={a} b={b} index={i} />
                );
                i += 2;
              }
              blockIndex += 1;
            }
            return blocks;
          })()
        )}
      </article>

      <Footer />
    </div>
  );
};

const FullBleed = ({ item, index }: { item: StoryItem; index: number }) => {
  if (!item.photo) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="w-full">
        <img
          src={item.photo.storage_url}
          alt={item.photo.title}
          className="w-full h-auto max-h-[90vh] object-cover"
          loading={index > 1 ? "lazy" : "eager"}
        />
      </div>
      {item.caption && (
        <div className="px-4 md:px-12 max-w-3xl mx-auto">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed italic border-l-2 border-primary pl-4">
            {item.caption}
          </p>
        </div>
      )}
    </motion.section>
  );
};

const TwoColumn = ({ a, b, index }: { a: StoryItem; b: StoryItem; index: number }) => {
  if (!a.photo || !b.photo) {
    if (a.photo) return <FullBleed item={a} index={index} />;
    return null;
  }
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
    >
      {[a, b].map((item) => (
        <figure key={item.id} className="space-y-3">
          <img
            src={item.photo!.storage_url}
            alt={item.photo!.title}
            className="w-full h-auto rounded-sm object-cover"
            loading="lazy"
          />
          {item.caption && (
            <figcaption className="text-sm text-muted-foreground leading-relaxed">
              {item.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </motion.section>
  );
};

export default PhotoStory;
