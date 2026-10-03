import { useEffect, useRef } from "react";

export default function useLandingMotion(paused) {
  const root = useRef(null);
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const still = paused || preference.matches;
      const scroll = window.scrollY;
      page.style.setProperty("--scroll-shift", `${still ? 0 : scroll * -.13}px`);
      page.style.setProperty("--scroll-turn", `${still ? 0 : scroll * .035}deg`);
      const height = document.documentElement.scrollHeight - innerHeight;
      page.style.setProperty("--read-progress", height > 0 ? scroll / height : 0);
      const scene = page.querySelector("#savings-scene")?.getBoundingClientRect();
      const visibility = scene ? Math.max(0, 1 - Math.abs(scene.top + scene.height / 2 - innerHeight / 2) / (innerHeight * .85)) : 0;
      page.style.setProperty("--scene-opacity", .14 + visibility * .86);
      page.dataset.motion = still ? "paused" : "active";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    page.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); preference.removeEventListener("change", schedule); };
  }, [paused]);
  return root;
}
