import { useState, useEffect } from "react";
import { Menu, X, User, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", session.user.id)
          .single();
        
        if (data?.avatar_url) {
          setProfilePhoto(data.avatar_url);
        }
      }
    };
    loadProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const handleNavClick = (href: string, isExternal: boolean) => {
    if (isExternal) {
      navigate(href);
    } else {
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/", isExternal: true },
    { name: "Gallery", href: "/gallery", isExternal: true },
    { name: "Videos", href: "/videos", isExternal: true },
    { name: "About", href: "/about", isExternal: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-glow"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/">
            <motion.div
              className="text-2xl md:text-3xl font-orbitron font-bold text-primary cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              AUTO<span className="text-foreground">DOSE</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.button
                key={link.name}
                onClick={() => handleNavClick(link.href, link.isExternal)}
                className="text-foreground hover:text-primary transition-colors font-inter font-medium"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {link.name}
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/contact">
                <Button variant="outline" className="font-inter font-semibold border-border hover:bg-card">
                  Contact
                </Button>
              </Link>
            </motion.div>
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src={profilePhoto} alt="Profile" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card border-border" align="end">
                    <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <Link to="/profile-settings">
                      <DropdownMenuItem className="text-foreground hover:bg-background cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/account-settings">
                      <DropdownMenuItem className="text-foreground hover:bg-background cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-border" />
{isAdmin && (
  <Link to="/admin">
    <DropdownMenuItem className="text-primary hover:bg-background cursor-pointer">
      <LayoutDashboard className="mr-2 h-4 w-4" />
      <span>Admin Dashboard</span>
    </DropdownMenuItem>
  </Link>
)}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      className="text-foreground hover:bg-background cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-semibold shadow-glow">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card/95 backdrop-blur-md border-t border-border"
            >
              <div className="flex flex-col gap-4 py-6">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href, link.isExternal)}
                    className="text-foreground hover:text-primary transition-colors font-inter font-medium px-4 text-left"
                  >
                    {link.name}
                  </button>
                ))}
                <div className="px-4 space-y-2">
                  <Link to="/contact">
                    <Button variant="outline" className="w-full font-inter font-semibold border-border hover:bg-card">
                      Contact
                    </Button>
                  </Link>
                  {isAuthenticated ? (
                    <>
{isAdmin && (
  <Link to="/admin">
    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-semibold shadow-glow">
      <LayoutDashboard className="mr-2" size={16} />
      Dashboard
    </Button>
  </Link>
)}
                      <Button 
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full font-inter font-semibold border-border hover:bg-card"
                      >
                        <LogOut className="mr-2" size={16} />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-semibold shadow-glow">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
