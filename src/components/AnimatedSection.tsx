/**
 * AnimatedSection — wraps any section with a smooth scroll-reveal.
 * Uses CSS classes + IntersectionObserver (zero JS animation cost).
 * Drop-in replacement for manual motion.div scroll triggers.
 */
import { useEffect, useRef, ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Extra CSS class(es) applied once in view — defaults to "section-reveal" */
  revealClass?: string;
  /** Delay before adding in-view class (ms) */
  delay?: number;
  /** Use stagger-children CSS animation on children */
  stagger?: boolean;
  as?: keyof JSX.IntrinsicElements;
  id?: string;
}

export default function AnimatedSection({
  children, className = "", style, revealClass, delay = 0,
  stagger = false, as: Tag = "section", id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const base = revealClass ?? (stagger ? "stagger-children" : "section-reveal");
    el.classList.add(base);

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const apply = () => el.classList.add("in-view");
          delay ? setTimeout(apply, delay) : apply();
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealClass, delay, stagger]);

  return (
    // @ts-ignore
    <Tag ref={ref} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}
