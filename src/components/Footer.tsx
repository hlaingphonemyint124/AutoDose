import { Instagram, Youtube, Twitter, Mail, Facebook, Phone, PhoneCall } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/autodose.mm/", label: "Instagram" },
    { icon: Youtube, href: "https://www.youtube.com/@autodosemm", label: "YouTube" },
    { icon: Facebook, href: "https://web.facebook.com/autodosemm", label: "Facebook" },
    
    
  ];

  return (
    <footer className="bg-secondary/50 backdrop-blur-lg border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-orbitron font-bold text-primary mb-4">
              AUTO<span className="text-foreground">DOSE</span>
            </h3>
            <p className="text-muted-foreground font-inter">
              Capturing the soul of JDM culture through premium photography, cinematic videos, and authentic lifestyle content.
            </p>
          </div>


          {/* Social */}
          <div>
            <h4 className="text-lg font-orbitron font-bold text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all hover:shadow-glow"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-inter">
            © 2024 AUTODOSE. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-inter">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-inter">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
