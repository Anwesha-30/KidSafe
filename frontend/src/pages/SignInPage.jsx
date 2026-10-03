import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Shield, CheckCircle2,
  ArrowRight, Lock, Coins, BarChart3, Pause, Play,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import LoadingSpinner from "@/components/LoadingSpinner";
import AllowanceScene from "@/components/AllowanceScene";
import LandingBackground from "@/components/LandingBackground";
import RoleAvatar from "@/components/RoleAvatar";
import { useRoleTransition } from "@/components/RoleTransition";
import useLandingMotion from "@/hooks/useLandingMotion";

/* ─────────────────────────────────────────────────────────
   Role card data
───────────────────────────────────────────────────────── */
const ROLES = [
  {
    key: "parent",
    title: "For parents",
    subtitle: "Guide their spending with confidence.",
    features: [
      "Set allowances and spending limits",
      "Approve stores and payment requests",
      "Track spending in one place",
    ],
    cta: "Continue as Parent",
    ctaCls: "bg-brand hover:bg-brand-light text-white",
    border: "hover:border-brand/40 hover:shadow-blue-100",
  },
  {
    key: "child",
    title: "For kids",
    subtitle: "Build confidence with every choice.",
    features: [
      "See your balance at a glance",
      "Pay at approved stores",
      "Request money when you need it",
    ],
    cta: "Continue as Child",
    ctaCls: "bg-cyan-500 hover:bg-cyan-400 text-white",
    border: "hover:border-cyan-400/40 hover:shadow-cyan-100",
  },
];

