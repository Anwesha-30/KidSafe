import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Shield, LayoutGrid, X, Pause, Play, CheckCircle2 } from "lucide-react";

export default function ParentWelcome({ onEnter, demoMode }) {
  const [showMore, setShowMore] = useState(false);
  const [paused, setPaused] = useState(false);
  const title = useRef(null);
  const moreButton = useRef(null);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, []);

  return (
    <section className={`parent-welcome ${paused ? "parent-motion-off" : ""}`} aria-label="Welcome to your parent dashboard">
      <div className="parent-welcome-glow" aria-hidden="true" />
      <header className="parent-welcome-nav">
        <span className="parent-welcome-brand"><Shield size={24} /> KidSafe<span className="parent-brand-divider"> / PARENTS</span></span>
        <div className="flex items-center gap-3">
          <button type="button" className="parent-glass parent-motion" aria-pressed={paused} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Enable motion" : "Pause motion"}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
          <button ref={moreButton} type="button" className="parent-glass parent-more" aria-expanded={showMore} aria-controls="parent-welcome-more" onClick={() => setShowMore((value) => !value)}>{showMore ? <X size={14} /> : <LayoutGrid size={14} />} MORE</button>
        </div>
      </header>
      {showMore && <div id="parent-welcome-more" className="parent-more-panel" onKeyDown={(event) => { if (event.key === "Escape") { setShowMore(false); moreButton.current?.focus(); } }}>
        <p className="font-semibold mb-3">A little freedom. Your guidance.</p>
        <ul className="space-y-3 text-sm"><li><CheckCircle2 size={16} /> Fund your child’s allowance</li><li><CheckCircle2 size={16} /> Approve dApp payment addresses</li><li><CheckCircle2 size={16} /> Set limits and review requests</li></ul>
        <button type="button" className="parent-more-enter" onClick={onEnter}>Open dashboard <ArrowRight size={16} /></button>
      </div>}
      <div className="parent-welcome-stage">
        <span className="parent-glass parent-welcome-pill"><span className="parent-pill-square" /> WEB3 ADVENTURES. PARENT GUIDANCE. <ArrowRight size={14} /></span>
        <h1 ref={title} tabIndex={-1} aria-label="Their next adventure. Your guidance.">{["Their", "next", "adventure.", "Your", "guidance."].map((word, index) => <React.Fragment key={word}><span className="parent-word-mask"><span style={{ "--word-delay": `${450 + index * 55}ms` }}>{word}</span></span>{index < 4 ? " " : ""}</React.Fragment>)}</h1>
        <p className="parent-welcome-lede">Give your child room to explore Web3.<br className="hidden sm:block" /> Manage their allowance, approve dApp payments,<br className="hidden sm:block" /> and keep their daily spending in view.</p>
        <div className="parent-welcome-ctas"><button type="button" className="parent-open-dashboard" onClick={onEnter}>OPEN MY DASHBOARD <ArrowRight size={16} /></button><button type="button" className="parent-how-it-works" aria-expanded={showMore} aria-controls="parent-welcome-more" onClick={() => setShowMore((value) => !value)}><LayoutGrid size={14} /> HOW IT WORKS</button></div>
        {demoMode && <p className="parent-welcome-demo">Demo preview · mUSDC test tokens · No real payments</p>}
      </div>
      <div className="parent-figure-scene" aria-hidden="true"><div className="parent-figure-halo" /><img className="parent-figures" src="/images/parent-characters.png" alt="" draggable={false} /><span className="parent-figure-ground" /></div>
      <footer className="parent-welcome-footer"><span>PARENT VIEW / KIDSAFE</span><span>EXPLORE TOGETHER <span aria-hidden="true">↗</span></span></footer>
    </section>
  );
}
