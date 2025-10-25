import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background font-inter">
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
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold text-foreground mb-4">
              Get In <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or want to work together? Drop us a message and we'll get back to you soon.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-8 shadow-glow"
            >
              <h2 className="text-2xl font-orbitron font-bold text-foreground mb-6">
                Send Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="bg-background border-border resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-inter font-semibold shadow-glow"
                >
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-foreground mb-6">
                  Contact Info
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
                    <Mail className="text-primary mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <p className="text-muted-foreground">autodose.mm@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
                    <Phone className="text-primary mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <p className="text-muted-foreground">(+95)943031170</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
                    <MapPin className="text-primary mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-muted-foreground">
                        Yangon,Myanmar
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-8">
                <h3 className="text-xl font-orbitron font-bold text-foreground mb-4">
                  Follow Us
                </h3>
                <p className="text-muted-foreground mb-4">
                  Stay connected with the latest JDM content and updates.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/autodose.mm/"
                    className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    📷
                  </a>
                  <a
                    href="https://www.youtube.com/@autodosemm"
                    className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
                  >
                    <span className="sr-only">YouTube</span>
                    ▶️
                  </a>
                  <a
                    href="https://web.facebook.com/autodosemm"
                    className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    🌐
                  </a>
                </div>
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