/* ─────────────────────────────────────────────────────────
   Feature strip
───────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Lock size={15} />, label: "Spending limits" },
  { icon: <Shield size={15} />, label: "Parent controls" },
  { icon: <BarChart3 size={15} />, label: "Spending insights" },
];

/* ═══════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════ */
export default function SignInPage() {
  const navigate = useNavigate();
  const { role, setRole, connect, account } = useWallet();
  const [choosing, setChoosing] = useState(null); // which role is being processed
  const transition = useRoleTransition();
  const [selectionError, setSelectionError] = useState("");
  const [motionPaused, setMotionPaused] = useState(false);
  const pageRef = useLandingMotion(motionPaused);

  /* If already has a role, redirect immediately */
  if (role === "parent") return <Navigate to="/parent" replace />;
  if (role === "child") return <Navigate to="/child" replace />;

  async function handleRoleSelect(selectedRole, button) {
    if (choosing) return;
    setChoosing(selectedRole);
    setSelectionError("");
    try {
      await Promise.all([
        selectedRole === "parent" ? import("./ParentDashboard") : import("./ChildDashboard"),
        account ? Promise.resolve() : connect(),
      ]);
      await transition.begin(selectedRole, button.querySelector(".role-avatar"));
      setRole(selectedRole);
      navigate(selectedRole === "parent" ? "/parent" : "/child");
    } catch {
      transition.cancel();
      setChoosing(null);
      setSelectionError("Could not open the dashboard. Please try again.");
    }
  }

  return (
    <div ref={pageRef} className="landing-page min-h-screen flex flex-col" data-motion={motionPaused ? "paused" : "active"}>
      <LandingBackground paused={motionPaused} />
      <div className="landing-read-progress" aria-hidden="true" />
      <button className="landing-motion-toggle" onClick={() => setMotionPaused(value => !value)} aria-pressed={motionPaused}>
        {motionPaused ? <Play size={14} /> : <Pause size={14} />} {motionPaused ? "Resume motion" : "Pause motion"}
      </button>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-brand tracking-tight">KidSafe</span>
          <nav className="landing-nav" aria-label="Main navigation">
            <a className="landing-nav-link" href="#how-it-works">How it works</a>
            <a className="landing-nav-cta" href="#choose-role">Get started <ArrowRight size={14} /></a>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="kidsafe-hero text-white">
        <div className="kidsafe-hero__layout">
        <div className="kidsafe-hero__copy" data-reveal>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3 tracking-tight">
            Smart Allowance.<br />
            <span className="text-brand-accent">Safer Spending.</span>
          </h1>
          <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
            Give kids the freedom to spend, with limits you set
            and guidance they can grow with.
          </p>

          {/* Feature pills */}
          <div className="kidsafe-hero__features flex flex-wrap gap-3">
            {FEATURES.map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                {icon} {label}
              </span>
            ))}
          </div>
          <a href="#choose-role" className="kidsafe-hero__cta">Get started <ArrowRight size={16} /></a>
        </div>
        <div className="landing-hero-art"><AllowanceScene motionPaused={motionPaused} showControls={false} /></div>
        </div>
      </section>

      {/* ── Role selection ────────────────────────────────────── */}
      <section id="savings-scene" className="desk-story" aria-label="Savings desk illustration">
        <div className="desk-story__copy" data-reveal>
        <h2>Good habits start small.</h2>
        <p>Make room for their next big thing.</p>
        </div>
        <div className="desk-story__chip desk-story__chip--left" aria-hidden="true"><Coins size={24} /></div>
        <div className="desk-story__chip desk-story__chip--right" aria-hidden="true"><Shield size={24} /></div>
      </section>
      <section id="choose-role" className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-10" data-reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Your family. Your way.
            </h2>
            <p className="text-gray-400 text-sm">
              Choose your dashboard to get started.
            </p>
          </div>

          <div className="landing-role-grid grid md:grid-cols-2 gap-6 max-w-3xl mx-auto" data-reveal>
            {ROLES.map((r) => (
              <RoleCard
                key={r.key}
                role={r}
                loading={choosing === r.key}
                disabled={!!choosing}
                inFlight={transition.activeRole === r.key}
                onSelect={(event) => handleRoleSelect(r.key, event.currentTarget)}
              />
            ))}
          </div>

          {selectionError && <p role="alert" className="mt-4 text-center text-sm text-red-600">{selectionError}</p>}
          {/* Demo note */}
          <p className="landing-demo-note">Try the demo. No wallet required.</p>
        </div>
      </section>

      {/* ── How it works strip ────────────────────────────────── */}
      <section id="how-it-works" className="landing-how-it-works border-t border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6" data-reveal>
            How KidSafe works
          </p>
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              { n: "01", t: "Connect", d: "Link your child's wallet." },
              { n: "02", t: "Set limits", d: "Choose an allowance and daily budget." },
              { n: "03", t: "Approve stores", d: "Decide where they can spend." },
              { n: "04", t: "Stay informed", d: "Follow every payment." },
            ].map(({ n, t, d }) => (
              <div key={n} className="landing-step" data-reveal style={{ "--reveal-delay": `${Number(n) * 90}ms` }}>
                <div className="w-9 h-9 rounded-2xl bg-brand/10 text-brand font-bold text-sm flex items-center justify-center mx-auto mb-3">{n}</div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{t}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-navy-900 text-white/30 text-xs py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white/50">
            <Shield size={13} className="text-brand-accent" />
            <span className="font-bold">KidSafe</span>
          </div>
          <span>Demo uses test tokens only. No real funds.</span>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RoleCard component
───────────────────────────────────────────────────────── */
function RoleCard({ role, loading, disabled, onSelect, inFlight }) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        role-card group w-full bg-white rounded-2xl border-2 border-gray-100 shadow-card
        p-7 text-left flex flex-col gap-5 transition-all duration-200
        ${role.border}
        hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light
      `}
      aria-label={role.cta}
      aria-busy={loading}
      data-in-flight={inFlight}
    >
      {/* Icon */}
      <RoleAvatar role={role.key} />

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{role.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{role.subtitle}</p>

        <ul className="space-y-2">
          {role.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all ${role.ctaCls}`}>
        {loading ? <LoadingSpinner size="sm" /> : (
          <>
            {role.cta}
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </div>
    </button>
  );
}
