"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  ReactNode,
  FC,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// ─── Asset imports ────────────────────────────────────────────────────────────
import autoLogo  from "@/assets/autodose.png";
import imgElite  from "@/assets/rx8.jpg";
import imgMotion from "@/assets/aristo.jpg";
import imgLife   from "@/assets/lifestyle.jpg";
import imgShop   from "@/assets/shop.png";

const AUTO_DOSE_LOGO = autoLogo;

// ─── Data ─────────────────────────────────────────────────────────────────────
type ServiceItem = {
  id: string;
  titleWhite: string;
  titleRed: string;
  description: string;
  image: string;
  route: string;
  isVlog?: true;
  comingSoon?: true;
};

const SERVICES: ServiceItem[] = [
  { id: "01", titleWhite: "ELITE",     titleRed: "CAPTURE",  description: "JDM & Supercar Photography. We hunt the best angles, the golden hour light, and the moments that make your build legendary.",    image: imgElite,  route: "/gallery" },
  { id: "02", titleWhite: "MOTION",    titleRed: "MASTERY",  description: "Cinematic Rolling Shots. High-speed, high-drama footage captured from moving vehicles for that pure automotive cinema feel.",       image: imgMotion, route: "/videos" },
  { id: "03", titleWhite: "LIFESTYLE", titleRed: "VLOGS",    description: "Weekly Car Culture Updates. Raw, unfiltered coverage of events, builds, and everything that drives the JDM community forward.",    image: imgLife,   isVlog: true, route: "/videos" },
  { id: "04", titleWhite: "AUTODOSE",  titleRed: "SHOP",     description: "Premium Car Parts — coming soon. Curated OEM+ and aftermarket components for enthusiasts who refuse to settle for ordinary.",         image: imgShop,   comingSoon: true, route: "/shop" },
];

// ─── Progressive Carousel Context ────────────────────────────────────────────
interface CarouselCtx {
  active: string;
  progress: number;
  handleClick: (value: string) => void;
}

const CarouselContext = createContext<CarouselCtx | undefined>(undefined);

const useCarousel = () => {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within CarouselProvider");
  return ctx;
};

// ─── Carousel Provider ────────────────────────────────────────────────────────
const CarouselProvider: FC<{
  children: ReactNode;
  initialActive: string;
  duration?: number;
  fastDuration?: number;
}> = ({ children, initialActive, duration = 5500, fastDuration = 380 }) => {
  const [active, setActive]       = useState(initialActive);
  const [progress, setProgress]   = useState(0);
  const [fastFwd, setFastFwd]     = useState(false);
  const frameRef    = useRef(0);
  const startRef    = useRef(performance.now());
  const targetRef   = useRef<string | null>(null);
  const progressRef = useRef(0);
  const values      = SERVICES.map((s) => s.id);

  useEffect(() => {
    const tick = (now: number) => {
      const cur = fastFwd ? fastDuration : duration;
      const elapsed = now - startRef.current;
      const frac = elapsed / cur;

      if (frac <= 1) {
        const p = fastFwd
          ? progressRef.current + (100 - progressRef.current) * frac
          : frac * 100;
        setProgress(p);
        frameRef.current = requestAnimationFrame(tick);
      } else {
        if (fastFwd) {
          setFastFwd(false);
          if (targetRef.current !== null) {
            setActive(targetRef.current);
            targetRef.current = null;
          }
        } else {
          const idx = values.indexOf(active);
          setActive(values[(idx + 1) % values.length]);
        }
        progressRef.current = 0;
        setProgress(0);
        startRef.current = performance.now();
      }
    };
    startRef.current = performance.now();
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, fastFwd, duration, fastDuration]);

  const handleClick = useCallback((value: string) => {
    if (value === active) return;
    progressRef.current = progress;
    targetRef.current = value;
    setFastFwd(true);
    startRef.current = performance.now();
  }, [active, progress]);

  return (
    <CarouselContext.Provider value={{ active, progress, handleClick }}>
      {children}
    </CarouselContext.Provider>
  );
};

