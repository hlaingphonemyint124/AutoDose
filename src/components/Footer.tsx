import { Instagram, Youtube, Mail, Facebook, ArrowUp, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/autodose.mm/", label: "Instagram", color: "hover:text-pink-400 hover:border-pink-400/40" },
    { icon: Youtube,   href: "https://www.youtube.com/@autodosemm", label: "YouTube",   color: "hover:text-red-500 hover:border-red-500/40" },
    { icon: Facebook,  href: "https://web.facebook.com/autodosemm/", label: "Facebook",  color: "hover:text-blue-400 hover:border-blue-400/40" },
    { icon: Mail, href: "mailto:autodose.mm@gmail.com", label: "Email", color: "hover:text-primary hover:border-primary/40" },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-72 h-36 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/3 w-56 h-24 bg-primary/4 rounded-full blur-3xl" />
      </div>

      {/* Top divider stripe */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-stripe-run" />
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Link to="/">
              <h3 className="text-3xl font-orbitron font-bold mb-1 group">
                <span className="text-primary group-hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.7)] transition-all duration-300">AUTO</span>
                <span className="text-foreground">DOSE</span>
              </h3>
            </Link>
            <p className="text-xs text-primary/70 font-orbitron tracking-widest uppercase mb-5">
              Visual Garage
            </p>
            <p className="text-muted-foreground font-inter leading-relaxed mb-6 max-w-xs text-sm">
              Capturing the soul of JDM culture through premium photography, cinematic videos, and authentic lifestyle content.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.07 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className={`footer-social-icon w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground transition-all ${social.color} hover:shadow-[0_4px_16px_hsla(var(--primary)/0.25)]`}
                >
                  <social.icon size={17} />
                </motion.a>
              ))}
            </div>

            {/* Location + hours */}
            <div className="mt-6 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-primary flex-shrink-0" />
                <span>Yangon, Myanmar</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-primary flex-shrink-0" />
                <span>Available for bookings · Mon – Sat</span>
              </div>
            </div>
          </motion.div>

          {/* Navigate */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xs font-orbitron font-bold text-foreground mb-5 uppercase tracking-[0.22em]">Navigate</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/gallery", label: "Gallery" },
                { to: "/videos", label: "Videos" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.38, delay: 0.2 + i * 0.06 }}
                >
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors font-inter text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-primary transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xs font-orbitron font-bold text-foreground mb-5 uppercase tracking-[0.22em]">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:autodose.mm@gmail.com"
                  className="hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <Mail size={13} className="text-primary/60 group-hover:text-primary transition-colors" />
                  autodose.mm@gmail.com
                </a>
              </li>
              <li className="pt-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/55 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-200 hover:shadow-glow hover:scale-[1.03] active:scale-[0.97]"
                >
                  Send a Message
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
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
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:shadow-glow"
              aria-label="Scroll to top"
            >
              <ArrowUp size={15} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
