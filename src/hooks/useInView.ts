import { useEffect, useRef, useState } from "react";

/**
 * Lightweight IntersectionObserver hook — zero Framer Motion overhead.
 * Use for scroll-triggered reveals on static sections.
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect(); // fire once
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
}

/** Attach .in-view class to element — CSS handles the animation */
export function useReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px", ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
