import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Camera, Video } from "lucide-react";
import heroImage from "@/assets/hero-jdm.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="JDM Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-black mb-6 leading-tight">
              <span className="text-primary">AUTO</span>
              <span className="text-foreground">DOSE</span>
            </h1>
            <p className="text-xl md:text-2xl font-inter text-muted-foreground mb-8 max-w-2xl mx-auto">
              Premium JDM photography, cinematic videography, and authentic lifestyle vlogs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-bold text-lg px-8 py-6 shadow-glow-intense"
            >
              <Play className="mr-2" size={20} />
              Watch Latest
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary bg-transparent hover:bg-primary/10 text-foreground font-inter font-bold text-lg px-8 py-6"
            >
              <Camera className="mr-2" size={20} />
              Explore Gallery
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-primary mb-2">500+</div>
              <div className="text-sm md:text-base font-inter text-muted-foreground">Photos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-primary mb-2">100+</div>
              <div className="text-sm md:text-base font-inter text-muted-foreground">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-primary mb-2">50K+</div>
              <div className="text-sm md:text-base font-inter text-muted-foreground">Followers</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
