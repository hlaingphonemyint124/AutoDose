import { Instagram, Youtube, Mail, Facebook, X as XIcon, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: XIcon, href: "#", label: "X (Twitter)" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Mail, href: "mailto:contact@autodose.com", label: "Email" },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-orbitron font-bold mb-4">
              <span className="text-primary">AUTO</span>
              <span className="text-foreground">DOSE</span>
            </h3>
            <p className="text-muted-foreground font-inter leading-relaxed mb-6 max-w-xs">
              Capturing the soul of JDM culture through premium photography, cinematic videos, and authentic lifestyle content.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all hover:shadow-glow hover:scale-110"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-orbitron font-bold text-foreground mb-4 uppercase tracking-widest">Navigate</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/gallery", label: "Gallery" },
                { to: "/videos", label: "Videos" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors font-inter text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-orbitron font-bold text-foreground mb-4 uppercase tracking-widest">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors">
                <a href="mailto:contact@autodose.com">contact@autodose.com</a>
              </li>
              <li>Tokyo, Japan</li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Send a Message →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-inter">
            © {new Date().getFullYear()} AUTODOSE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-inter">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-inter">
              Terms of Service
            </a>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              aria-label="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
