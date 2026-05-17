import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Camera, Video, Heart, Users, Award, Zap, Globe, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const [stats, setStats] = useState({ photos: 0, videos: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: photoCount }, { count: videoCount }] = await Promise.all([
        supabase.from("photos").select("*", { count: "exact", head: true }),
        supabase.from("videos").select("*", { count: "exact", head: true }),
      ]);
      setStats({ photos: photoCount || 0, videos: videoCount || 0 });
    };
    fetchStats();
  }, []);

  const features = [
    { icon: Camera, title: "Photography", description: "Professional automotive photography capturing every angle, every detail, every emotion." },
    { icon: Video, title: "Videography", description: "Cinematic 4K videos that tell compelling stories about cars and culture." },
    { icon: Heart, title: "Passion", description: "Every piece of content is driven by genuine love for JDM culture and machines." },
    { icon: Users, title: "Community", description: "Building a global network of enthusiasts, photographers, and car lovers." },
    { icon: Award, title: "Quality", description: "Uncompromising standards — only the best shots make the cut." },
    { icon: Globe, title: "Global Reach", description: "Connecting JDM fans from Tokyo to Los Angeles and everywhere between." },
    { icon: Zap, title: "Fast Content", description: "Regular uploads keeping you up to date with the latest in the scene." },
    { icon: TrendingUp, title: "Growing", description: "A platform that's constantly evolving with the community it serves." },
  ];

  const timeline = [
    { year: "2021", title: "The Beginning", desc: "Started shooting at local car meets with a single camera and a passion for JDM." },
    { year: "2022", title: "Going Online", desc: "Launched AUTODOSE online. First gallery went viral within the JDM community." },
    { year: "2023", title: "Video Launch", desc: "Expanded into cinematic videography, bringing cars to life on screen." },
    { year: "2024", title: "Platform Built", desc: "Launched this full platform — a home for all JDM visual content." },
    { year: "2025", title: "Still Growing", desc: "New features, new content, new collaborations. The journey continues." },
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="About AUTODOSE — JDM Visual Storytelling"
        description="Learn about AUTODOSE, a creative platform dedicated to JDM car photography, cinematic videography, and automotive lifestyle culture."
      />
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-orbitron mb-4">
              Our Story
            </span>
            <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-foreground mb-6 leading-tight">
              Built By <span className="text-primary">Enthusiasts</span>
              <br />For Enthusiasts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AUTODOSE started as a passion project capturing cars at local meets. 
              Today it's a premium platform celebrating Japanese automotive culture worldwide.
            </p>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {[
              { label: "Photos", value: stats.photos > 0 ? `${stats.photos}+` : "Growing" },
              { label: "Videos", value: stats.videos > 0 ? `${stats.videos}+` : "Growing" },
              { label: "Countries", value: "20+" },
              { label: "Years Active", value: "4+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary transition-colors group"
              >
                <div className="text-3xl md:text-4xl font-orbitron font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-20"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-6">
                Why <span className="text-primary">AUTODOSE?</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  AUTO DOSE was born from a passion for Japanese automotive culture and visual storytelling. 
                  What started as a hobby capturing cars at local meets has evolved into a platform 
                  showcasing the finest JDM vehicles and the community behind them.
                </p>
                <p>
                  We specialize in automotive photography, cinematic videography, and authentic lifestyle content 
                  that brings the JDM scene to life. Every shot tells a story, every video captures emotion.
                </p>
                <p>
                  Our mission is to preserve and promote JDM culture through high-quality visual media, 
                  connecting enthusiasts and inspiring the next generation of automotive lovers.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-orbitron font-bold text-foreground text-center mb-12">
              Our <span className="text-primary">Journey</span>
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-border hidden md:block" />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    <div className="flex-1 bg-card border border-border rounded-xl p-6 hover:border-primary transition-colors">
                      <div className="text-primary font-orbitron font-bold text-lg mb-1">{item.year}</div>
                      <div className="font-semibold text-foreground mb-2">{item.title}</div>
                      <div className="text-muted-foreground text-sm">{item.desc}</div>
                    </div>
                    <div className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-background flex-shrink-0 relative z-10 shadow-glow" />
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* All Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-orbitron font-bold text-foreground text-center mb-12">
              What We <span className="text-primary">Offer</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary transition-colors group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="text-primary" size={28} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
