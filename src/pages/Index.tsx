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

// Slim animated divider between sections
const SectionDivider = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="relative h-px mx-6 sm:mx-10 lg:mx-16 my-2 overflow-hidden"
  >
    <div className="absolute inset-0 bg-border" />
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: "easeOut", delay: 0.15 }}
      style={{ transformOrigin: "left center" }}
      className="absolute inset-0 bg-gradient-to-r from-primary/55 via-primary/25 to-transparent"
    />
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

      <ScrollProgressBar />
      <Navbar />

      {/* Video Hero — full bleed, thumbnails as background */}
      <FeaturedHero onPlay={(v) => setHeroSelected(v as RowVideo)} />

      <main>
        {/*
          Latest Releases section has been removed from here.
          Videos are now browsable via the hero filmstrip and the Videos page.
          The HomeVideoRows below handles modal playback when a hero card is clicked.
        */}
        <div id="video-rows" className="pt-0">
          <HomeVideoRows
            externalSelected={heroSelected}
            onCloseExternal={() => setHeroSelected(null)}
            hideLatestRow
          />
        </div>

        <SectionDivider />

        <CinematicShowcase />

        <SectionDivider />

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
