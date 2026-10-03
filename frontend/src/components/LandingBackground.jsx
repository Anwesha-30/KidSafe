import { Component, lazy, Suspense } from "react";
import "./LandingBackground.css";
const SavingsDesk = lazy(() => import("./SavingsDesk"));
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="desk-fallback">Your next adventure starts with a little saving.</div> : this.props.children; }
}
export default function LandingBackground({ paused }) {
  return <div className="landing-background" aria-hidden="true">
    <div className="landing-aurora landing-aurora--mint" /><div className="landing-aurora landing-aurora--violet" />
    <div className="landing-starfield">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 9) % 100}%`, top: `${(i * 23 + 7) % 100}%`, "--delay": `${i * -.43}s` }} />)}</div>
    <div className="landing-orbit landing-orbit--one" /><div className="landing-orbit landing-orbit--two" />
    <div className="landing-grid" />
    <div className="landing-desk-canvas"><SceneBoundary><Suspense fallback={null}><SavingsDesk paused={paused} /></Suspense></SceneBoundary></div>
  </div>;
}
