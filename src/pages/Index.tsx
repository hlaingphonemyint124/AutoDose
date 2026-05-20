import { useState } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import FeaturedHero from "@/components/FeaturedHero";
import HomeVideoRows from "@/components/HomeVideoRows";
import PhotoHero from "@/components/PhotoHero";
import LatestPhotosRow from "@/components/LatestPhotosRow";
import Footer from "@/components/Footer";
import OurServices from "@/components/OurServices";
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

      {/* Video Hero — full bleed, thumbnails as background */}
      <FeaturedHero onPlay={(v) => setHeroSelected(v as RowVideo)} />

      <main>
        <div id="video-rows" className="scroll-mt-24 pt-0">
          <HomeVideoRows
            externalSelected={heroSelected}
            onCloseExternal={() => setHeroSelected(null)}
          />
        </div>

        <OurServices />

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