// ─── Neural Noise WebGL background ───────────────────────────────────────────
const NeuralNoiseBg = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const mkShader = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(`precision mediump float;varying vec2 vUv;attribute vec2 a;void main(){vUv=.5*(a+1.);gl_Position=vec4(a,0,1);}`, gl.VERTEX_SHADER));
    gl.attachShader(prog, mkShader(`
      precision mediump float;varying vec2 vUv;
      uniform float uT,uR;uniform vec2 uP;uniform vec3 uC;
      vec2 rot(vec2 u,float t){return mat2(cos(t),sin(t),-sin(t),cos(t))*u;}
      float ns(vec2 u,float t,float p){vec2 s=vec2(0),r=vec2(0);float sc=8.;
        for(int j=0;j<15;j++){u=rot(u,1.);s=rot(s,1.);vec2 l=u*sc+float(j)+s-t;s+=sin(l)+2.4*p;r+=(0.5+0.5*cos(l))/sc;sc*=1.2;}
        return r.x+r.y;}
      void main(){vec2 u=.5*vUv;u.x*=uR;vec2 p=vUv-uP;p.x*=uR;
        float p2=clamp(length(p),0.,1.);p2=.5*pow(1.-p2,2.);
        float n=ns(u,0.0008*uT,p2);n=1.2*pow(n,3.);n+=pow(n,10.);
        n=max(0.,n-.5);n*=(1.-length(vUv-.5));gl_FragColor=vec4(uC*n,n);}
    `, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog); gl.useProgram(prog);

    const u: Record<string, WebGLUniformLocation | null> = {};
    for (let i = 0; i < (gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number); i++) {
      const n = gl.getActiveUniform(prog, i)!.name; u[n] = gl.getUniformLocation(prog, n);
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3f(u.uC, 0.86, 0.15, 0.15);

    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.offsetWidth; canvas.height = p.offsetHeight;
      gl.uniform1f(u.uR, canvas.width / canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e: PointerEvent) => { ptr.tx = e.clientX / window.innerWidth; ptr.ty = e.clientY / window.innerHeight; };
    window.addEventListener("pointermove", onMove);
    let raf: number;
    const loop = () => {
      ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
      gl.uniform1f(u.uT, performance.now()); gl.uniform2f(u.uP, ptr.x, 1 - ptr.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }} />;
});
NeuralNoiseBg.displayName = "NeuralNoiseBg";

// ─── CTA Button ───────────────────────────────────────────────────────────────
const EpicButton = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    setTimeout(() => { navigate("/contact"); window.scrollTo({ top: 0, behavior: "instant" }); }, 280);
  };

  return (
    <motion.button
      className="relative flex items-center gap-[10px] overflow-hidden border-none outline-none"
      style={{ padding: "14px 40px", background: "#dc2626", clipPath: "polygon(13px 0%,100% 0%,calc(100% - 13px) 100%,0% 100%)", cursor: "pointer" }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      animate={{ background: hovered ? "#b91c1c" : "#dc2626", boxShadow: hovered ? "0 0 0 1px rgba(220,38,38,0.4), 0 0 40px rgba(220,38,38,0.6)" : "0 0 20px rgba(220,38,38,0.35)" }}
      whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.965 }} transition={{ duration: 0.25 }}
    >
      {ripples.map(({ x, y, id }) => (
        <motion.span key={id} aria-hidden className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ left: x, top: y, x: "-50%", y: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.6 }} animate={{ width: 360, height: 360, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }} />
      ))}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="white" className="relative z-10 flex-shrink-0">
        <polygon points="1,1 9,5 1,9" />
      </svg>
      <span className="relative z-10 text-white font-black italic tracking-[.22em] uppercase text-[10px]"
        style={{ fontFamily: "'Orbitron', sans-serif" }}>
        LET'S CREATE SOMETHING EPIC
      </span>
    </motion.button>
  );
};

