import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Instagram, Youtube, Send, CheckCircle, Facebook, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22,1,0.36,1] },
  }),
};

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [honeypot, setHoneypot] = useState(""); // spam trap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot — bots fill this, humans don't
    if (honeypot) return;

    // Rate limit: 60s between submissions
    const now = Date.now();
    if (now - lastSubmitRef.current < 60_000) {
      toast({ title: "Please wait a moment before sending again.", variant: "destructive" });
      return;
    }

    const { name, email, message } = formData;
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    if (message.trim().length < 10) {
      toast({ title: "Message is too short", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("contact_messages")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: formData.subject.trim() || null,
          message: message.trim(),
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      lastSubmitRef.current = Date.now();
      setSubmitted(true);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
    } catch {
      // Table may not exist yet — open mailto as reliable fallback
      const mailto = `mailto:autodose.mm@gmail.com?subject=${encodeURIComponent(formData.subject || "Contact from website")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailto;
      lastSubmitRef.current = Date.now();
      setSubmitted(true);
      toast({ title: "Opening your email client…", description: "Your message is ready to send." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const contactItems = [
    { icon: Mail, label: "Email", value: "autodose.mm@gmail.com", href: "mailto:autodose.mm@gmail.com" },
    { icon: MapPin, label: "Location", value: "Yangon, Myanmar", href: "#" },
  ];

  const socials = [
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/autodose.mm/", color: "hover:text-pink-400 hover:border-pink-400/40" },
    { icon: Youtube,   label: "YouTube",   href: "https://www.youtube.com/@autodosemm", color: "hover:text-red-500 hover:border-red-500/40" },
    { icon: Facebook,  label: "Facebook",  href: "https://web.facebook.com/autodosemm/", color: "hover:text-blue-400 hover:border-blue-400/40" },
    { icon: Mail,      label: "Email",     href: "mailto:autodose.mm@gmail.com", color: "hover:text-primary hover:border-primary/40" },
  ];

  const inputCls = (field: string) =>
    `bg-background border transition-all duration-200 ${
      focused === field ? "border-primary ring-1 ring-primary/30" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-background font-inter">
      <SEO
        title="Contact AUTODOSE — Let's Work Together"
        description="Get in touch with AUTODOSE for JDM photography collaborations, video projects, or general inquiries."
      />
      <Navbar />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="pt-28 md:pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <motion.div
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden" animate="visible"
            className="text-center mb-12 md:mb-16"
          >
            <motion.span variants={fadeUp} custom={0}
              className="inline-block text-xs uppercase tracking-[0.3em] text-primary font-orbitron mb-4 px-4 py-1.5 border border-primary/30 rounded-full bg-primary/5"
            >
              Reach Out
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1}
              className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-bold text-foreground mb-5"
            >
              Let's <span className="text-primary">Connect</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2}
              className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
            >
              Have a collaboration idea, a shoot in mind, or just want to talk cars? We'd love to hear from you.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 md:gap-12">

            {/* Left — info (2 cols) */}
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden" animate="visible"
              className="lg:col-span-2 space-y-5"
            >
              {contactItems.map((item, i) => (
                <motion.a key={item.label} variants={fadeUp} custom={i}
                  href={item.href}
                  className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/60 transition-all duration-300 group hover:shadow-[0_4px_24px_hsla(var(--primary)/0.1)]"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <item.icon className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-semibold text-foreground text-sm md:text-base">{item.value}</p>
                  </div>
                </motion.a>
              ))}

              {/* Socials */}
              <motion.div variants={fadeUp} custom={2}
                className="bg-card border border-border rounded-xl p-5 md:p-6"
              >
                <h3 className="font-orbitron font-bold text-foreground mb-1 text-sm md:text-base">Follow the Journey</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-5 leading-relaxed">
                  Stay updated with the latest shoots, meets, and behind-the-scenes content.
                </p>
                <div className="flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <motion.a key={s.label} href={s.href} aria-label={s.label}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.92 }}
                      className={`w-11 h-11 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground transition-all duration-200 ${s.color}`}
                    >
                      <s.icon size={18} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Collab CTA */}
              <motion.div variants={fadeUp} custom={3}
                className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/25 rounded-xl p-5 md:p-6"
              >
                <h3 className="font-orbitron font-bold text-foreground mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span>🚗</span> Collab Opportunities
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  We're open to car meets, brand partnerships, photography commissions, and video projects. Let's make something legendary together.
                </p>
              </motion.div>
            </motion.div>

            {/* Right — form (3 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22,1,0.36,1] }}
              className="lg:col-span-3"
            >
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_8px_40px_hsla(0,0%,0%,0.08)]">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
                      className="text-center py-14"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle className="text-primary mx-auto mb-5" size={64} strokeWidth={1.5} />
                      </motion.div>
                      <h3 className="text-2xl font-orbitron font-bold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-8 text-sm">We'll get back to you as soon as possible.</p>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold press-effect"
                        onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                      >
                        Send Another
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h2 className="text-xl md:text-2xl font-orbitron font-bold text-foreground mb-6">Send a Message</h2>
                      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        {/* Honeypot — hidden from humans, bots fill it */}
                        <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true" tabIndex={-1}>
                          <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name *</Label>
                            <Input id="name" name="name" placeholder="Your name"
                              value={formData.name} onChange={handleChange}
                              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                              className={inputCls("name")} required />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email *</Label>
                            <Input id="email" name="email" type="email" placeholder="your@email.com"
                              value={formData.email} onChange={handleChange}
                              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                              className={inputCls("email")} required />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="subject" className="text-xs uppercase tracking-wider text-muted-foreground">Subject</Label>
                          <Input id="subject" name="subject" placeholder="What's this about?"
                            value={formData.subject} onChange={handleChange}
                            onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                            className={inputCls("subject")} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="message" className="text-xs uppercase tracking-wider text-muted-foreground">Message *</Label>
                          <Textarea id="message" name="message" placeholder="Tell us more..."
                            value={formData.message} onChange={handleChange}
                            onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                            className={`${inputCls("message")} min-h-[140px] resize-none`} required />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 gap-2 shadow-[0_0_20px_hsla(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsla(var(--primary)/0.5)] transition-all duration-300 press-effect"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <><Loader2 size={18} className="animate-spin" /> Sending…</>
                          ) : (
                            <><Send size={18} /> Send Message</>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
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
