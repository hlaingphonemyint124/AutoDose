"use client";
import React, {
  useEffect, useRef, useState, memo, useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// ─── Asset imports (Vite hashes these at build — string paths 404 in prod) ───
import autoLogo  from "@/assets/autodose.png";
import imgElite  from "@/assets/rx8.jpg";
import imgMotion from "@/assets/aristo.jpg";
import imgLife   from "@/assets/lifestyle.jpg";
import imgShop   from "@/assets/shop.png";

const AUTO_DOSE_LOGO = autoLogo;
const IMAGES = { elite: imgElite, motion: imgMotion, lifestyle: imgLife, shop: imgShop } as const;

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
  { id: "01", titleWhite: "ELITE",     titleRed: "CAPTURE",  description: "JDM & Supercar Photography",    image: IMAGES.elite,     route: "/gallery" },
  { id: "02", titleWhite: "MOTION",    titleRed: "MASTERY",  description: "Cinematic Rolling Shots",       image: IMAGES.motion,    route: "/videos" },
  { id: "03", titleWhite: "LIFESTYLE", titleRed: "VLOGS",    description: "Weekly Car Culture Updates",    image: IMAGES.lifestyle, isVlog: true, route: "/videos" },
  { id: "04", titleWhite: "AUTODOSE",  titleRed: "SHOP",     description: "Premium Car Parts",            image: IMAGES.shop, comingSoon: true, route: "/shop" },
];

const PHASES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
const SPEED  = 0.28;
const BASE_R = 210;

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
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(`precision mediump float;varying vec2 vUv;attribute vec2 a;void main(){vUv=.5*(a+1.);gl_Position=vec4(a,0,1);}`, gl.VERTEX_SHADER));
    gl.attachShader(prog, mkShader(`
      precision mediump float;
      varying vec2 vUv;
      uniform float uT,uR;uniform vec2 uP;uniform vec3 uC;
      vec2 rot(vec2 u,float t){return mat2(cos(t),sin(t),-sin(t),cos(t))*u;}
      float ns(vec2 u,float t,float p){
        vec2 s=vec2(0),r=vec2(0);float sc=8.;
        for(int j=0;j<15;j++){u=rot(u,1.);s=rot(s,1.);vec2 l=u*sc+float(j)+s-t;s+=sin(l)+2.4*p;r+=(0.5+0.5*cos(l))/sc;sc*=1.2;}
        return r.x+r.y;
      }
      void main(){
        vec2 u=.5*vUv;u.x*=uR;vec2 p=vUv-uP;p.x*=uR;
        float p2=clamp(length(p),0.,1.);p2=.5*pow(1.-p2,2.);
        float n=ns(u,0.0008*uT,p2);n=1.2*pow(n,3.);n+=pow(n,10.);
        n=max(0.,n-.5);n*=(1.-length(vUv-.5));
        gl_FragColor=vec4(uC*n,n);
      }
    `, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const u: Record<string, WebGLUniformLocation | null> = {};
    for (let i = 0; i < (gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number); i++) {
      const n = gl.getActiveUniform(prog, i)!.name;
      u[n] = gl.getUniformLocation(prog, n);
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(al);
    gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
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
      gl.uniform1f(u.uT, performance.now());
      gl.uniform2f(u.uP, ptr.x, 1 - ptr.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.72 }} />;
});
NeuralNoiseBg.displayName = "NeuralNoiseBg";