// ─── Active slide image panel ─────────────────────────────────────────────────
const SlideImage = () => {
  const { active } = useCarousel();
  const service = SERVICES.find((s) => s.id === active)!;

  return (
    <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: "16/9" }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={active}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={service.image}
            alt={`${service.titleWhite} ${service.titleRed}`}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.78) saturate(0.85)" }}
          />
          {/* Gradient overlay */}
          <div aria-hidden className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(6,6,6,.95) 0%, rgba(6,6,6,.3) 50%, transparent 100%)" }} />
          {/* Red accent line bottom */}
          <div aria-hidden className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(to right, #dc2626, #ef4444 40%, transparent)" }} />

          {/* Badge overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {service.isVlog && (
              <div className="flex items-center gap-1 bg-black/80 px-[7px] py-[3px] border border-white/10">
                <span className="w-[5px] h-[5px] rounded-full bg-red-600" style={{ animation: "adBlink 1.4s ease-in-out infinite" }} />
                <span className="text-[8px] font-bold text-white tracking-[.12em]">REC</span>
              </div>
            )}
            {service.comingSoon && (
              <div className="flex items-center gap-1"
                style={{ background: "#dc2626", padding: "3px 10px", clipPath: "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}>
                <span className="w-[4px] h-[4px] rounded-full bg-white flex-shrink-0" style={{ animation: "adBlink 1.4s ease-in-out infinite" }} />
                <span className="text-white font-black text-[7px] tracking-[.15em] uppercase">COMING SOON</span>
              </div>
            )}
          </div>

          {/* ID watermark */}
          <div className="absolute bottom-4 right-4 text-white/10 font-black italic"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1, userSelect: "none" }}>
            {service.id}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Active slide text ─────────────────────────────────────────────────────────
