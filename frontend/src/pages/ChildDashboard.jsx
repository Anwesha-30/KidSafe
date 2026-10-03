import React, { useEffect, useState } from "react";
import {
  Wallet, TrendingUp, Gauge,
  Send, Clock, AlertTriangle, RefreshCw,
  CheckCircle2, XCircle, Info,
  Blocks, Sparkles, Star, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

import Navbar from "@/components/Navbar";
import { DashboardRoleArt } from "@/components/RoleTransition";
import Sidebar from "@/components/Sidebar";
import ChildWelcome from "@/components/ChildWelcome";
import DappExplorer from "@/components/DappExplorer";
import StatCard from "@/components/StatCard";
import TransactionTable from "@/components/TransactionTable";
import RequestModal from "@/components/RequestModal";
import { RequestStatusBadge } from "@/components/TransactionStatus";
import LoadingSpinner from "@/components/LoadingSpinner";

import { useWallet } from "@/hooks/useWallet";
import { useAllowance } from "@/hooks/useAllowance";
import { formatToken, toHuman } from "@/utils/formatCurrency";
import { shortenAddress } from "@/utils/formatAddress";
import { MOCK_APPROVED_RECIPIENTS, MOCK_CHILD_ADDRESS } from "@/services/mockData";
import { RequestStatus } from "@/utils/constants";

/* ── Friendly messages for each rejection reason ──────── */
const REJECTION_UI = {
  DailyLimitExceeded:    { Icon: Gauge,   bg: "bg-orange-50 border-orange-200", txt: "text-orange-700", title: "Daily limit reached",   body: "You've hit today's cap. It resets at midnight UTC — try again tomorrow!" },
  RecipientNotApproved:  { Icon: XCircle, bg: "bg-red-50 border-red-200",       txt: "text-red-700",    title: "dApp not approved",     body: "Your parent hasn't approved this recipient yet. Ask them to add it." },
  InsufficientAllowance: { Icon: Wallet,  bg: "bg-blue-50 border-blue-200",     txt: "text-blue-700",   title: "Not enough balance",     body: "Your allowance is too low. Ask your parent to top it up." },
  Rejected:              { Icon: XCircle, bg: "bg-gray-50 border-gray-200",     txt: "text-gray-600",   title: "Request was declined",   body: "Your parent declined this request. Try a smaller amount or ask them why." },
};

export default function ChildDashboard() {
  const { account, isDemoMode } = useWallet();
  const childAddress = account ?? (isDemoMode ? MOCK_CHILD_ADDRESS : null);

  const [dashboardColor, setDashboardColor] = useState("#F4845F");
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [modalMode,      setModalMode]      = useState("direct");
  const [selectedApp, setSelectedApp] = useState(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const {
    childDetails, approvedRecipients,
    requests, transactions,
    loading, error, demoMode, refetch,
  } = useAllowance(childAddress);

  const balance    = childDetails?.allowanceBalance ?? 0n;
  const dailyLimit = childDetails?.dailyLimit       ?? 0n;
  const dailySpent = childDetails?.dailySpent       ?? 0n;
  const dailyRem   = dailyLimit > dailySpent ? dailyLimit - dailySpent : 0n;
  const limitPct   = dailyLimit > 0n ? Math.min(100, Math.round(Number(dailySpent) / Number(dailyLimit) * 100)) : 0;
  const isAtLimit  = dailyLimit > 0n && dailySpent >= dailyLimit;

  const spendableToday = dailyLimit > 0n && dailyRem < balance ? dailyRem : balance;
  const pendingCount = requests.filter((r) => r.status === RequestStatus.Pending).length;
  const canPay = !loading && !error && spendableToday > 0n && approvedRecipients.length > 0;
  const paymentHint = loading ? "Loading your allowance…" : error ? "Refresh to load your allowance." : balance === 0n
    ? "Ask your parent to add allowance."
    : approvedRecipients.length === 0 ? "Ask your parent to approve a dApp first."
    : isAtLimit ? "Your daily limit resets at midnight UTC." : "Pay a dApp your parent approved.";

  const chartData = buildTrend(transactions);

  const recentRejected = requests.filter((r) => r.status === RequestStatus.Rejected).slice(0, 1);

  async function refreshAllowance() {
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  }

  function handlePaymentSuccess() {
    setSuccessMessage(modalMode === "direct" ? "Payment sent! You can see it in your spending history." : "Request sent! Your parent will review it.");
    refetch();
  }

  const tips = [
    "A dApp is an app that uses a blockchain. Explore the payment address with your parent before buying.",
    "Your mUSDC allowance is your payment budget. Check the app, recipient, and amount before confirming.",
    "An approved address is where you can send payments. It does not connect your wallet to a dApp automatically.",
  ];

  function openModal(mode, app = null) {
    setSelectedApp(app);
    setModalMode(mode);
    setModalOpen(true);
  }

  useEffect(() => {
    if (!showWelcome) document.getElementById("child-dashboard-heading")?.focus({ preventScroll: true });
  }, [showWelcome]);

  if (showWelcome) return <ChildWelcome onEnter={({ bg }) => { setDashboardColor(bg); setShowWelcome(false); }} reducedMotion={reducedMotion} demoMode={demoMode ?? isDemoMode} />;

  return (
    <div className={`child-dashboard min-h-screen ${motionPaused ? "motion-paused" : ""}`} style={{ "--carousel-color": dashboardColor }}>
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} mode="child" />

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="dashboard-welcome dashboard-welcome--child flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <DashboardRoleArt role="child" />
            <div>
              <h1 id="child-dashboard-heading" tabIndex={-1} className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Your Web3 adventure starts here.</h1>
              <p className="text-sm text-gray-600 mt-1">
                {demoMode ? "Demo — sample data." : `Wallet: ${shortenAddress(childAddress)}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setShowWelcome(true)} className="kid-action rounded-xl px-4 py-2 text-sm font-semibold text-violet-800 bg-violet-100">Replay intro</button><button type="button" onClick={() => setMotionPaused((paused) => !paused)} aria-pressed={motionPaused} className="kid-action rounded-xl px-4 py-2 text-sm font-semibold text-violet-800 bg-violet-100">{motionPaused ? "Enable motion" : "Pause motion"}</button>
            <button onClick={refreshAllowance} className="btn-ghost self-start" disabled={loading || refreshing} aria-label="Refresh">
              <RefreshCw size={15} className={loading || refreshing ? "animate-spin" : ""} /> {refreshing ? "Updating…" : "Refresh"}
            </button></div>
          </div>

          {/* Demo banner */}
          {demoMode && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 text-sm text-amber-800">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <p>Demo Mode — no real transactions are made.</p>
            </div>
          )}

          {/* Daily limit hit banner */}
          {isAtLimit && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5 text-sm text-red-700 font-medium">
              <Gauge size={16} className="flex-shrink-0" />
              You've reached your daily spending limit. It resets at midnight UTC.
            </div>
          )}

          {/* Rejection message */}
          {recentRejected.length > 0 && (() => {
            const cfg = REJECTION_UI["Rejected"];
            return (
              <div className={`flex items-start gap-3 border rounded-2xl px-5 py-4 mb-5 text-sm ${cfg.bg} ${cfg.txt}`}>
                <cfg.Icon size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{cfg.title}</p>
                  <p className="mt-0.5 opacity-80">{cfg.body}</p>
                </div>
              </div>
            );
          })()}

          {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700">We couldn’t update your allowance. Refresh to try again.</div>}

          <section className="kid-hero relative overflow-hidden rounded-3xl bg-brand text-white p-6 md:p-8 mb-6" aria-label="Your allowance">
            <div className="web3-cube-scene" aria-hidden="true">
              {[0, 1, 2].map((cube) => <div key={cube} className={`web3-cube web3-cube-${cube}`}>
                {["front", "back", "right", "left", "top", "bottom"].map((face) => <span key={face} className={`cube-face cube-${face}`} />)}
              </div>)}
            </div>
            <div className="relative grid md:grid-cols-2 gap-8 md:items-center">
              <div>
                <p className="flex items-center gap-2 text-sm text-blue-100 font-medium"><Wallet size={18} /> Your Web3 wallet balance</p>
                <p className="text-4xl md:text-5xl font-bold tracking-tight tabular-nums mt-4 break-words">{loading ? "—" : formatToken(balance, { showSymbol: false })}</p>
                <div className="wallet-token-scene" aria-hidden="true"><span className="wallet-token"><span className="wallet-token-front">$</span><span className="wallet-token-back">✦</span></span><span className="wallet-token-shadow" /></div>
                <p className="text-sm text-blue-100 mt-3">mUSDC test tokens · Funded by your parent</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 p-5">
                <p className="text-sm text-blue-100">You can spend today</p>
                <p className="text-3xl font-bold tabular-nums mt-1">{loading ? "—" : formatToken(spendableToday, { showSymbol: false })}</p>
                <p className="text-xs text-blue-100 mt-2">{dailyLimit > 0n ? "Based on your balance and remaining daily limit" : "No daily limit set"}</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <button onClick={() => openModal("direct")} disabled={!canPay} aria-describedby="payment-hint" className="kid-action flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send size={16} /> Pay a dApp</button>
                  <button onClick={() => openModal("request")} disabled={loading || !!error} className="kid-action flex items-center justify-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Clock size={16} /> Request payment</button>
                </div>
                <p id="payment-hint" className="text-xs text-blue-100 mt-3">{paymentHint}</p>
              </div>
            </div>
          </section>

          <div role="status" aria-live="polite" aria-atomic="true">
            {successMessage && <div className="kid-success flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 mb-6 text-emerald-800"><Star className="flex-shrink-0" size={22} aria-hidden="true" /><p className="font-semibold">{demoMode ? "Practice mode: " : ""}{successMessage}</p></div>}
          </div>

          <section className="kid-guide flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 mb-6 rounded-3xl border border-violet-200 bg-violet-50" aria-label="Web3 explorer tips">
            <button type="button" onClick={() => setTipIndex((index) => (index + 1) % tips.length)} className="kid-mascot flex-shrink-0 w-16 h-16 rounded-2xl bg-white text-4xl shadow-sm" aria-label="Show another Web3 tip"><span aria-hidden="true">🚀</span></button>
            <div className="flex-1 min-w-0"><p className="font-bold text-violet-900 flex items-center gap-2"><Sparkles size={17} aria-hidden="true" /> Web3 explorer tip</p><p className="text-sm text-violet-800 mt-1" aria-live="polite">{tips[tipIndex]}</p></div>
            <button type="button" onClick={() => setTipIndex((index) => (index + 1) % tips.length)} className="kid-action min-h-11 inline-flex items-center gap-1 text-sm font-semibold text-violet-800 rounded-xl bg-white px-4 py-3">Next tip <ChevronRight size={16} aria-hidden="true" /></button>
          </section>

          <DappExplorer recipients={approvedRecipients} demoMode={demoMode} loading={loading} canPay={canPay} onChoose={openModal} motionDisabled={motionPaused || reducedMotion} />

          <div className="mt-6 kid-stats grid sm:grid-cols-3 gap-4 mb-6">
            <StatCard title="Onchain spend today" value={formatToken(dailySpent, { showSymbol: false })} subtitle={dailyLimit > 0n ? `Daily limit: ${formatToken(dailyLimit, { showSymbol: false })}` : "No daily limit set"} icon={<TrendingUp size={20} />} iconBg="bg-amber-50" iconColor="text-amber-600" loading={loading} />
            <StatCard title="Available today" value={formatToken(spendableToday, { showSymbol: false })} subtitle="Within your allowance and daily budget" icon={<Wallet size={20} />} iconBg="bg-emerald-50" iconColor="text-emerald-600" loading={loading} />
            <StatCard title="Waiting for approval" value={String(pendingCount)} subtitle={pendingCount === 1 ? "Payment request with your parent" : "Payment requests with your parent"} icon={<Clock size={20} />} iconBg="bg-purple-50" iconColor="text-purple-600" loading={loading} />
          </div>

          {/* ══════════════ DAILY LIMIT PROGRESS BAR ══════════════ */}
          <div className="card child-budget mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Gauge size={16} className={isAtLimit ? "text-red-500" : "text-cyan-600"} />
                <h3 className="section-title">Your daily spending meter</h3>
              </div>
              <span className={`text-sm font-bold tabular-nums ${isAtLimit ? "text-red-600" : "text-gray-700"}`}>
                {dailyLimit > 0n ? `${formatToken(dailySpent)} / ${formatToken(dailyLimit)}` : "No daily limit set"}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden mb-2">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${limitPct >= 100 ? "bg-red-500" : limitPct >= 80 ? "bg-amber-400" : "bg-cyan-500"}`}
                style={{ width: `${limitPct}%` }}
                role="progressbar" aria-label="Daily spending limit used" aria-valuenow={limitPct} aria-valuemin={0} aria-valuemax={100}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{limitPct}% used</span>
              {isAtLimit
                ? <span className="text-red-500 font-semibold">Limit reached — resets midnight UTC</span>
                : <span className="text-emerald-600 font-semibold">{formatToken(spendableToday)} available to spend today</span>}
            </div>
            <details className="budget-help mt-4 rounded-xl border border-cyan-300/20 px-4 py-2">
              <summary className="cursor-pointer min-h-11 flex items-center text-sm font-semibold text-cyan-100">What can I spend today?</summary>
              <p className="text-sm text-blue-100 pb-3">{loading ? "Loading your budget…" : <>You have {formatToken(balance, { showSymbol: false })} in your allowance. {dailyLimit > 0n ? `Your daily limit leaves ${formatToken(dailyRem, { showSymbol: false })} today.` : "Your parent hasn’t set a daily limit."} You can pay up to {formatToken(spendableToday, { showSymbol: false })} today. Choose an approved app, then review your amount.</>}</p>
            </details>
          </div>

          {/* ══════════════ MAIN GRID ══════════════ */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* Spending chart */}
              <div className="card child-chart">
                <h3 className="section-title">Your Web3 spending this week</h3>
                <p className="text-sm text-gray-500 mt-1 mb-5">Last 7 calendar days · UTC</p>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={chartData} accessibilityLayer>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#355473" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#b6cbe3" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#b6cbe3" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""} formatter={(v) => [`$${Number(v).toFixed(2)}`, "Spent"]} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }} />
                    <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} fill="url(#cg)" isAnimationActive={!reducedMotion && !motionPaused} animationDuration={800} activeDot={{ r: 7 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent spending table */}
              <TransactionTable
                transactions={transactions}
                loading={loading}
                demoMode={demoMode}
                title="My onchain payment history"
                className="child-history"
              />
            </div>

            {/* Right */}
            <div className="space-y-6">

              {/* My requests */}
              <div className="card child-requests">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-brand-light" />
                  <h3 className="section-title">My Requests</h3>
                </div>
                {loading ? (
                  <div className="flex justify-center py-6"><LoadingSpinner size="md" /></div>
                ) : requests.length === 0 ? (
                  <div className="empty-state py-8">
                    <Clock size={28} className="text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm font-medium">No requests yet</p>
                    <p className="text-gray-500 text-xs mt-1">Use "Request payment" to ask your parent.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {requests.slice(0, 6).map((req) => (
                      <li key={String(req.id)} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 tabular-nums">{formatToken(req.amount)}</p>
                          {req.memo && <p className="text-xs text-gray-500 truncate">{req.memo}</p>}
                        </div>
                        <RequestStatusBadge status={req.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Approved dApps */}
              <div className="card child-approved">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <h3 className="section-title">Approved dApps</h3>
                  <span className="ml-auto text-xs text-gray-400">{approvedRecipients.length} dApps</span>
                </div>
                {loading ? (
                  <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
                ) : approvedRecipients.length === 0 ? (
                  <div className="bg-blue-50 rounded-xl px-4 py-4 text-center">
                    <Info size={18} className="text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-blue-600 font-medium">No approved dApps yet</p>
                    <p className="text-xs text-blue-400 mt-0.5">Ask your parent to add some.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {approvedRecipients.map((addr, index) => (
                      <li key={addr} className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2.5">
                        <Blocks size={16} className="text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0"><p className="text-sm font-medium text-gray-800">{demoMode ? MOCK_APPROVED_RECIPIENTS.find((dApp) => dApp.address.toLowerCase() === addr.toLowerCase())?.label ?? `dApp ${index + 1}` : `dApp ${index + 1}`}</p><p className="font-mono text-xs text-gray-500 truncate" title={addr}>{shortenAddress(addr, 6)}</p></div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <section className="card kid-quiz" aria-labelledby="money-quiz-title">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Web3 mini mission</p>
                <h3 id="money-quiz-title" className="section-title">Check before you confirm <span aria-hidden="true">🔎</span></h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">A dApp shows a different payment address from the one your parent approved. What should you do?</p>
                <div className="grid grid-cols-2 gap-3">
                  {["check", "send"].map((answer) => <button key={answer} type="button" aria-pressed={quizAnswer === answer} onClick={() => setQuizAnswer(answer)} className={`kid-action rounded-xl border-2 px-4 py-3 text-sm font-bold ${quizAnswer === answer ? "border-violet-500 bg-violet-100 text-violet-900" : "border-violet-100 bg-white text-violet-800"}`}>{answer === "check" ? "Ask my parent" : "Send anyway"}</button>)}
                </div>
                <div aria-live="polite" className="mt-4 text-sm text-violet-900">
                  {quizAnswer === "check" ? "⭐ Mission complete! Check the address with your parent before preparing a payment." : quizAnswer === "send" ? "Take another look! The address should match the one your parent approved." : "Choose your next move."}
                </div>
              </section>

              <details className="card kid-details">
                <summary className="font-semibold text-brand cursor-pointer py-1">💡 How my allowance works</summary>
                <ul className="space-y-3 text-sm text-gray-600 mt-4">
                  <li>You can pay dApps your parent approved.</li>
                  <li>Your daily limit resets at midnight UTC.</li>
                  <li>A payment request asks your parent to approve a purchase.</li>
                </ul>
              </details>
            </div>
          </div>
        </main>
      </div>

      <RequestModal
        key={`${modalMode}-${selectedApp?.address ?? "all"}-${modalOpen}`}
        initialRecipient={selectedApp?.address ?? ""}
        recipientLabels={demoMode ? Object.fromEntries(MOCK_APPROVED_RECIPIENTS.map((app) => [app.address.toLowerCase(), app.label])) : {}}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        approvedRecipients={approvedRecipients}
        allowanceBalance={balance}
        dailyLimit={dailyLimit}
        dailySpent={dailySpent}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

function buildTrend(transactions) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = today.getTime() - 6 * 86_400_000;
  const totals = Array(7).fill(0);
  transactions.forEach((tx) => {
    if (tx.status !== "success") return;
    const ms = Number(tx.timestamp) * 1000;
    const index = Math.floor((ms - start) / 86_400_000);
    if (index >= 0 && index < 7 && ms <= Date.now()) totals[index] += toHuman(tx.amount);
  });
  return totals.map((amount, index) => {
    const date = new Date(start + index * 86_400_000);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      amount: Number(amount.toFixed(2)),
    };
  });
}
