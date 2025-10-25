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
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
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
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          <img
            src={photos[currentIndex].storage_url}
            alt={photos[currentIndex].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-black mb-6 leading-tight">
            <span className="text-primary">AUTO</span>
            <span className="text-foreground">DOSE</span>
          </h1>
          <motion.h2
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-inter text-muted-foreground mb-8"
          >
            {photos[currentIndex].title}
          </motion.h2>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/50 hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/20 backdrop-blur-sm hover:bg-background/40 text-foreground"
      >
        <ChevronLeft size={32} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/20 backdrop-blur-sm hover:bg-background/40 text-foreground"
      >
        <ChevronRight size={32} />
      </Button>
    </section>
  );
};