const SlideText = () => {
  const { active } = useCarousel();
  const navigate = useNavigate();
  const service = SERVICES.find((s) => s.id === active)!;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-3"
      >
        <p className="text-red-600 font-black text-[8px] tracking-[.35em]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}>{service.id}</p>
        <h3 className="font-black italic uppercase leading-tight"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(20px, 4vw, 30px)" }}>
          <span className="text-white">{service.titleWhite} </span>
          <span style={{ color: "#dc2626", textShadow: "0 0 18px rgba(220,38,38,0.55)" }}>{service.titleRed}</span>
        </h3>
        <p className="text-zinc-400 text-[11px] leading-[1.7] tracking-[.06em] max-w-sm">{service.description}</p>
        {!service.comingSoon && (
          <motion.button
            className="mt-1 flex items-center gap-2 self-start text-[9px] font-bold italic tracking-[.25em] uppercase text-red-500 border border-red-600/30 px-4 py-2 hover:bg-red-600/10 transition-colors"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.18 }}
            onClick={() => { navigate(service.route); window.scrollTo({ top: 0, behavior: "instant" }); }}
          >
            EXPLORE <ArrowRight size={10} />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Slider button ─────────────────────────────────────────────────────────────
const SliderBtn: FC<{ service: ServiceItem }> = ({ service }) => {
  const { active, progress, handleClick } = useCarousel();
  const isActive = active === service.id;

  return (
    <button
      className="relative text-left cursor-pointer px-4 py-3 border-b border-white/5 last:border-b-0 transition-colors overflow-hidden"
      style={{ background: isActive ? "rgba(220,38,38,0.07)" : "transparent" }}
      onClick={() => handleClick(service.id)}
    >
      {/* Progress bar background sweep */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        role="progressbar"
        aria-valuenow={isActive ? progress : 0}
      >
        <span
          className="absolute inset-y-0 left-0 block"
          style={{
            width: isActive ? `${progress}%` : "0%",
            background: "linear-gradient(to right, rgba(220,38,38,0.18), rgba(220,38,38,0.06))",
            transition: isActive ? "none" : "width 0.3s",
          }}
        />
      </div>

      {/* Left accent line */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        animate={{ background: isActive ? "#dc2626" : "rgba(220,38,38,0.15)", scaleY: isActive ? 1 : 0.4, opacity: isActive ? 1 : 0.4 }}
        transition={{ duration: 0.25 }}
      />

      <div className="flex items-start gap-3 pl-2">
        <span
          className="text-[7px] font-black tracking-[.2em] mt-[2px] flex-shrink-0"
          style={{ fontFamily: "'Orbitron', sans-serif", color: isActive ? "#dc2626" : "rgba(220,38,38,0.35)" }}>
          {service.id}
        </span>
        <div>
          <p
            className="font-black italic uppercase text-[9px] tracking-[.15em] leading-tight mb-[3px]"
            style={{ fontFamily: "'Orbitron', sans-serif", color: isActive ? "#fff" : "rgba(255,255,255,0.35)" }}>
            {service.titleWhite} <span style={{ color: isActive ? "#dc2626" : "rgba(220,38,38,0.35)" }}>{service.titleRed}</span>
          </p>
          <p className="text-[9px] tracking-[.05em] leading-snug line-clamp-1"
            style={{ color: isActive ? "rgba(161,161,170,1)" : "rgba(161,161,170,0.35)" }}>
            {service.description}
          </p>
        </div>
      </div>
    </button>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────
export default function OurServices() {
  return (
    <section className="relative w-full overflow-hidden text-white"
      style={{ background: "#060606", minHeight: "100vh" }}>

      {/* Backgrounds */}
      <div aria-hidden className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(80,10,10,0.55) 0%, #060606 70%)" }} />
      <NeuralNoiseBg />
      <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(220,38,38,0.07) 0%, transparent 68%)" }} />

      <div className="relative z-10 flex flex-col items-center px-5 sm:px-8 py-14 lg:py-20 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div className="flex items-center gap-3 mb-3"
          initial={{ opacity: 0, scaleX: 0.4 }} whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="w-8 h-px bg-red-600" />
          <span className="text-red-600 font-bold italic text-[9px] tracking-[.35em] uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}>AUTODOSE</span>
          <div className="w-8 h-px bg-red-600" />
        </motion.div>

        <motion.h2 className="font-black italic uppercase text-center leading-none mb-2"
          style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(26px, 5vw, 42px)", letterSpacing: ".05em" }}
          initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }}>
          <span className="text-white">OUR </span>
          <span style={{ color: "#dc2626", textShadow: "0 0 24px rgba(220,38,38,0.45)" }}>SERVICES</span>
        </motion.h2>

        <motion.p className="text-zinc-500 text-[10px] tracking-[.2em] uppercase mb-10 text-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
          Built for car enthusiasts. Driven by passion.
        </motion.p>

        {/* Carousel */}
        <CarouselProvider initialActive="01" duration={5500}>
          <motion.div
            className="w-full flex flex-col lg:flex-row gap-0"
            style={{ border: "1px solid rgba(220,38,38,0.15)", background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Left: image + text */}
            <div className="flex flex-col flex-1 min-w-0">
              <SlideImage />
              <div className="px-6 py-5 flex flex-col gap-4 flex-1">
                <SlideText />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px self-stretch" style={{ background: "rgba(220,38,38,0.12)" }} />
            <div className="block lg:hidden h-px w-full" style={{ background: "rgba(220,38,38,0.12)" }} />

            {/* Right: slider buttons */}
            <div className="lg:w-[260px] xl:w-[300px] flex-shrink-0 flex flex-col">
              {/* Logo header */}
              <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(220,38,38,0.12)" }}>
                <img
                  src={AUTO_DOSE_LOGO}
                  alt="AutoDose"
                  className="w-8 h-8 object-contain"
                  style={{ mixBlendMode: "screen", filter: "drop-shadow(0 0 8px rgba(220,38,38,0.7))" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <span className="text-white/40 font-black italic text-[8px] tracking-[.3em] uppercase"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>SERVICES</span>
              </div>
              {/* Buttons */}
              <div className="flex flex-col flex-1">
                {SERVICES.map((service) => (
                  <SliderBtn key={service.id} service={service} />
                ))}
              </div>
            </div>
          </motion.div>
        </CarouselProvider>

        {/* CTA */}
        <div className="mt-10">
          <EpicButton />
        </div>
      </div>

      <style>{`
        @keyframes adBlink { 0%,100% { opacity:1; } 50% { opacity:0.12; } }
      `}</style>
    </section>
  );
}