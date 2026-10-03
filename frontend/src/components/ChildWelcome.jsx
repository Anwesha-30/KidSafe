import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, ShieldCheck } from "lucide-react";

const CHARACTERS = [
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png", bg: "#F4845F", panel: "#F79B7F", title: "PLAY", label: "Discover your next adventure", body: "Explore Web3 games and prepare payments to the addresses your parent approved.", fallback: "🎮" },
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png", bg: "#6BBF7A", panel: "#85CC92", title: "EXPLORE", label: "Your dApp universe awaits", body: "Browse your approved dApps. Pick an app and check its payment address together.", fallback: "🪐" },
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png", bg: "#E882B4", panel: "#ED9DC4", title: "CREATE", label: "Make room for big ideas", body: "Explore creative dApps and plan digital purchases within your allowance.", fallback: "🎨" },
  { src: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png", bg: "#6EB5FF", panel: "#8DC4FF", title: "LEARN", label: "Small steps. New worlds.", body: "Learn how onchain payments work. Your parent’s rules travel with your wallet.", fallback: "🚀" },
];

export default function ChildWelcome({ onEnter, reducedMotion, demoMode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const locked = useRef(false);
  const timer = useRef(null);
  const heading = useRef(null);
  const still = reducedMotion || paused;
  const active = CHARACTERS[activeIndex];

  useEffect(() => {
    CHARACTERS.forEach(({ src }) => { const image = new Image(); image.src = src; });
    heading.current?.focus({ preventScroll: true });
    return () => clearTimeout(timer.current);
  }, []);

  function navigate(direction) {
    if (locked.current) return;
    setActiveIndex((index) => (index + direction + CHARACTERS.length) % CHARACTERS.length);
    if (still) return;
    locked.current = true;
    setIsAnimating(true);
    timer.current = setTimeout(() => { locked.current = false; setIsAnimating(false); }, 650);
  }

  function role(index) {
    const offset = (index - activeIndex + CHARACTERS.length) % CHARACTERS.length;
    return ["center", "right", "back", "left"][offset];
  }

  return (
    <section className={`child-welcome ${still ? "welcome-still" : ""}`} style={{ backgroundColor: active.bg, "--welcome-panel": active.panel }} aria-label="Welcome to your Web3 dashboard" aria-roledescription="carousel" onKeyDown={(event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); navigate(event.key === "ArrowLeft" ? -1 : 1); }
    }}>
      <div className="welcome-grain" aria-hidden="true" />
      <header className="welcome-header"><span className="welcome-brand">KIDSAFE / WEB3 WORLDS</span><div className="flex items-center gap-2"><button className="welcome-motion" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Enable animations" : "Pause animations"}>{paused ? <Play size={16} /> : <Pause size={16} />}<span className="hidden sm:inline">{paused ? "Motion off" : "Pause motion"}</span></button><button type="button" className="welcome-skip" onClick={() => onEnter({ bg: active.bg, panel: active.panel })}>Skip intro <ArrowRight size={16} /></button></div></header>
      <h1 ref={heading} tabIndex={-1} className="welcome-ghost" aria-label="Welcome to your Web3 adventure">{active.title}</h1>
      <div className="welcome-characters" aria-hidden="true">
        {CHARACTERS.map((character, index) => <div key={character.src} className={`welcome-character welcome-${role(index)}`}>
          {failedImages[index] ? <span className="welcome-fallback">{character.fallback}</span> : <img src={character.src} alt="" draggable={false} onError={() => setFailedImages((previous) => ({ ...previous, [index]: true }))} />}
        </div>)}
      </div>
      <div className="welcome-copy">
        <p className="welcome-eyebrow"><ShieldCheck size={15} /> Parent-approved payments {demoMode && "· Demo"}</p>
        <div aria-live="polite" aria-atomic="true"><h2>{active.label}</h2><p className="welcome-description">{active.body}</p></div>
        <div className="welcome-navigation"><button type="button" onClick={() => navigate(-1)} aria-label="Previous character" aria-disabled={isAnimating}><ArrowLeft size={26} /></button><button type="button" onClick={() => navigate(1)} aria-label="Next character" aria-disabled={isAnimating}><ArrowRight size={26} /></button><span className="welcome-count">0{activeIndex + 1} / 04</span></div>
      </div>
      <button className="welcome-enter" type="button" onClick={() => onEnter({ bg: active.bg, panel: active.panel })}>ENTER DASHBOARD <ArrowRight aria-hidden="true" /></button>
    </section>
  );
}
