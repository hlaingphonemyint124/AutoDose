import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Camera, Video, Heart, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold text-foreground mb-4">
              About <span className="text-primary">AUTO DOSE</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Capturing the essence of JDM culture through the lens
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-8 mb-12"
          >
            <h2 className="text-3xl font-orbitron font-bold text-foreground mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                AUTO DOSE was born from a passion for Japanese automotive culture and visual storytelling. 
                What started as a hobby capturing cars at local meets has evolved into a platform 
                showcasing the finest JDM vehicles and the community behind them.
              </p>
              <p>
                We specialize in automotive photography, cinematic videography, and authentic lifestyle content 
                that brings the JDM scene to life. Every shot tells a story, every video captures emotion, 
                and every piece of content celebrates the dedication of car enthusiasts worldwide.
              </p>
              <p>
                Our mission is to preserve and promote JDM culture through high-quality visual media, 
                connecting enthusiasts and inspiring the next generation of automotive lovers.
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: Camera,
                title: "Photography",
                description: "Professional automotive photography capturing every detail"
              },
              {
                icon: Video,
                title: "Videography",
                description: "Cinematic videos that tell compelling stories"
              },
              {
                icon: Heart,
                title: "Passion",
                description: "Driven by love for JDM culture and cars"
              },
              {
                icon: Users,
                title: "Community",
                description: "Building connections within the car community"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-3 gap-8 text-center"
          >
            
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
