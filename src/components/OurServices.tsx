"use client";
import React, { useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// ─── Asset paths (Vite static imports) ───────────────────────────────────────
const autoDoseLogo = "/src/assets/autodose.png";

const IMAGES = {
  elite:     "/src/assets/rx8.jpg",
  motion:    "/src/assets/aristo.jpg",
  lifestyle: "/src/assets/lifestyle.jpg",
  shop:      "/src/assets/shop.png",
};

// ─── Services data ────────────────────────────────────────────────────────────
const services = [
  {
    id: "01", titleWhite: "ELITE",     titleRed: "CAPTURE",
    description: "JDM AND SUPERCAR PHOTOGRAPHY",
    tagline: "PRECISION. LIGHT. PERFORMANCE.",
    image: IMAGES.elite,     route: "/gallery",
  },
  {
    id: "02", titleWhite: "MOTION",    titleRed: "MASTERY",
    description: "CINEMATIC ROLLING SHOTS THAT BRING SPEED TO LIFE",
    tagline: "MOVEMENT. ENERGY. IMPACT.",
    image: IMAGES.motion,    route: "/videos",
  },
  {
    id: "03", titleWhite: "LIFESTYLE", titleRed: "VLOGS",
    description: "WEEKLY CAR CULTURE UPDATES & BEHIND THE SCENES",
    tagline: "REAL PEOPLE. REAL CARS. REAL STORIES.",
    image: IMAGES.lifestyle, isVlog: true, route: "/videos",
  },
  {
    id: "04", titleWhite: "AUTODOSE",  titleRed: "SHOP",
    description: "PREMIUM CAR PARTS. CURATED FOR PERFORMANCE.",
    tagline: "UPGRADE. CUSTOMIZE. DOMINATE.",
    image: IMAGES.shop, comingSoon: true, route: "/shop",
  },
] as const;

type Service = typeof services[number];

// ─── Neural Noise WebGL Background ───────────────────────────────────────────
const NeuralNoiseBg = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main(){vUv=0.5*(a_position+1.0);gl_Position=vec4(a_position,0.0,1.0);}
    `;
    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform vec3 u_color;
      uniform float u_speed;
      vec2 rotate(vec2 uv,float th){return mat2(cos(th),sin(th),-sin(th),cos(th))*uv;}
      float neuro_shape(vec2 uv,float t,float p){
        vec2 sine_acc=vec2(0.0);vec2 res=vec2(0.0);float scale=8.0;
        for(int j=0;j<15;j++){
          uv=rotate(uv,1.0);sine_acc=rotate(sine_acc,1.0);
          vec2 layer=uv*scale+float(j)+sine_acc-t;
          sine_acc+=sin(layer)+2.4*p;
          res+=(0.5+0.5*cos(layer))/scale;
          scale*=1.2;
        }
        return res.x+res.y;
      }
      void main(){
        vec2 uv=0.5*vUv;uv.x*=u_ratio;
        vec2 pointer=vUv-u_pointer_position;pointer.x*=u_ratio;
        float p=clamp(length(pointer),0.0,1.0);p=0.5*pow(1.0-p,2.0);
        float t=u_speed*u_time;
        float noise=neuro_shape(uv,t,p);
        noise=1.2*pow(noise,3.0);
        noise+=pow(noise,10.0);
        noise=max(0.0,noise-0.5);
        noise*=(1.0-length(vUv-0.5));
        gl_FragColor=vec4(u_color*noise,noise);
      }
    `;

    function mkShader(src: string, type: number) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(vsSource, gl.VERTEX_SHADER));
    gl.attachShader(prog, mkShader(fsSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const uc = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < uc; i++) {
      const n = gl.getActiveUniform(prog, i)!.name;
      uniforms[n] = gl.getUniformLocation(prog, n);
    }

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3f(uniforms.u_color, 0.86, 0.15, 0.15);
    gl.uniform1f(uniforms.u_speed, 0.0008);

    const pointer = { x: 0.5, y: 0.5, tX: 0.5, tY: 0.5 };

    function resize() {
      const parent = canvas!.parentElement!;
      canvas!.width  = parent.offsetWidth;
      canvas!.height = parent.offsetHeight;
      gl!.uniform1f(uniforms.u_ratio, canvas!.width / canvas!.height);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      pointer.tX = e.clientX / window.innerWidth;
      pointer.tY = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove);

    let raf: number;
    function render() {
      pointer.x += (pointer.tX - pointer.x) * 0.05;
      pointer.y += (pointer.tY - pointer.y) * 0.05;
      gl!.uniform1f(uniforms.u_time, performance.now());
      gl!.uniform2f(uniforms.u_pointer_position, pointer.x, 1 - pointer.y);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
});
NeuralNoiseBg.displayName = "NeuralNoiseBg";

