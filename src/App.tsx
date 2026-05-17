import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/useTheme";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Videos from "./pages/Videos";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ProfileSettings from "./pages/ProfileSettings";
import AccountSettings from "./pages/AccountSettings";
import AdminDashboard from "./pages/AdminDashboard";
import PhotoStory from "./pages/PhotoStory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = { duration: 0.3 };

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <Index />
            </motion.div>
          }
        />
        <Route
          path="/gallery"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <Gallery />
            </motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <About />
            </motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <Contact />
            </motion.div>
          }
        />
        <Route
          path="/videos"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <Videos />
            </motion.div>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/stories/:slug"
          element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
              <PhotoStory />
            </motion.div>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollProgressBar />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
