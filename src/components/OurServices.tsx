import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Camera, 
  Aperture, 
  Play, 
  ShoppingCart, 
  ArrowRight, 
  Battery 
} from "lucide-react";

// Using clean, high-resolution automotive placeholders to maintain maximum sharpness
const IMAGES = {
  elite: "src/assets/rx8.jpg",
  motion: "src/assets/aristo.jpg",
  lifestyle: "src/assets/lifestyle.jpg",
  shop: "src/assets/shop.png"
};

const services = [
  {
    id: "01",
    titleWhite: "ELITE",
    titleRed: "CAPTURE",
    description: "JDM AND SUPERCAR PHOTOGRAPHY",
    icon: Camera,
    tagline: "PRECISION. LIGHT. PERFORMANCE.",
    image: IMAGES.elite,
  },
  {
    id: "02",
    titleWhite: "MOTION",
    titleRed: "MASTERY",
    description: "CINEMATIC ROLLING SHOTS THAT BRING SPEED TO LIFE",
    icon: Aperture,
    tagline: "MOVEMENT. ENERGY. IMPACT.",
    image: IMAGES.motion,
  },
  {
    id: "03",
    titleWhite: "LIFESTYLE",
    titleRed: "VLOGS",
    description: "WEEKLY CAR CULTURE UPDATES & BEHIND THE SCENES",
    icon: Play,
    tagline: "REAL PEOPLE. REAL CARS. REAL STORIES.",
    image: IMAGES.lifestyle,
    isVlog: true,
  },
  {
    id: "04",
    titleWhite: "AUTODOSE",
    titleRed: "SHOP",
    description: "PREMIUM CAR PARTS. CURATED FOR PERFORMANCE.",
    icon: ShoppingCart,
    tagline: "UPGRADE. CUSTOMIZE. DOMINATE.",
    image: IMAGES.shop,
    comingSoon: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const OurServices = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full overflow-hidden bg-black py-16 lg:py-24 font-sans text-white">
      <div className="container relative mx-auto px-4 sm:px-6 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-12 space-y-3">
          <div className="flex items-center gap-3 text-red-600 font-bold italic tracking-widest text-xs md:text-sm">
            <span>///</span>
            <span>AUTODOSE</span>
            <span>///</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-wide uppercase font-orbitron">
            OUR <span className="text-red-600">SERVICES</span>
          </h2>
          
          <p className="text-gray-400 text-[10px] md:text-xs tracking-[0.25em] uppercase text-center">
            Built for car enthusiasts. Driven by passion.
          </p>
        </div>

        {/* Services Grid with controlled max width and height properties */}
        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group relative flex flex-col justify-between overflow-hidden border border-zinc-900 bg-zinc-950 aspect-[16/10.5] w-full transition-colors duration-300 hover:border-red-600/40 cursor-pointer"
            >
              {/* Sharp Background Image (No blur, no uniform low opacity) */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={service.image} 
                  alt={`${service.titleWhite} ${service.titleRed}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                />
                {/* Tailored Linear Vignettes to ensure text legibility while keeping the car 100% sharp */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent opacity-90" />
              </div>

              {/* Top Card Metrics & UI Overlays */}
              {service.comingSoon && (
                <div className="absolute top-4 -right-12 z-20 w-44 rotate-45 bg-red-600 py-1 text-center text-[9px] font-black tracking-widest text-white uppercase">
                  COMING SOON
                </div>
              )}
              
              {service.isVlog && (
                <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 font-mono text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 border border-white/10 rounded-sm">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-pulse" />
                  REC
                </div>
              )}

              {/* Main Info Layer */}
              <div className="relative z-10 p-6 md:p-8 flex-grow">
                <div className="text-red-600 font-bold text-xs md:text-sm mb-4 font-orbitron">
                  {service.id}
                </div>

                {/* Framing Bracket Effect for the Vlog card specifically */}
                <div className="relative inline-block">
                  {service.isVlog && (
                    <div className="absolute -top-2 -left-2 w-3 h-3 border-t border-l border-white/40" />
                  )}
                  <h3 className="text-2xl md:text-3xl font-black italic tracking-wide uppercase font-orbitron leading-none mb-3">
                    <span className="text-white">{service.titleWhite}</span>{" "}
                    <span className="text-red-600">{service.titleRed}</span>
                  </h3>
                </div>

                <p className="text-gray-300 text-[11px] md:text-xs tracking-wider max-w-xs uppercase leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>

              {/* Bottom Card Action Layer */}
              <div className="relative z-10 p-6 md:p-8 pt-0 flex items-end justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 border border-red-600/30 bg-black/70 text-red-600">
                    <service.icon size={15} strokeWidth={2.5} />
                  </div>
                  <span className="text-[9px] md:text-[10px] text-zinc-400 tracking-widest font-semibold uppercase">
                    {service.tagline}
                  </span>
                </div>

                {/* Specialized Right Indicators */}
                <div className="flex items-center text-white">
                  {service.isVlog ? (
                    <div className="flex items-center gap-3 text-zinc-400 font-mono text-[10px]">
                      <span className="tracking-wider">00:00:12:07</span>
                      <Battery size={16} className="text-white" strokeWidth={1.5} />
                    </div>
                  ) : (
                    <ArrowRight size={18} className="transform transition-transform group-hover:translate-x-1 text-white group-hover:text-red-500" />
                  )}
                </div>
              </div>

              {/* Bottom Right Bracket Complement */}
              {service.isVlog && (
                <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-white/40 z-10 pointer-events-none hidden md:block" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Lower Call To Action */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <button className="group relative flex items-center justify-center px-10 py-3.5 bg-transparent transition-all">
            <div className="absolute inset-0 w-full h-full border border-red-600/40 group-hover:border-red-600/80 transition-colors" style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }} />
            <div className="absolute left-0 top-0 w-1.5 h-full bg-red-600 -skew-x-[12deg]" />
            <div className="absolute right-0 top-0 w-1.5 h-full bg-red-600 -skew-x-[12deg]" />
            <span className="relative z-10 text-white font-bold tracking-[0.25em] uppercase text-xs">
              Let's Create Something Epic
            </span>
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default OurServices;