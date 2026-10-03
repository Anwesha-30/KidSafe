import React from "react";

/** Keep the hit area flat while the visible card moves in 3D. */
export default function TiltButton({ children, motionDisabled = false, className = "", style, ...props }) {
  function reset(event) {
    const card = event.currentTarget.firstElementChild;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--shine-x", "50%");
    card.style.setProperty("--shine-y", "50%");
  }

  function tilt(event) {
    if (motionDisabled || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const card = event.currentTarget.firstElementChild;
    card.style.setProperty("--tilt-x", `${(0.5 - y) * 14}deg`);
    card.style.setProperty("--tilt-y", `${(x - 0.5) * 18}deg`);
    card.style.setProperty("--shine-x", `${x * 100}%`);
    card.style.setProperty("--shine-y", `${y * 100}%`);
  }

  return (
    <div className="dapp-tilt-stage" onPointerMove={tilt} onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}>
      <button {...props} className={className} style={style}>
        <span className="dapp-card-shine" aria-hidden="true" />
        {children}
      </button>
    </div>
  );
}
