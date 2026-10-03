import React, { useState } from "react";
import { Gamepad2, Palette, Rocket, Blocks, ArrowRight, CheckCircle2 } from "lucide-react";
import TiltButton from "./TiltButton";
import { shortenAddress } from "@/utils/formatAddress";
import { MOCK_APPROVED_RECIPIENTS } from "@/services/mockData";

const ICONS = { Games: Gamepad2, Create: Palette, Learn: Rocket, Apps: Blocks };
const FILTERS = ["All", "Games", "Create", "Learn"];

export default function DappExplorer({ recipients, demoMode, loading, canPay, onChoose, motionDisabled = false }) {
  const [category, setCategory] = useState("All");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const apps = recipients.map((address, index) => {
    const sample = demoMode ? MOCK_APPROVED_RECIPIENTS.find((app) => app.address.toLowerCase() === address.toLowerCase()) : null;
    return { address, label: sample?.label ?? `Approved dApp ${index + 1}`, category: sample?.category ?? "Apps", description: sample?.description ?? "Your parent approved payments to this address. Check the app and purchase details together before paying." };
  });
  const visible = apps.filter((app) => category === "All" || app.category === category);
  const selected = visible.find((app) => app.address === selectedAddress);

  return (
    <section id="dapp-explorer" className="card dapp-explorer scroll-mt-20" aria-labelledby="dapp-explorer-title">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div><p className="text-xs font-bold tracking-widest uppercase text-violet-700 mb-2">Your Web3 launchpad</p><h2 id="dapp-explorer-title" className="text-2xl font-bold text-gray-900">Explore your approved dApps</h2><p className="text-sm text-gray-600 mt-2">Choose an app, check its address, then prepare a payment.</p></div>
        <span className="badge-success"><CheckCircle2 size={13} /> Parent-approved addresses</span>
      </div>
      {demoMode && <p className="text-xs text-violet-700 mb-4">These are fictional demo apps for practicing payments. No app integrations or digital items are delivered.</p>}
      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filter dApps by category">
        {FILTERS.map((filter) => <button type="button" key={filter} onClick={() => { setCategory(filter); setSelectedAddress(null); }} aria-pressed={category === filter} className={`kid-action rounded-full px-5 py-2 text-sm font-bold ${category === filter ? "bg-violet-700 text-white shadow-lg shadow-violet-100" : "bg-violet-50 text-violet-800 hover:bg-violet-100"}`}>{filter}</button>)}
      </div>
      {loading ? <p role="status" className="py-8 text-center text-gray-600">Loading your approved apps…</p> : visible.length === 0 ? <p className="rounded-2xl bg-violet-50 p-6 text-sm text-violet-900">{recipients.length ? "No approved apps in this category. Try All." : "Your launchpad is waiting! Ask your parent to approve a dApp payment address."}</p> : (
        <div className="grid sm:grid-cols-3 gap-4">
          {visible.map((app, index) => {
            const Icon = ICONS[app.category];
            return <TiltButton motionDisabled={motionDisabled} type="button" key={app.address} aria-pressed={selectedAddress === app.address} aria-controls="selected-dapp-details" onClick={() => setSelectedAddress(app.address)} className={`dapp-tile dapp-tone-${app.category.toLowerCase()} ${selectedAddress === app.address ? "is-selected" : ""}`} style={{ "--tile-delay": `${index * 80}ms` }}>
              {selectedAddress === app.address && <span className="dapp-selected-tag"><CheckCircle2 size={14} aria-hidden="true" /> Selected</span>}
              <span className="dapp-art" aria-hidden="true"><span className="dapp-orbit" /><span className="dapp-icon-platform" /><Icon size={38} strokeWidth={1.7} /><span className="dapp-spark">✦</span></span>
              <span className="block text-xs font-bold uppercase tracking-wider mt-4 opacity-75">{app.category}</span><span className="block text-lg font-bold mt-1">{app.label}</span><span className="flex items-center gap-1 text-sm mt-3 font-semibold">{selectedAddress === app.address ? "Ready to review" : "Choose app"} <ArrowRight size={15} /></span>
            </TiltButton>;
          })}
        </div>
      )}
      <p className="sr-only" role="status">{selected ? `${selected.label} selected. Review its details below.` : "Choose an app to see its details."}</p>
      {selected && <div id="selected-dapp-details" key={selected.address} className="dapp-preview mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
        <p className="text-xs text-gray-500 mb-2">App selected → Choose an amount → Review payment</p>
        <h3 className="font-bold text-violet-950">{selected.label}</h3><p className="text-sm text-violet-900 mt-2">{selected.description}</p><p className="text-xs text-gray-600 mt-3">Approved payment address</p><p className="font-mono text-xs break-all text-gray-700 mt-1" title={selected.address}>{selected.address}</p>
        <div className="flex flex-wrap gap-3 mt-4"><button type="button" className="kid-action btn-primary" disabled={!canPay} onClick={() => onChoose("direct", selected)}>Prepare payment</button><button type="button" className="kid-action btn-secondary" onClick={() => onChoose("request", selected)}>Ask parent to approve payment</button></div>
        <p className="text-xs text-gray-600 mt-3">{!canPay ? "Direct payments need an available balance and daily budget. " : ""}You’ll review the amount before submitting. {shortenAddress(selected.address)} is the recipient.</p>
      </div>}
    </section>
  );
}