// ─── Glow Border ─────────────────────────────────────────────────────────────
const GlowBorder = ({ isHovered }: { isHovered: boolean }) => (
  <>
    <motion.div
      className="pointer-events-none absolute inset-0 z-20"
      animate={{
        boxShadow: isHovered
          ? "0 0 0 1.5px #dc2626, 0 0 20px 3px rgba(220,38,38,0.5), 0 0 50px 8px rgba(220,38,38,0.18)"
          : "0 0 0 1px rgba(220,38,38,0.2)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
    {[
      { cls: "top-0 left-0",     d: "M0 16 L0 0 L16 0" },
      { cls: "top-0 right-0",    d: "M16 16 L16 0 L0 0" },
      { cls: "bottom-0 left-0",  d: "M0 0 L0 16 L16 16" },
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
    <motion.div
      className="pointer-events-none absolute bottom-0 left-0 h-[2px] z-30"
      style={{ background: "linear-gradient(to right, #dc2626, #ef4444, transparent)" }}
      animate={{ width: isHovered ? "100%" : "0%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    />
  </>
);

// ─── Orbital Service Card ─────────────────────────────────────────────────────
interface ServiceCardProps {
  service: Service;
  x: number;
  y: number;
}

const OrbitServiceCard = memo(({ service, x, y }: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (service.comingSoon) return;
    setTimeout(() => navigate(service.route), 240);
  };

  return (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 30 : 10,
        transition: "z-index 0s",
      }}
    >
      <motion.div
        className="relative overflow-hidden w-[158px] bg-[#0a0a0a]"
        style={{ cursor: service.comingSoon ? "default" : "pointer" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileTap={!service.comingSoon ? { scale: 0.975 } : {}}
      >
        <GlowBorder isHovered={isHovered} />

        {/* Image */}
        <div className="relative h-[80px] overflow-hidden">
          <motion.img
            src={service.image}
            alt={service.titleWhite}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: "brightness(0.7) saturate(0.85)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
            }}
          />
        </div>

        {/* COMING SOON ribbon */}
        {"comingSoon" in service && service.comingSoon && (
          <div
            className="absolute top-[8px] -right-[8px] z-40 bg-red-600 text-white text-[6.5px] font-black tracking-[.1em] uppercase py-[2px] px-[18px]"
            style={{ transform: "rotate(45deg) translate(6px,-4px)" }}
          >
            COMING SOON
          </div>
        )}

        {/* REC badge */}
        {"isVlog" in service && service.isVlog && (
          <div className="absolute top-[6px] right-[6px] z-30 flex items-center gap-1 bg-black/80 px-[6px] py-[3px] border border-white/10 text-[8px] font-bold text-white tracking-[.1em]">
            <span
              className="w-[5px] h-[5px] rounded-full bg-red-600"
              style={{ animation: "blink 1.3s infinite" }}
            />
            REC
          </div>
        )}

        {/* Body */}
        <div className="p-[8px_10px_10px]">
          <motion.div
            className="text-red-600 font-black text-[8px] tracking-[.25em] mb-[3px]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            animate={{ x: isHovered ? 2 : 0 }}
          >
            {service.id}
          </motion.div>
          <motion.h3
            className="font-black italic uppercase leading-none mb-1 text-white text-[11px]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            animate={{ x: isHovered ? 2 : 0 }}
          >
            {service.titleWhite}{" "}
            <motion.span
              style={{ color: "#dc2626" }}
              animate={{
                textShadow: isHovered ? "0 0 12px rgba(220,38,38,0.9)" : "none",
              }}
            >
              {service.titleRed}
            </motion.span>
          </motion.h3>
          <p className="text-zinc-600 uppercase text-[9px] tracking-[.12em] leading-[1.5]">
            {service.description}
          </p>
        </div>

        {/* Arrow */}
        {!("comingSoon" in service && service.comingSoon) && (
          <motion.div
            className="absolute bottom-[8px] right-[8px] w-[20px] h-[20px] border border-red-800 flex items-center justify-center"
            animate={{
              borderColor: isHovered ? "#dc2626" : "rgba(220,38,38,0.35)",
              background:  isHovered ? "rgba(220,38,38,0.15)" : "transparent",
            }}
          >
            <ArrowRight size={10} className="text-red-600" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});
OrbitServiceCard.displayName = "OrbitServiceCard";

// ─── CTA Button ───────────────────────────────────────────────────────────────
const EpicButton = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      className="mt-10 flex justify-center"
    >
      <motion.button
        className="relative flex items-center justify-center gap-3 overflow-hidden px-10 py-3.5 border-none outline-none"
        style={{
          clipPath: "polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%)",
          cursor: "pointer",
          background: "#dc2626",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          background: isHovered ? "#b91c1c" : "#dc2626",
          boxShadow: isHovered
            ? "0 0 32px rgba(220,38,38,0.75), 0 0 75px rgba(220,38,38,0.28)"
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
        <motion.span className="relative z-10 text-white" animate={{ x: isHovered ? -1 : 0 }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="white">
            <polygon points="2,1 11,6 2,11" />
          </svg>
        </motion.span>
        <span
          className="relative z-10 text-white font-black italic tracking-[.2em] uppercase text-[11px]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          LET'S CREATE SOMETHING EPIC
        </span>
      </motion.button>
    </motion.div>
  );
};

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
const OrbitRing = ({ radius }: { radius: number }) => (
  <div
    className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
    style={{
      width: radius * 2,
      height: radius * 2,
      transform: "translate(-50%,-50%)",
      border: "1px solid rgba(220,38,38,0.2)",
      boxShadow: "0 0 40px rgba(220,38,38,0.08), inset 0 0 40px rgba(220,38,38,0.04)",
      animation: "ringPulse 4s ease-in-out infinite",
    }}
  />
);

// ─── Main Section ─────────────────────────────────────────────────────────────
const ORBIT_RADIUS = 200;
const PHASES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
const SPEED  = 0.28;

export default function OurServices() {
  const [time, setTime]     = useState(0);
  const [paused, setPaused] = useState(false);
  const lastRef             = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const tick = (ts: number) => {
      if (lastRef.current !== null && !paused) {
        setTime((t) => t + (ts - lastRef.current!) / 1000);
      }
      lastRef.current = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden py-16 lg:py-24 text-white"
      style={{ background: "#060606", minHeight: "100vh" }}
    >
      {/* Neural noise WebGL background */}
      <NeuralNoiseBg />

      {/* Soft radial red glow — no grid */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 52%, rgba(220,38,38,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-5 sm:px-8 max-w-3xl flex flex-col items-center">

        {/* ── Header ── */}
        <motion.div
          className="flex items-center gap-3 mb-3"
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-7 h-px bg-red-600" />
          <span
            className="text-red-600 font-bold italic text-[10px] tracking-[.35em] uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            AUTODOSE
          </span>
          <div className="w-7 h-px bg-red-600" />
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-black italic tracking-wide uppercase text-center leading-none mb-3"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-white">OUR </span>
          <span style={{ color: "#dc2626", textShadow: "0 0 28px rgba(220,38,38,0.5)" }}>
            SERVICES
          </span>
        </motion.h2>

        <p className="text-zinc-600 text-[9px] tracking-[.28em] uppercase mb-10">
          Built for car enthusiasts. Driven by passion.
        </p>

        {/* ── Orbit Stage ── */}
        <div
          className="relative"
          style={{
            width:  ORBIT_RADIUS * 2 + 200,
            height: ORBIT_RADIUS * 2 + 200,
            maxWidth: "100%",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <OrbitRing radius={ORBIT_RADIUS} />
          <OrbitRing radius={ORBIT_RADIUS * 0.58} />

          {/* Center hub — AutoDose logo */}
          <div
            className="absolute top-1/2 left-1/2 z-20 flex items-center justify-center"
            style={{
              transform: "translate(-50%,-50%)",
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "radial-gradient(circle,#1a0808 0%,#060606 100%)",
              border: "1.5px solid rgba(220,38,38,0.5)",
              overflow: "hidden",
              padding: 6,
              animation: "hubPulse 3s ease-in-out infinite",
            }}
          >
            <img
              src={autoDoseLogo}
              alt="AutoDose"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Orbiting cards */}
          {services.map((service, i) => {
            const angle = time * SPEED + PHASES[i];
            const x = Math.cos(angle) * ORBIT_RADIUS;
            const y = Math.sin(angle) * ORBIT_RADIUS;
            return (
              <OrbitServiceCard key={service.id} service={service} x={x} y={y} />
            );
          })}
        </div>

        {/* ── CTA ── */}
        <EpicButton />
      </div>

      <style>{`
        @keyframes hubPulse {
          0%,100% { box-shadow: 0 0 20px rgba(220,38,38,0.25), 0 0 40px rgba(220,38,38,0.1); }
          50%      { box-shadow: 0 0 50px rgba(220,38,38,0.55), 0 0 90px rgba(220,38,38,0.2); }
        }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 30px rgba(220,38,38,0.08), inset 0 0 30px rgba(220,38,38,0.04); }
          50%      { box-shadow: 0 0 70px rgba(220,38,38,0.2),  inset 0 0 60px rgba(220,38,38,0.1);  }
        }
        @keyframes blink {
          0%,100% { opacity: 1;    }
          50%      { opacity: 0.15; }
        }
      `}</style>
    </section>
  );
}