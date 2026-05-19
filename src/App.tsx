import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/useTheme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ScrollProgressBar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/stories/:slug" element={<PhotoStory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;