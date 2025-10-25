import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

const LifestyleSection = () => {
  const posts = [
    {
      title: "The Art of JDM Culture",
      excerpt: "Exploring the passion and dedication behind Japan's automotive scene",
      date: "March 15, 2024",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=500&fit=crop",
    },
    {
      title: "Tokyo Nights: Street Racing Legacy",
      excerpt: "A deep dive into the underground racing culture that shaped a generation",
      date: "March 10, 2024",
      image: "https://images.unsplash.com/photo-1551653246-d9d0023e8446?w=800&h=500&fit=crop",
    },
    {
      title: "Behind the Lens: Automotive Photography",
      excerpt: "Tips and techniques for capturing the perfect car shot",
      date: "March 5, 2024",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop",
    },
  ];

  return (
    <section id="lifestyle" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="text-primary">LIFESTYLE</span> JOURNAL
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto">
            Stories, insights, and inspiration from the JDM world
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border overflow-hidden group cursor-pointer hover:shadow-glow transition-all duration-300 h-full">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter mb-3">
                      <Calendar size={16} />
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-orbitron font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground font-inter mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-inter font-semibold group-hover:gap-4 transition-all">
                      Read More <ArrowRight size={18} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
