import { useRef, useState } from "react";
import { Pause, Play, ShieldCheck, Wifi } from "lucide-react";
import "./AllowanceScene.css";

export default function AllowanceScene({ motionPaused = false, showControls = true }) {
  const stage = useRef(null);
  const [locallyPaused, setPaused] = useState(false);
  const paused = locallyPaused || motionPaused;

  function tilt(event) {
    if (paused || event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    stage.current.style.setProperty("--tilt-x", `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 12}deg`);
    stage.current.style.setProperty("--tilt-y", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 18}deg`);
  }

  function resetTilt() {
    stage.current.style.setProperty("--tilt-x", "0deg");
    stage.current.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div className={`allowance-scene${paused ? " is-paused" : ""}`} onPointerMove={tilt} onPointerLeave={resetTilt}>
      <div className="allowance-scene__art" aria-hidden="true">
        <div className="allowance-scene__halo" />
        <div className="allowance-scene__floor" />
        <div className="allowance-scene__stage" ref={stage}>
          <div className="allowance-scene__orbit-plane">
            <div className="allowance-scene__ring" />
            {[0, 1, 2].map((coin) => (
              <div className="allowance-scene__orbit" key={coin} style={{ "--phase": `${coin * -6}s` }}>
                <div className="allowance-scene__coin-position">
                  <div className="allowance-scene__coin">
                    {Array.from({ length: 7 }, (_, layer) => (
                      <span key={layer} className="allowance-scene__coin-layer" style={{ transform: `translateZ(${layer * 2}px)` }}>
                        {layer === 6 ? "$" : null}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="allowance-scene__card-float">
            <div className="allowance-scene__card">
              {Array.from({ length: 8 }, (_, layer) => (
                <div key={layer} className="allowance-scene__card-layer" style={{ transform: `translateZ(${layer * 2}px)` }} />
              ))}
              <div className="allowance-scene__card-face">
                <div className="allowance-scene__card-header"><span><ShieldCheck size={18} /> KidSafe</span><Wifi size={22} /></div>
                <div className="allowance-scene__card-balance"><span>Available allowance</span><strong>125<span>.00</span></strong><small>mUSDC · Sample balance</small></div>
                <div className="allowance-scene__card-footer"><span>FAMILY ACCOUNT</span><span className="allowance-scene__card-chip" /></div>
              </div>
              <div className="allowance-scene__seal"><ShieldCheck size={34} strokeWidth={1.7} /></div>
            </div>
          </div>
          <div className="allowance-scene__badge"><ShieldCheck size={17} /> Protected by your rules</div>
        </div>
        <span className="allowance-scene__spark allowance-scene__spark--one" />
        <span className="allowance-scene__spark allowance-scene__spark--two" />
        <span className="allowance-scene__spark allowance-scene__spark--three" />
      </div>
      {showControls && <button className="allowance-scene__pause" type="button" onClick={() => { resetTilt(); setPaused(!paused); }} aria-label={paused ? "Play allowance animation" : "Pause allowance animation"} aria-pressed={paused}>
        {paused ? <Play size={13} /> : <Pause size={13} />}
        <span>{paused ? "Play animation" : "Pause animation"}</span>
      </button>}
    </div>
  );
}
