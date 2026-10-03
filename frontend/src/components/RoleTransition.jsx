import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import RoleAvatar from "./RoleAvatar";

const RoleTransitionContext = createContext(null);
export const useRoleTransition = () => useContext(RoleTransitionContext);
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function RoleTransitionProvider({ children }) {
  const [flight, setFlight] = useState(null);
  const overlay = useRef(null);
  const animation = useRef(null);
  const liftDone = useRef(null);
  const cancel = useCallback(() => {
    animation.current?.cancel();
    liftDone.current?.();
    liftDone.current = null;
    setFlight(null);
  }, []);
  const begin = useCallback((role, element) => {
    if (reduceMotion() || !element || !Element.prototype.animate) return Promise.resolve();
    const rect = element.getBoundingClientRect();
    return new Promise(resolve => { liftDone.current = resolve; setFlight({ role, left: rect.left, top: rect.top }); });
  }, []);

  useLayoutEffect(() => {
    if (!flight || !overlay.current) return;
    animation.current = overlay.current.animate([
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(-24px) scale(1.15)" },
    ], { duration: 220, easing: "ease-out", fill: "forwards" });
    animation.current.finished.catch(() => {}).then(() => { liftDone.current?.(); liftDone.current = null; });
    return () => animation.current?.cancel();
  }, [flight]);

  const land = useCallback((target) => {
    const element = overlay.current;
    if (!element || !target) return;
    if (reduceMotion()) { cancel(); return; }
    const from = element.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    animation.current?.cancel();
    element.style.left = `${from.left}px`;
    element.style.top = `${from.top}px`;
    animation.current = element.animate([
      { transform: `translate(0,0) scale(${from.width / 80})`, opacity: 1 },
      { transform: `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / 80})`, opacity: .14 },
    ], { duration: 680, easing: "cubic-bezier(.22,.75,.2,1)", fill: "forwards" });
    animation.current.finished.then(() => setFlight(null)).catch(() => {});
  }, [cancel]);

  useEffect(() => {
    if (!flight) return;
    const timeout = window.setTimeout(cancel, 10000);
    const stop = () => cancel();
    window.addEventListener("resize", stop);
    window.addEventListener("popstate", stop);
    return () => { clearTimeout(timeout); window.removeEventListener("resize", stop); window.removeEventListener("popstate", stop); };
  }, [flight, cancel]);

  return <RoleTransitionContext.Provider value={{ begin, land, cancel, activeRole: flight?.role }}>
    {children}
    {flight && createPortal(<div ref={overlay} className="role-flight" style={{ left: flight.left, top: flight.top, width: 80, height: 80 }} aria-hidden="true"><RoleAvatar role={flight.role} /></div>, document.body)}
  </RoleTransitionContext.Provider>;
}

export function DashboardRoleArt({ role }) {
  const target = useRef(null);
  const { activeRole, land } = useRoleTransition();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const heading = target.current?.parentElement.querySelector("h1");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  }, []);
  useLayoutEffect(() => {
    if (activeRole !== role) return;
    const frame = requestAnimationFrame(() => land(target.current));
    return () => cancelAnimationFrame(frame);
  }, [role, activeRole, land]);
  return <div ref={target} className={`dashboard-role-art${activeRole === role ? " is-arriving" : ""}`} aria-hidden="true"><RoleAvatar role={role} /></div>;
}
