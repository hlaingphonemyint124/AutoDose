import { useState } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Youtube, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    // Simulate sending (replace with your email service if needed)
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactItems = [
    { icon: Mail, label: "Email", value: "autodose.mm@gmail.com", href: "mailto:autodose.mm@gmail.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, label: "Location", value: "Yangon, Myanmar", href: "#" },
  ];

  const socials = [
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/autodose.mm/", color: "hover:text-pink-400" },
    { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@autodosemm", color: "hover:text-red-500" },
    { icon: Mail, label: "Email", href: "mailto:autodose.mm@gmail.com", color: "hover:text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="Contact AUTODOSE — Let's Work Together"
        description="Get in touch with AUTODOSE for JDM photography collaborations, video projects, or general inquiries."
      />
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-orbitron mb-4">
              Reach Out
            </span>
            <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-foreground mb-6">
              Let's <span className="text-primary">Connect</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a collaboration idea, a shoot in mind, or just want to talk cars? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left — Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-foreground mb-6">Contact Info</h2>
                <div className="space-y-4">
                  {contactItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="text-primary" size={22} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                        <p className="font-semibold text-foreground">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-orbitron font-bold text-foreground mb-2">Follow the Journey</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Stay up to date with the latest shoots, meets, and behind-the-scenes content.
                </p>
                <div className="flex gap-4">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className={`w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground ${s.color} hover:border-primary transition-all hover:shadow-glow hover:scale-110`}
                    >
                      <s.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="font-orbitron font-bold text-foreground mb-2">🚗 Collab Opportunities</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We're open to car meets, brand partnerships, photography commissions, and video projects. 
                  Drop us a message and let's make something great together.
                </p>
              </div>
            </motion.div>

            {/* Right — Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-card border border-border rounded-2xl p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="text-primary mx-auto mb-4" size={64} />
                    <h3 className="text-2xl font-orbitron font-bold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
                    <Button
                      className="mt-6 bg-primary hover:bg-primary/90"
                      onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                    >
                      Send Another
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl font-orbitron font-bold text-foreground mb-6">Send a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input id="name" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} className="bg-background border-border" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} className="bg-background border-border" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" placeholder="What's this about?" value={formData.subject} onChange={handleChange} className="bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea id="message" name="message" placeholder="Tell us more..." value={formData.message} onChange={handleChange} className="bg-background border-border min-h-[140px] resize-none" required />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Sending...</span>
                        ) : (
                          <span className="flex items-center gap-2"><Send size={18} /> Send Message</span>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
