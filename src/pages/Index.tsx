import { useState } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import FeaturedHero from "@/components/FeaturedHero";
import HomeVideoRows from "@/components/HomeVideoRows";
import PhotoHero from "@/components/PhotoHero";
import LatestPhotosRow from "@/components/LatestPhotosRow";
import Footer from "@/components/Footer";
import CinematicShowcase from "@/components/CinematicShowcase";
import { RowVideo } from "@/components/VideoRow";

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
      <Navbar />

      {/* Video Hero */}
      <FeaturedHero onPlay={(v) => setHeroSelected(v as RowVideo)} />

      <main>
        {/* Latest Releases (videos) */}
        <div id="latest-releases">
          <HomeVideoRows
            externalSelected={heroSelected}
            onCloseExternal={() => setHeroSelected(null)}
          />
        </div>

        <CinematicShowcase />

        {/* Photo Hero (slideshow) */}
        <PhotoHero />

        {/* Latest Photos row */}
        <LatestPhotosRow />

      </main>

      <Footer />
    </div>
  );
};

export default Index;
