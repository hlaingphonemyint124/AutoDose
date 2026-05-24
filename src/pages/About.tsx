import { useEffect, useState, useRef } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, useInView } from "framer-motion";
import { Camera, Video, Heart, Users, Award, Zap, Globe, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function CountUp({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || to === 0) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{inView ? count : 0}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22,1,0.36,1] },
  }),
};

const About = () => {
  const [stats, setStats] = useState({ photos: 0, videos: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("photos").select("*", { count: "exact", head: true }),
      supabase.from("videos").select("*", { count: "exact", head: true }),
    ]).then(([{ count: p }, { count: v }]) => {
      setStats({ photos: p || 0, videos: v || 0 });
    });
  }, []);

  const features = [
    { icon: Camera,     title: "Photography",  description: "Professional automotive photography capturing every angle, detail, and emotion." },
    { icon: Video,      title: "Videography",  description: "Cinematic 4K videos that tell compelling stories about cars and culture." },
    { icon: Heart,      title: "Passion",      description: "Every piece of content is driven by genuine love for JDM culture and machines." },
    { icon: Users,      title: "Community",    description: "Building a global network of enthusiasts, photographers, and car lovers." },
    { icon: Award,      title: "Quality",      description: "Uncompromising standards — only the best shots make the cut." },
    { icon: Globe,      title: "Global Reach", description: "Connecting JDM fans from Tokyo to Los Angeles and everywhere between." },
    { icon: Zap,        title: "Fast Content", description: "Regular uploads keeping you up to date with the latest in the scene." },
    { icon: TrendingUp, title: "Growing",      description: "A platform constantly evolving with the community it serves." },
  ];

  const timeline = [
    { year: "2021", title: "The Beginning",  desc: "Started shooting at local car meets with a single camera and a passion for JDM." },
    { year: "2022", title: "Going Online",   desc: "Launched AUTODOSE online. First gallery went viral within the JDM community." },
    { year: "2023", title: "Video Launch",   desc: "Expanded into cinematic videography, bringing cars to life on screen." },
    { year: "2024", title: "Platform Built", desc: "Launched this full platform — a home for all JDM visual content." },
    { year: "2025", title: "Still Growing",  desc: "New features, new content, new collaborations. The journey continues." },
  ];

  const statItems = [
    { label: "Photos",      value: stats.photos, suffix: "+" },
    { label: "Videos",      value: stats.videos, suffix: "+" },
    { label: "Countries",   value: 20, suffix: "+" },
    { label: "Years Active",value: 4,  suffix: "+" },
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="About AUTODOSE — JDM Visual Storytelling"
        description="Learn about AUTODOSE, a creative platform dedicated to JDM car photography, cinematic videography, and automotive lifestyle culture."
      />
      <Navbar />

      {/* Hero */}
      <div className="pt-28 md:pt-36 pb-16 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/4 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-orbitron mb-4 px-4 py-1.5 border border-primary/30 rounded-full bg-primary/5"
            >
              Our Story
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
              className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-bold text-foreground mb-6 leading-tight">
              Built By <span className="text-primary">Enthusiasts</span>
              <br className="hidden sm:block" />
              {" "}For Enthusiasts
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AUTODOSE started as a passion project capturing cars at local meets.
              Today it's a premium platform celebrating Japanese automotive culture worldwide.
            </motion.p>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20"
          >
            {statItems.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}
                className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 md:p-7 text-center group transition-all duration-300 hover:shadow-[0_0_30px_hsla(var(--primary)/0.1)]"
              >
                <div className="text-3xl md:text-5xl font-orbitron font-bold text-primary mb-2 group-hover:scale-105 transition-transform duration-300 tabular-nums">
                  <CountUp to={stat.value} />{stat.suffix}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-20"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-6">
                Why <span className="text-primary">AUTODOSE?</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                <p>AUTO DOSE was born from a passion for Japanese automotive culture and visual storytelling. What started as a hobby capturing cars at local meets has evolved into a platform showcasing the finest JDM vehicles and the community behind them.</p>
                <p>We specialize in automotive photography, cinematic videography, and authentic lifestyle content that brings the JDM scene to life. Every shot tells a story, every video captures emotion.</p>
                <p>Our mission is to preserve and promote JDM culture through high-quality visual media, connecting enthusiasts and inspiring the next generation of automotive lovers.</p>
              </div>
            </div>
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 gap-3 md:gap-4"
            >
              {features.slice(0, 4).map((feature) => (
                <motion.div key={feature.title} variants={fadeUp}
                  className="bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/50 transition-all duration-300 group hover:shadow-[0_4px_20px_hsla(var(--primary)/0.08)]"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="text-primary" size={20} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-orbitron font-bold text-foreground text-center mb-12">
              Our <span className="text-primary">Journey</span>
            </h2>
            <div className="relative">
              {/* Center line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6 md:space-y-8">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22,1,0.36,1] }}
                    className={`flex items-center gap-6 md:gap-8 pl-10 md:pl-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    <div className="flex-1 bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-300 group">
                      <div className="text-primary font-orbitron font-bold text-lg mb-1 group-hover:text-primary transition-colors">{item.year}</div>
                      <div className="font-semibold text-foreground mb-2 text-sm md:text-base">{item.title}</div>
                      <div className="text-muted-foreground text-sm leading-relaxed">{item.desc}</div>
                    </div>
                    {/* Dot */}
                    <div className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-background flex-shrink-0 relative z-10 shadow-[0_0_12px_hsla(var(--primary)/0.6)]" />
                    <div className="flex-1 hidden md:block" />
                    {/* Mobile dot */}
                    <div className="md:hidden absolute left-4 w-3 h-3 rounded-full bg-primary border-3 border-background -translate-x-1.5 shadow-[0_0_8px_hsla(var(--primary)/0.5)]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* All Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-orbitron font-bold text-foreground text-center mb-10">
              What We <span className="text-primary">Offer</span>
            </h2>
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={fadeUp}
                  className="bg-card border border-border rounded-xl p-5 md:p-6 text-center hover:border-primary/50 transition-all duration-300 group hover:shadow-[0_4px_24px_hsla(var(--primary)/0.1)]"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