// ─── Corner brackets ──────────────────────────────────────────────────────────
const CORNERS = [
  { cls: "top-0 left-0",     d: "M0 8V0h8" },
  { cls: "top-0 right-0",    d: "M10 8V0H2" },
  { cls: "bottom-0 left-0",  d: "M0 2v8h8" },
  { cls: "bottom-0 right-0", d: "M10 2v8H2" },
];
const CornerBrackets = ({ hovered }: { hovered: boolean }) => (
  <>{CORNERS.map(({ cls, d }, i) => (
    <span key={i} className={`absolute ${cls} w-[10px] h-[10px] pointer-events-none`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d={d} stroke={hovered ? "#dc2626" : "rgba(220,38,38,0.28)"} strokeWidth="2" style={{ transition: "stroke 0.25s" }} />
      </svg>
    </span>
  ))}</>
);

// ─── Glow sweep border ────────────────────────────────────────────────────────
const CardBorder = ({ hovered }: { hovered: boolean }) => (
  <>
    <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20"
      animate={{ boxShadow: hovered ? "0 0 0 1px #dc2626, 0 8px 32px rgba(220,38,38,0.22)" : "0 0 0 1px rgba(220,38,38,0.2)" }}
      transition={{ duration: 0.25 }} />
    <AnimatePresence>
      {hovered && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 z-30 h-px"
          style={{ background: "linear-gradient(to right, transparent, #dc2626 50%, transparent)" }}
          initial={{ top: "0%", opacity: 0 }} animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: "linear" }} />
      )}
    </AnimatePresence>
    <motion.div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[2px] z-30"
      style={{ background: "linear-gradient(to right, #dc2626, #ef4444, transparent)" }}
      animate={{ width: hovered ? "100%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />
  </>
);

// ─── Service card ─────────────────────────────────────────────────────────────
// KEY CHANGE: removed x/y props, accepts cardRef for direct DOM positioning
const ServiceCard = memo(({ service, cardRef }: {
  service: ServiceItem;
  cardRef: (el: HTMLDivElement | null) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    if (service.comingSoon) return;
    setTimeout(() => { navigate(service.route); window.scrollTo({ top: 0, behavior: "instant" }); }, 220);
  }, [service, navigate]);

  return (
    // This div's transform is now mutated directly by the rAF loop — zero React renders
    <div
      ref={cardRef}
      className="absolute top-1/2 left-1/2 w-[172px]"
      style={{
        transform: "translate3d(-50%, -50%, 0)",
        zIndex: hovered ? 30 : 10,
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      tabIndex={service.comingSoon ? -1 : 0}
      role="button"
      aria-label={`${service.titleWhite} ${service.titleRed} — ${service.description}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <motion.div
        className="relative w-[172px] overflow-hidden"
        style={{ background: "rgba(10,10,10,0.96)", cursor: service.comingSoon ? "default" : "pointer", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={onClick}
        whileTap={service.comingSoon ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <CardBorder hovered={hovered} />
        <CornerBrackets hovered={hovered} />

        {/* Image — 16:9 */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <motion.img
            src={service.image}
            alt={`${service.titleWhite} ${service.titleRed}`}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.72) saturate(0.82)" }}
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.opacity = "0";
            }}
          />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,6,.92) 0%, rgba(6,6,6,.25) 55%, transparent 100%)" }} />
          {service.isVlog && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/80 px-[7px] py-[3px] border border-white/10">
              <span className="w-[5px] h-[5px] rounded-full bg-red-600" style={{ animation: "adBlink 1.4s ease-in-out infinite" }} />
              <span className="text-[8px] font-bold text-white tracking-[.12em]">REC</span>
            </div>
          )}
          {service.comingSoon && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1"
              style={{ background: "#dc2626", padding: "3px 8px", clipPath: "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}>
              <span className="w-[4px] h-[4px] rounded-full bg-white flex-shrink-0" style={{ animation: "adBlink 1.4s ease-in-out infinite" }} />
              <span className="text-white font-black text-[7px] tracking-[.15em] uppercase">COMING SOON</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-3 pt-[10px] pb-1">
          <motion.p className="text-red-600 font-black text-[8px] tracking-[.3em] mb-[5px]"
            style={{ fontFamily: "'Orbitron', sans-serif" }} animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2 }}>
            {service.id}
          </motion.p>
          <motion.h3 className="font-black italic uppercase leading-tight text-white mb-[5px]"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "11.5px" }} animate={{ x: hovered ? 2 : 0 }} transition={{ duration: 0.2 }}>
            {service.titleWhite}{" "}
            <motion.span style={{ color: "#dc2626" }}
              animate={{ textShadow: hovered ? "0 0 14px rgba(220,38,38,0.9)" : "0 0 0px rgba(220,38,38,0)" }}>
              {service.titleRed}
            </motion.span>
          </motion.h3>
          <p className="text-[9.5px] text-zinc-500 uppercase tracking-[.1em] leading-[1.5]">{service.description}</p>
        </div>

        {/* Footer */}
        <div className="px-3 pb-[10px] pt-[6px] flex justify-end">
          {!service.comingSoon && (
            <motion.div className="w-[22px] h-[22px] flex items-center justify-center"
              style={{ border: "1px solid rgba(220,38,38,0.3)" }}
              animate={{ borderColor: hovered ? "#dc2626" : "rgba(220,38,38,0.3)", background: hovered ? "rgba(220,38,38,0.14)" : "transparent" }}
              transition={{ duration: 0.2 }}>
              <ArrowRight size={10} className="text-red-600" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
});
ServiceCard.displayName = "ServiceCard";

// ─── Orbit ring ───────────────────────────────────────────────────────────────
const OrbitRing = ({ radius, delay = 0 }: { radius: number; delay?: number }) => (
  <div aria-hidden className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
    style={{ width: radius * 2, height: radius * 2, transform: "translate(-50%,-50%)",
      border: "1px solid rgba(220,38,38,0.18)", animation: `adRingPulse 5s ease-in-out ${delay}s infinite` }} />
);

// ─── CTA button ───────────────────────────────────────────────────────────────
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
      className="relative mt-10 flex items-center gap-[10px] overflow-hidden border-none outline-none"
      style={{ padding: "14px 40px", background: "#dc2626", clipPath: "polygon(13px 0%,100% 0%,calc(100% - 13px) 100%,0% 100%)", cursor: "pointer" }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      animate={{ background: hovered ? "#b91c1c" : "#dc2626",
        boxShadow: hovered ? "0 0 0 1px rgba(220,38,38,0.4), 0 0 40px rgba(220,38,38,0.6)" : "0 0 20px rgba(220,38,38,0.35)" }}
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

// ─── Main section ─────────────────────────────────────────────────────────────
export default function OurServices() {
  // ✅ FIX: time & paused moved from useState → useRef
  // This means the animation loop NEVER triggers a React re-render
  const timeRef   = useRef(0);
  const pausedRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);

  // One ref slot per card — populated by the cardRef callback on each ServiceCard
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);

  const stageRef  = useRef<HTMLDivElement>(null);
  const [orbitR,  setOrbitR] = useState(BASE_R);

  // Responsive orbit radius
  useEffect(() => {
    const calc = () => {
      const vw = Math.min(window.innerWidth, 680);
      setOrbitR(Math.min(BASE_R, vw * 0.32));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // ✅ FIX: Animation loop — pure DOM mutation, zero React renders per frame
  // Skips React reconciler entirely → no virtual DOM diff → no jank
  useEffect(() => {
    let raf: number;

    const tick = (ts: number) => {
      if (lastTsRef.current !== null && !pausedRef.current) {
        timeRef.current += (ts - lastTsRef.current) / 1000;
      }
      lastTsRef.current = ts;

      const t = timeRef.current;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const angle = t * SPEED + PHASES[i];
        const x = Math.cos(angle) * orbitR;
        const y = Math.sin(angle) * orbitR;
        // Direct style mutation — bypasses React, goes straight to browser compositor
        el.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [orbitR]); // re-bind only when radius changes (responsive resize)

  const stageSz = orbitR * 2 + 320;

  return (
    <section className="relative w-full overflow-hidden text-white"
      style={{ background: "#060606", minHeight: "100vh" }}>

      {/* WebGL — CSS gradient fallback if WebGL unavailable */}
      <div aria-hidden className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(80,10,10,0.55) 0%, #060606 70%)" }} />
      <NeuralNoiseBg />

      <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(220,38,38,0.07) 0%, transparent 68%)" }} />

      <div className="relative z-10 flex flex-col items-center px-5 sm:px-8 py-14 lg:py-20 max-w-3xl mx-auto">

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

        {/* Orbit stage */}
        <div
          ref={stageRef}
          className="relative flex-shrink-0"
          style={{ width: stageSz, height: stageSz, maxWidth: "100%" }}
          // ✅ FIX: pausedRef.current = true/false — no state, no re-render
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          <OrbitRing radius={orbitR} delay={0} />
          <OrbitRing radius={orbitR * 1.12} delay={2} />

          {/* Center hub — circular, no black bg */}
<div style={{
  position: "absolute", top: "50%", left: "50%",
  transform: "translate(-50%,-50%)",
  width: orbitR * 0.68, height: orbitR * 0.68,
  borderRadius: "50%",
  zIndex: 20,
  animation: "adHubPulse 3.5s ease-in-out infinite",
  overflow: "hidden",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "transparent",
}}>
  <img
    src={AUTO_DOSE_LOGO}
    alt="AutoDose"
    style={{
      width: "130%",
      height: "130%",
      objectFit: "cover",
      objectPosition: "center",
      mixBlendMode: "screen",
      filter: "drop-shadow(0 0 20px rgba(220,38,38,0.9)) brightness(1.15)",
    }}
    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
  />
</div>

          {/* ✅ FIX: Cards receive a ref callback instead of x/y props
              The rAF loop writes transform directly to the DOM node */}
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              cardRef={(el) => { cardRefs.current[i] = el; }}
            />
          ))}
        </div>

        <EpicButton />
      </div>

      <style>{`
        @keyframes adHubPulse {
          0%,100% { filter: drop-shadow(0 0 8px rgba(220,38,38,0.25)); }
          50%      { filter: drop-shadow(0 0 28px rgba(220,38,38,0.65)) drop-shadow(0 0 6px rgba(220,38,38,0.4)); }
        }
        @keyframes adRingPulse {
          0%,100% { box-shadow: 0 0 28px rgba(220,38,38,0.06), inset 0 0 28px rgba(220,38,38,0.03); }
          50%      { box-shadow: 0 0 60px rgba(220,38,38,0.16), inset 0 0 50px rgba(220,38,38,0.08); }
        }
        @keyframes adBlink { 0%,100% { opacity:1; } 50% { opacity:0.12; } }
      `}</style>
    </section>
  );
}