import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Aperture, Camera, Clapperboard, Gauge, MapPin, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-jdm.jpg";

const featureFrames = [
  {
    icon: Camera,
    title: "Rolling shots",
    body: "Low-angle motion, clean reflections, and road texture designed for scroll-stopping covers.",
  },
  {
    icon: Clapperboard,
    title: "Film edits",
    body: "Short cinematic cuts, launch reels, event recaps, and YouTube-first story packages.",
  },
  {
    icon: Aperture,
    title: "Editorial sets",
    body: "Detail galleries with consistent grading, disciplined crops, and feature-ready sequencing.",
  },
];

const statFrames = [
  ["01", "Scout", "Routes, light, backdrop, and where the car will feel fastest."],
  ["02", "Shoot", "Hero frames, motion passes, cockpit details, and owner moments."],
  ["03", "Grade", "Crisp contrast, controlled reds, clean blacks, and export-ready media."],
];

const CinematicShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  });

  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [70, -70]);
  const deckY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [34, -42]);
  const deckRotate = useTransform(scrollYProgress, [0, 0.55, 1], reduceMotion ? [0, 0, 0] : [8, -5, -10]);
  const lineScale = useTransform(scrollYProgress, [0.08, 0.88], [0, 1]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary))/0.55_48%,hsl(var(--background)))]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              <Sparkles size={15} />
              Cinematic scroll system
            </p>
            <h2 className="text-balance font-orbitron text-3xl font-bold leading-tight text-foreground sm:text-5xl">
              A homepage that moves like an automotive film.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              The scroll experience now uses layered depth, restrained 3D transforms, responsive reveal timing, and
              motion fallbacks so the site feels premium on desktop without becoming heavy on mobile.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {featureFrames.map((frame, index) => (
                <motion.article
                  key={frame.title}
                  initial={{ opacity: 0, y: 26, rotateX: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.62, delay: index * 0.08, ease: "easeOut" }}
                  className="group border border-border bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/55 hover:shadow-glow card-shimmer-hover card-glow-hover cursor-default"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center border border-border bg-background text-primary transition group-hover:border-primary">
                    <frame.icon size={20} />
                  </div>
                  <h3 className="font-orbitron text-base font-bold text-foreground">{frame.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{frame.body}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>

          <div className="auto-perspective">
            <motion.div
              style={{ y: deckY, rotateY: deckRotate }}
              className="relative mx-auto max-w-2xl preserve-3d"
            >
              <motion.div
                aria-hidden="true"
                style={{ scaleX: lineScale }}
                className="absolute -left-8 top-12 hidden h-px w-40 origin-left bg-primary/70 md:block"
              />
              <div className="absolute -right-4 top-10 h-[82%] w-[78%] [transform:translateZ(-40px)] border border-primary/30 bg-primary/5" />
              <div className="absolute -bottom-5 left-6 h-[82%] w-[86%] rotate-2 border border-border bg-card/70" />

              <div className="relative overflow-hidden border border-border bg-card shadow-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <motion.img
                    src={heroImage}
                    alt="AUTODOSE cinematic automotive production"
                    style={{ y: imageY }}
                    className="h-[120%] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/18 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/72">
                    <Gauge size={13} className="text-primary" />
                    Motion grade
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="font-orbitron text-2xl font-bold text-white sm:text-4xl">AUTODOSE Visual Garage</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/72">
                      Built for car culture, video discovery, and photo-led storytelling.
                    </p>
                  </div>
                </div>

                <div className="grid border-t border-border bg-background sm:grid-cols-3">
                  {statFrames.map(([step, title, body]) => (
                    <div key={step} className="border-b border-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                      <div className="font-orbitron text-sm text-primary">{step}</div>
                      <div className="mt-2 font-semibold text-foreground">{title}</div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-16 border-y border-border bg-foreground text-background">
          <div className="flex flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="text-primary" size={22} />
              <div>
                <div className="font-orbitron text-lg font-bold">Myanmar automotive stories</div>
                <div className="text-sm text-background/65">Meets, builds, coffee runs, launch edits, and street features.</div>
              </div>
            </div>
            <div className="text-sm uppercase tracking-[0.22em] text-background/60">AUTODOSE / Photo + Film</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CinematicShowcase;
