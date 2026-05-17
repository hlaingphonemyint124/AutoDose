import { useState } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import FeaturedHero from "@/components/FeaturedHero";
import HomeVideoRows from "@/components/HomeVideoRows";
import PhotoHero from "@/components/PhotoHero";
import LatestPhotosRow from "@/components/LatestPhotosRow";
import Footer from "@/components/Footer";
import CinematicShowcase from "@/components/CinematicShowcase";
import { RowVideo } from "@/components/VideoRow";

// Animated divider between sections
const SectionDivider = ({ label }: { label?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="relative flex items-center gap-4 px-4 md:px-12 py-1"
  >
    <div className="flex-1 h-px bg-border relative overflow-hidden">
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="absolute inset-0 h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
      />
    </div>
    {label && (
      <span className="text-[10px] font-orbitron uppercase tracking-[0.25em] text-muted-foreground/60 flex-shrink-0">
        {label}
      </span>
    )}
    <div className="flex-1 h-px bg-border" />
  </motion.div>
);

const Index = () => {
  const [heroSelected, setHeroSelected] = useState<RowVideo | null>(null);

  return (
    <div className="min-h-screen bg-background font-inter overflow-x-hidden">
      <SEO
        title="AUTODOSE — JDM Photography & Lifestyle"
        description="Premium JDM car photography, cinematic videos, and curated photo stories celebrating Japanese automotive culture."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AUTODOSE",
          url: typeof window !== "undefined" ? window.location.origin : "",
          potentialAction: {
            "@type": "SearchAction",
            target: `${typeof window !== "undefined" ? window.location.origin : ""}/videos?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Sticky scroll progress indicator */}
      <ScrollProgressBar />
      <Navbar />

      {/* Video Hero — full bleed */}
      <FeaturedHero onPlay={(v) => setHeroSelected(v as RowVideo)} />

      <main>
        {/* Latest Releases */}
        <div id="latest-releases" className="pt-2">
          <HomeVideoRows
            externalSelected={heroSelected}
            onCloseExternal={() => setHeroSelected(null)}
          />
        </div>

        <SectionDivider label="Cinematic" />

        <CinematicShowcase />

        <SectionDivider label="Photography" />

        {/* Photo Hero slideshow */}
        <PhotoHero />

        {/* Latest Photos */}
        <LatestPhotosRow />
      </main>

      <Footer />
    </div>
  );
};

export default Index;