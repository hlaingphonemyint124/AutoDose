import { useState, useEffect } from "react";
import { Menu, X, User, Settings, LayoutDashboard, LogOut, Home, Film, Image as ImageIcon, Info, Mail, ChevronRight } from "lucide-react";
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
import ThemeToggle from "@/components/ThemeToggle";

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
    { name: "Home", href: "/", isExternal: true, icon: Home },
    { name: "Videos", href: "/videos", isExternal: true, icon: Film },
    { name: "Gallery", href: "/gallery", isExternal: true, icon: ImageIcon },
    { name: "About", href: "/about", isExternal: true, icon: Info },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "dark:nav-glass bg-background/97 dark:bg-transparent border-b border-border/60 shadow-sm"
          : "bg-transparent border-b border-transparent"
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
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                animate={{ 
                  textShadow: [
                    "0 0 10px rgba(255, 69, 0, 0.5)",
                    "0 0 20px rgba(255, 69, 0, 0.8)",
                    "0 0 10px rgba(255, 69, 0, 0.5)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AUTO
              </motion.span>
              <span className="text-foreground">DOSE</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation (lg+) */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.button
                key={link.name}
                onClick={() => handleNavClick(link.href, link.isExternal)}
                className="text-foreground hover:text-primary transition-colors duration-200 font-inter font-medium relative group pb-0.5"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.06, ease: "easeOut" }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <ThemeToggle />
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
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  y: [0, -6, 0]
                }}
                transition={{ 
                  opacity: { duration: 0.3 },
                  y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-semibold shadow-glow">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile/Tablet Menu Button (below lg) */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-foreground p-2 rounded-md hover:bg-card transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <X size={26} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <Menu size={26} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Professional dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 top-20 bg-foreground/20 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="lg:hidden absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 origin-top rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              >
                {/* Profile header (when signed in) */}
                {isAuthenticated && (
                  <div className="px-4 py-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-border flex items-center gap-3">
                    <Avatar className="h-11 w-11 border-2 border-primary">
                      <AvatarImage src={profilePhoto} alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User size={18} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">My Account</p>
                      <p className="text-xs text-muted-foreground truncate">Manage your profile</p>
                    </div>
                  </div>
                )}

                {/* Navigation section */}
                <div className="px-2 pt-3 pb-2">
                  <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                    Browse
                  </p>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.name}
                        onClick={() => handleNavClick(link.href, link.isExternal)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-colors font-inter font-medium text-sm group"
                      >
                        <Icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="flex-1 text-left">{link.name}</span>
                        <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>

                {/* Account section */}
                {isAuthenticated && (
                  <div className="px-2 py-2 border-t border-border">
                    <p className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                      Account
                    </p>
                    <Link to="/profile-settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-colors text-sm font-medium">
                        <User size={18} className="text-muted-foreground" />
                        <span className="flex-1 text-left">Profile Settings</span>
                      </button>
                    </Link>
                    <Link to="/account-settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-secondary hover:text-primary transition-colors text-sm font-medium">
                        <Settings size={18} className="text-muted-foreground" />
                        <span className="flex-1 text-left">Account Settings</span>
                      </button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors text-sm font-semibold">
                          <LayoutDashboard size={18} />
                          <span className="flex-1 text-left">Admin Dashboard</span>
                        </button>
                      </Link>
                    )}
                  </div>
                )}

                {/* Footer actions */}
                <div className="px-3 py-3 border-t border-border bg-secondary/30 space-y-2">
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-inter font-semibold gap-2">
                      <Mail size={16} />
                      Contact Us
                    </Button>
                  </Link>
                  {isAuthenticated ? (
                    <Button
                      onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                      variant="ghost"
                      className="w-full font-inter font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </Button>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-semibold shadow-glow">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
