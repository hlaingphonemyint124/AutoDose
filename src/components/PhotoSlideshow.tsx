import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface SlideshowPhoto {
  id: string;
  storage_url: string;
  title: string;
  display_order: number;
}

export const PhotoSlideshow = () => {
  const [photos, setPhotos] = useState<SlideshowPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, photos.length]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("slideshow_photos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching slideshow photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAnimationEffect = (index: number) => {
    const effects = [
      { scale: [1, 1.05, 1], rotateZ: [0, 2, -2, 0], y: [0, -10, 0] },
      { scale: [1, 1.1, 1], rotateX: [0, 10, 0], opacity: [1, 0.8, 1] },
      { rotateY: [0, 360], scale: [1, 1.2, 1] },
      { x: [0, 20, -20, 0], scale: [1, 0.95, 1.05, 1] },
      { y: [0, -20, 20, 0], rotateZ: [0, -5, 5, 0] }
    ];
    return effects[index % effects.length];
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading slideshow...</p>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-4xl font-orbitron font-bold text-foreground mb-4">
            <span className="text-primary">AUTO</span>DOSE
          </h2>
          <p className="text-muted-foreground">Premium JDM Photography & Videography</p>
        </div>
      </section>
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <section className="relative h-screen overflow-hidden bg-background">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 }
          }}
          className="absolute inset-0"
        >
          <motion.img
            src={photos[currentIndex].storage_url}
            alt={photos[currentIndex].title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90 dark:from-background/60 dark:via-background/40 dark:to-background/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <motion.h1 
            key={`title-${currentIndex}`}
            className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              ...getAnimationEffect(currentIndex)
            }}
            transition={{ 
              opacity: { duration: 0.6, delay: 0.4 },
              y: { duration: 0.6, delay: 0.4 },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotateZ: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotateX: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              rotateY: { duration: 4, ease: "easeInOut" },
              x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <motion.span 
              className="text-primary drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              animate={{
                textShadow: [
                  "0 0 30px rgba(239,68,68,0.5)",
                  "0 0 50px rgba(239,68,68,0.8)",
                  "0 0 30px rgba(239,68,68,0.5)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              AUTO
            </motion.span>
            <span className="text-foreground">DOSE</span>
          </motion.h1>
          <motion.h2
            key={`subtitle-${currentIndex}`}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              ...getAnimationEffect(currentIndex + 1)
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.6 },
              scale: { duration: 0.5, delay: 0.6 },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              rotateZ: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotateX: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="text-2xl md:text-4xl font-inter text-muted-foreground mb-8"
          >
            {photos[currentIndex].title}
          </motion.h2>
        </motion.div>

        {/* Slide indicators with enhanced animations */}
        <motion.div 
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {photos.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-12 h-3 bg-primary shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                  : "w-3 h-3 bg-muted-foreground/50 hover:bg-muted-foreground"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Navigation Buttons with enhanced effects */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/30 dark:bg-background/20 dark:backdrop-blur-sm hover:bg-background/50 dark:hover:bg-background/40 text-foreground transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
      >
        <ChevronLeft size={32} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/30 dark:bg-background/20 dark:backdrop-blur-sm hover:bg-background/50 dark:hover:bg-background/40 text-foreground transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
      >
        <ChevronRight size={32} />
      </Button>
    </section>
  );
};
