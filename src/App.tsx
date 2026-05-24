import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/useTheme";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";

// ── Lazy-load all pages (code-splitting — faster initial load) ─────────────
const Index            = lazy(() => import("./pages/Index"));
const Contact          = lazy(() => import("./pages/Contact"));
const Videos           = lazy(() => import("./pages/Videos"));
const Gallery          = lazy(() => import("./pages/Gallery"));
const About            = lazy(() => import("./pages/About"));
const Auth             = lazy(() => import("./pages/Auth"));
const ProfileSettings  = lazy(() => import("./pages/ProfileSettings"));
const AccountSettings  = lazy(() => import("./pages/AccountSettings"));
const AdminDashboard   = lazy(() => import("./pages/AdminDashboard"));
const PhotoStory       = lazy(() => import("./pages/PhotoStory"));
const NotFound         = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,  // 5 min cache
      gcTime: 1000 * 60 * 10,
    },
  },
});

// Page transition wrapper
const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  enter:    { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.18, ease: "easeIn" } },
};

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

// Loading fallback — minimal, no spinner jank
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-1 bg-border rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full animate-[stripe-run_1.4s_ease-in-out_infinite]" />
    </div>
  </div>
);

// Admin guard — redirects to / if not admin, prevents flash
function ProtectedAdminRoute() {
  const { isAdmin, loading } = useAdmin();
  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminDashboard />
    </Suspense>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ willChange: "opacity, transform" }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/"                  element={<Index />} />
            <Route path="/gallery"           element={<Gallery />} />
            <Route path="/about"             element={<About />} />
            <Route path="/contact"           element={<Contact />} />
            <Route path="/videos"            element={<Videos />} />
            <Route path="/auth"              element={<Auth />} />
            <Route path="/profile-settings"  element={<ProfileSettings />} />
            <Route path="/account-settings"  element={<AccountSettings />} />
            <Route path="/admin"             element={<ProtectedAdminRoute />} />
            <Route path="/stories/:slug"     element={<PhotoStory />} />
            <Route path="*"                  element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollProgressBar />
          <ScrollToTop />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
