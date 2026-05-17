import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Giant 404 */}
          <div className="relative mb-8">
            <div className="text-[10rem] md:text-[16rem] font-orbitron font-black text-border select-none leading-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-orbitron font-bold">
                  <span className="text-primary">AUTO</span>
                  <span className="text-foreground">DOSE</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like this road doesn't exist. Let's get you back on track.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-border hover:bg-card"
            >
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Home size={16} className="mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
