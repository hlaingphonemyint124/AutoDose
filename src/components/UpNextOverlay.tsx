import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  nextTitle: string;
  nextThumb?: string | null;
  onPlayNow: () => void;
  onCancel: () => void;
  seconds?: number;
}

const UpNextOverlay = ({ nextTitle, nextThumb, onPlayNow, onCancel, seconds = 10 }: Props) => {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onPlayNow();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onPlayNow]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="absolute bottom-24 right-6 z-30 w-80 bg-background/95 backdrop-blur-md border border-border rounded-lg overflow-hidden shadow-glow"
      >
        <div className="relative aspect-video bg-muted">
          {nextThumb ? (
            <img src={nextThumb} alt={nextTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="text-primary" size={40} />
            </div>
          )}
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:text-primary"
            aria-label="Cancel autoplay"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-xs text-muted-foreground">Up Next in {count}s</p>
          <h4 className="text-sm font-semibold text-foreground line-clamp-2">{nextTitle}</h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={onPlayNow} className="flex-1">
              <Play className="mr-1" size={14} fill="currentColor" />
              Play Now
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpNextOverlay;
