import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera, Aperture, Play, ShoppingCart, ArrowRight, Battery } from "lucide-react";

const IMAGES = {
  elite: "src/assets/rx8.jpg",
  motion: "src/assets/aristo.jpg",
  lifestyle: "src/assets/lifestyle.jpg",
  shop: "src/assets/shop.png",
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
    route: "/gallery",
  },
  {
    id: "02",
    titleWhite: "MOTION",
    titleRed: "MASTERY",
    description: "CINEMATIC ROLLING SHOTS THAT BRING SPEED TO LIFE",
    icon: Aperture,
    tagline: "MOVEMENT. ENERGY. IMPACT.",
    image: IMAGES.motion,
    route: "/videos",
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
    route: "/videos",
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
    route: "/shop",
  },
];

/* ── Animated glow border ── */
const GlowBorder = ({ isHovered }) => (
  <>
    {/* Outer glow ring */}
    <motion.div
      className="pointer-events-none absolute inset-0 z-20"
      animate={{
        boxShadow: isHovered
          ? "0 0 0 1.5px #dc2626, 0 0 20px 3px rgba(220,38,38,0.5), 0 0 50px 8px rgba(220,38,38,0.18)"
          : "0 0 0 1px rgba(220,38,38,0.18)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />

    {/* SVG corner brackets */}
    {[
      { cls: "top-0 left-0", d: "M0 16 L0 0 L16 0" },
      { cls: "top-0 right-0", d: "M16 16 L16 0 L0 0" },
      { cls: "bottom-0 left-0", d: "M0 0 L0 16 L16 16" },
      { cls: "bottom-0 right-0", d: "M16 0 L16 16 L0 16" },
    ].map(({ cls, d }, i) => (
      <motion.span
        key={i}
        className={`pointer-events-none absolute z-30 ${cls}`}
        animate={{ opacity: isHovered ? 1 : 0.25, scale: isHovered ? 1 : 0.85 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d={d} stroke="#dc2626" strokeWidth="2.5" />
        </svg>
      </motion.span>
    ))}

    {/* Scan line sweep */}
    <AnimatePresence>
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-30 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: "linear" }}
        />
      )}
    </AnimatePresence>

    {/* Bottom red line reveal */}
    <motion.div
      className="pointer-events-none absolute bottom-0 left-0 h-[2px] z-30"
      style={{ background: "linear-gradient(to right, #dc2626, #ef4444, transparent)" }}
      animate={{ width: isHovered ? "100%" : "0%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    />
  </>
);

/* ── Service Card ── */
const ServiceCard = ({ service, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (service.comingSoon) return;
    setTimeout(() => navigate(service.route), 250);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.96 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.12 },
        },
      }}
      className="relative overflow-hidden w-full"
      style={{
        background: "#060606",
        cursor: service.comingSoon ? "default" : "pointer",
        aspectRatio: "16 / 9",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      whileTap={!service.comingSoon ? { scale: 0.975 } : {}}
    >
      <GlowBorder isHovered={isHovered} />

      {/* ── Background image ── */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={service.image}
          alt=""
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Strong gradient — bottom 60% black so text is always readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        {/* Left vignette for ID/title area */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          }}
        />
        {/* Red tint on hover */}
        <motion.div
          className="absolute inset-0 bg-red-950/15"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* ── COMING SOON ribbon ── */}
      {service.comingSoon && (
        <div
          className="absolute top-5 -right-10 z-40 w-40 rotate-45 py-1 text-center text-[8px] font-black tracking-[0.25em] text-white uppercase"
          style={{ background: "#dc2626", boxShadow: "0 0 14px rgba(220,38,38,0.6)" }}
        >
          COMING SOON
        </div>
      )}

      {/* ── REC badge ── */}
      {service.isVlog && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 font-mono text-[9px] font-bold text-white bg-black/80 px-2 py-1 border border-white/10">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.3, repeat: Infinity }}
          />
          REC
        </div>
      )}

      {/* ── Top-right: number tag ── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
        {!service.isVlog && !service.comingSoon && (
          <motion.span
            className="font-mono text-[10px] font-bold text-white/30 tracking-widest"
            animate={{ opacity: isHovered ? 0.7 : 0.3 }}
          >
            {service.id}
          </motion.span>
        )}
      </div>

      {/* ── Card content — anchored to bottom ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 md:p-6">

        {/* ID tag */}
        <motion.div
          className="flex items-center gap-2 mb-2.5"
          animate={{ x: isHovered ? 3 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span
            className="text-red-600 font-black text-[10px] tracking-[0.3em]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {service.id}
          </span>
          <motion.div
            className="h-px bg-red-600/50"
            animate={{ width: isHovered ? 24 : 12 }}
            transition={{ duration: 0.35 }}
          />
        </motion.div>

        {/* Title — readable size, not oversized */}
        <motion.h3
          className="font-black italic uppercase leading-none mb-2 tracking-wide"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(1.05rem, 2.2vw, 1.45rem)",
          }}
          animate={{ x: isHovered ? 3 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
            {service.titleWhite}{" "}
          </span>
          <motion.span
            style={{ color: "#dc2626" }}
            animate={{
              textShadow: isHovered
                ? "0 0 14px rgba(220,38,38,0.9), 0 0 30px rgba(220,38,38,0.45)"
                : "0 0 0px rgba(220,38,38,0)",
            }}
            transition={{ duration: 0.4 }}
          >
            {service.titleRed}
          </motion.span>
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-zinc-400 uppercase leading-relaxed mb-4"
          style={{ fontSize: "clamp(0.6rem, 1vw, 0.7rem)", letterSpacing: "0.18em" }}
          animate={{ opacity: isHovered ? 1 : 0.6, x: isHovered ? 3 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {service.description}
        </motion.p>

        {/* Bottom bar: icon + tagline + action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="p-1.5 bg-black/90 text-red-600 border"
              animate={{
                borderColor: isHovered ? "rgba(220,38,38,0.8)" : "rgba(220,38,38,0.22)",
                boxShadow: isHovered ? "0 0 10px rgba(220,38,38,0.4)" : "none",
              }}
              transition={{ duration: 0.3 }}
            >
              <service.icon size={12} strokeWidth={2.5} />
            </motion.div>
            <span
              className="text-zinc-500 font-semibold uppercase tracking-[0.18em]"
              style={{ fontSize: "clamp(0.55rem, 0.9vw, 0.65rem)" }}
            >
              {service.tagline}
            </span>
          </div>

          {service.isVlog ? (
            <div className="flex items-center gap-2 text-zinc-400 font-mono" style={{ fontSize: "0.6rem" }}>
              <span className="tracking-wider">00:00:12:07</span>
              <Battery size={13} className="text-white/60" strokeWidth={1.5} />
            </div>
          ) : (
            <motion.div
              animate={{ x: isHovered ? 5 : 0, color: isHovered ? "#ef4444" : "rgba(255,255,255,0.7)" }}
              transition={{ duration: 0.25 }}
            >
              <ArrowRight size={16} strokeWidth={2} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Hover: subtle red gradient wash from bottom */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 h-1/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(220,38,38,0.08), transparent)" }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};

/* ── CTA Button ── */
const EpicButton = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    setTimeout(() => navigate("/contact"), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-12 flex justify-center"
    >
      <motion.button
        className="relative flex items-center justify-center gap-3 overflow-hidden px-10 py-3.5"
        style={{
          background: "#dc2626",
          clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
          cursor: "pointer",
          border: "none",
          outline: "none",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          background: isHovered ? "#b91c1c" : "#dc2626",
          boxShadow: isHovered
            ? "0 0 30px rgba(220,38,38,0.7), 0 0 70px rgba(220,38,38,0.25)"
            : "0 0 0px rgba(220,38,38,0)",
        }}
        transition={{ duration: 0.3 }}
      >
        {ripples.map((rp) => (
          <motion.span
            key={rp.id}
            className="absolute rounded-full bg-white/25 pointer-events-none"
            style={{ left: rp.x, top: rp.y, x: "-50%", y: "-50%" }}
            initial={{ width: 0, height: 0, opacity: 0.7 }}
            animate={{ width: 340, height: 340, opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        ))}

        <motion.span
          className="relative z-10 text-white"
          animate={{ x: isHovered ? -1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="white">
            <polygon points="2,1 11,6 2,11" />
          </svg>
        </motion.span>

        <span
          className="relative z-10 text-white font-black italic tracking-[0.2em] uppercase text-[11px] md:text-xs"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          LET'S CREATE SOMETHING EPIC
        </span>
      </motion.button>
    </motion.div>
  );
};

/* ── Main Section ── */
const OurServices = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      className="relative w-full overflow-hidden py-20 lg:py-28 text-white"
      style={{ background: "#0a0a0a" }}
    >
      {/* Top red ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 z-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 0%, rgba(220,38,38,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-5 sm:px-8 max-w-6xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-14 space-y-4"
        >
          {/* Eyebrow — matches site style exactly */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, scaleX: 0.5 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-8 h-px bg-red-600" />
            <span
              className="text-red-600 font-bold italic text-[10px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              AUTODOSE
            </span>
            <div className="w-8 h-px bg-red-600" />
          </motion.div>

          {/* Main heading */}
          <h2
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-black italic tracking-wide uppercase leading-none text-center"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <motion.span
              className="text-white"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              OUR{" "}
            </motion.span>
            <motion.span
              style={{ color: "#dc2626", textShadow: "0 0 28px rgba(220,38,38,0.45)" }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              SERVICES
            </motion.span>
          </h2>

          <motion.p
            className="text-zinc-500 text-[9px] tracking-[0.3em] uppercase text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Built for car enthusiasts. Driven by passion.
          </motion.p>
        </motion.div>

        {/* ── Services Grid ── */}
        <motion.div
          ref={ref}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4"
        >
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <EpicButton />
      </div>
    </section>
  );
};

export default OurServices;