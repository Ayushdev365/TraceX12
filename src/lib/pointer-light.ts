import { useEffect } from "react";

/**
 * Drives --lx / --ly on :root for live glass specular.
 * Fine pointers only, rAF-lerped, paused offscreen / reduced-motion.
 */
export function usePointerLight() {
  useEffect(() => {
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");

    root.style.setProperty("--lx", "0.62");
    root.style.setProperty("--ly", "0.22");

    if (motion.matches || !fine.matches) return;

    let raf = 0;
    let x = 0.62;
    let y = 0.22;
    let tx = x;
    let ty = y;

    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      root.style.setProperty("--lx", x.toFixed(4));
      root.style.setProperty("--ly", y.toFixed(4));
      if (Math.abs(tx - x) > 0.0012 || Math.abs(ty - y) > 0.0012) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (document.hidden) return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      tx = event.clientX / w;
      ty = event.clientY / h;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
