import { useState } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import FeaturedHero from "@/components/FeaturedHero";
import HomeVideoRows from "@/components/HomeVideoRows";
import PhotoHero from "@/components/PhotoHero";
import LatestPhotosRow from "@/components/LatestPhotosRow";
import Footer from "@/components/Footer";
import { RowVideo } from "@/components/VideoRow";
import { Aperture, Camera, Clapperboard, Gauge, MapPin, Sparkles } from "lucide-react";

const services = [
  {
    icon: Camera,
    title: "Automotive Photography",
    body: "Rolling shots, detail sets, launch galleries, and editorial coverage shaped around the car's character.",
  },
  {
    icon: Clapperboard,
    title: "Cinematic Videography",
    body: "Short films, event recaps, reels, and story-led edits built for YouTube, social, and brand launches.",
  },
  {
    icon: Aperture,
    title: "Visual Direction",
    body: "Location scouting, mood, shot planning, and post-production so every feature feels intentional.",
  },
];

const process = [
  ["01", "Scout", "Find light, routes, angles, and details that make the build feel alive."],
  ["02", "Shoot", "Capture motion, texture, cockpit details, owner moments, and cinematic hero frames."],
  ["03", "Grade", "Finish with clean contrast, disciplined color, and a polished automotive tone."],
];

const ScrollCraftSection = () => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-32">
      <div className="absolute inset-0 bg-secondary/35" />
      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              <Sparkles size={15} />
              Built for car culture
            </p>
            <h2 className="text-balance font-orbitron text-3xl font-bold leading-tight text-foreground sm:text-5xl">
              Automotive visuals with the discipline of an editorial studio.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              AUTODOSE treats every car like a feature story: stance, paint, sound, owner, location,
              and movement all matter. The result is a homepage that feels more like a curated garage
              than a generic video grid.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Photo", "High-detail sets"],
                ["Film", "Cinematic edits"],
                ["Street", "Myanmar meets"],
              ].map(([label, value]) => (
                <div key={label} className="border border-border bg-background/80 p-4">
                  <div className="font-orbitron text-xl font-bold text-foreground">{label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="auto-perspective">
            <motion.div
              className="relative mx-auto max-w-xl preserve-3d"
              initial={{ opacity: 0, scale: 0.94, y: 50, rotateY: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0, rotateY: -6 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -left-5 top-8 h-full w-full border border-primary/35" />
              <div className="relative overflow-hidden border border-border bg-card shadow-card">
                <img
                  src="/og-default.jpg"
                  alt="AUTODOSE automotive feature"
                  className="aspect-[16/11] w-full object-cover"
                />
                <div className="grid grid-cols-3 border-t border-border bg-background">
                  {process.map(([step, title, body]) => (
                    <div key={step} className="border-r border-border p-4 last:border-r-0">
                      <div className="font-orbitron text-sm text-primary">{step}</div>
                      <div className="mt-2 font-semibold text-foreground">{title}</div>
                      <p className="mt-2 hidden text-xs leading-5 text-muted-foreground sm:block">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ServiceSection = () => (
  <section className="py-18 sm:py-24">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65 }}
        className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"
      >
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <Gauge size={15} />
            Production lane
          </p>
          <h2 className="font-orbitron text-3xl font-bold text-foreground sm:text-5xl">Shoot. Edit. Launch.</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          From a single owner feature to a full event recap, the workflow stays clean, fast, and visually consistent.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service, index) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 34, rotateX: -8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="group border border-border bg-card p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/45"
          >
            <div className="mb-8 flex h-12 w-12 items-center justify-center border border-border bg-background text-primary transition group-hover:border-primary">
              <service.icon size={22} />
            </div>
            <h3 className="font-orbitron text-xl font-bold text-foreground">{service.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.body}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

const LocationBand = () => (
  <section className="border-y border-border bg-foreground text-background">
    <div className="container mx-auto flex flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <MapPin className="text-primary" size={22} />
        <div>
          <div className="font-orbitron text-lg font-bold">Myanmar automotive stories</div>
          <div className="text-sm text-background/65">Meets, builds, coffee runs, launch edits, and street features.</div>
        </div>
      </div>
      <div className="text-sm uppercase tracking-[0.22em] text-background/60">AUTODOSE / Photo + Film</div>
    </div>
  </section>
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

        <ScrollCraftSection />
        <ServiceSection />

        {/* Photo Hero (slideshow) */}
        <PhotoHero />

        {/* Latest Photos row */}
        <LatestPhotosRow />

        <LocationBand />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
