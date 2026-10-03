import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, AlertTriangle, Camera, Upload, X, PlusCircle } from 'lucide-react';
import { useEverydayPayments } from '@/hooks/useEverydayPayments';
import { everydayAvailable, everydayMoney } from '@/services/everydayModel';
import QRScanner from '@/components/QRScanner';
import { parseUpiQr } from '@/utils/parseUpiQr';

export default function EverydayPayments({ mode }) {
  const { state, error, submit, review, topup } = useEverydayPayments();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [remember, setRemember] = useState({});
  const [acknowledged, setAcknowledged] = useState({});
  const [form, setForm] = useState({ merchantName: '', merchantId: '', item: '', amount: '', category: 'Snacks / groceries' });
  const [qrOpen, setQrOpen] = useState(false);
  const [qrFeedback, setQrFeedback] = useState('');
  const [topupAmt, setTopupAmt] = useState('');
  const [topupOpen, setTopupOpen] = useState(false);
  const pending = state.requests.filter(r => r.status === 'pending');
  function change(key, value) { setForm(current => ({ ...current, [key]: value })); }

  function handleQrResult(rawText) {
    setQrOpen(false);
    const parsed = parseUpiQr(rawText);
    if (!parsed) {
      setQrFeedback(`QR read, but not a UPI payment code. You can enter the details manually. (Raw: ${rawText.slice(0, 60)})`);
      return;
    }
    setForm(current => ({
      ...current,
      merchantId:   parsed.merchantId   || current.merchantId,
      merchantName: parsed.merchantName || current.merchantName,
      amount:       parsed.amount       || current.amount,
      item:         parsed.item         || current.item,
    }));
    setQrFeedback(`QR scanned ✓  — details filled in below. Check the Merchant UPI ID with the merchant.`);
  }
  function handleSubmit(event) {
    event.preventDefault(); setActionError(''); setMessage('');
    try {
      if (!/^\d+(\.\d{1,2})?$/.test(form.amount)) throw new Error('Enter an amount with up to two decimal places.');
      const next = submit({ ...form, amount: Math.round(Number(form.amount) * 100) });
      setMessage(next.requests[0].status === 'paid' ? 'Demo payment completed to your approved merchant.' : 'Sent to your parent. No payment happens until they approve.');
      setForm(current => ({ ...current, item: '', amount: '' }));
    } catch (err) { setActionError(err.message); }
  }
  function decide(request, decision) {
    setActionError(''); setMessage('');
    try { review(request.id, decision, !!remember[request.id]); setMessage(decision === 'approve' ? 'Approved: the demo payment is complete.' : 'Declined: no payment was made.'); } catch (err) { setActionError(err.message); }
  }
  function handleTopup(e) {
    e.preventDefault(); setActionError(''); setMessage('');
    try {
      if (!/^\d+(\.\d{1,2})?$/.test(topupAmt)) throw new Error('Enter a valid amount.');
      topup(Math.round(Number(topupAmt) * 100));
      setMessage(`₹${parseFloat(topupAmt).toFixed(2)} added to the everyday cash balance.`);
      setTopupAmt('');
      setTopupOpen(false);
    } catch (err) { setActionError(err.message); }
  }
  return <section className="card everyday-payments mb-6" aria-labelledby={`everyday-title-${mode}`}>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><h2 id={`everyday-title-${mode}`} className="section-title flex items-center gap-2"><ShoppingBag size={20} /> Everyday payments</h2><span className="badge-info">Local demo · INR</span></div>
    <p className="text-sm text-gray-600 mb-4">{mode === 'child' ? 'Buying a snack or school supplies? New shops always need your parent’s approval.' : 'Review everyday purchases before the child’s first payment to a merchant.'}</p>
    <p className="text-xs text-gray-500 mb-4">One shared demo household in this browser (independent of selected child). Separate ₹1,000 demo allowance / ₹200 daily limit. Saved only in this browser; no bank, card or UPI payment is made. This is separate from the crypto allowance.</p>
    <div className="everyday-summary rounded-xl bg-blue-50 p-3 mb-4 text-sm text-blue-900">Balance: <strong>{everydayMoney(state.balance)}</strong> · Available today: <strong>{everydayMoney(everydayAvailable(state))}</strong> · Waiting: <strong>{pending.length}</strong></div>
    {(error || actionError) && <p role="alert" className="rounded-xl bg-red-50 text-red-700 p-3 mb-4 text-sm">{error || actionError}</p>}
    <p role="status" className="text-sm text-emerald-700 mb-3">{message}</p>
    {mode === 'child' && <>
      {/* ── QR scanner block ──────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
        {qrOpen
          ? <QRScanner onResult={handleQrResult} onClose={() => { setQrOpen(false); setQrFeedback(''); }} />
          : <div className="flex flex-col gap-3">
              <div className="flex gap-3 flex-wrap">
                <button type="button" onClick={() => { setQrOpen(true); setQrFeedback(''); }} className="btn-secondary flex items-center gap-2">
                  <Camera size={15} /> Scan UPI QR
                </button>
                <button type="button" onClick={() => { setQrOpen(true); setQrFeedback(''); }} className="btn-secondary flex items-center gap-2">
                  <Upload size={15} /> Upload QR
                </button>
              </div>
              <p className="text-xs text-gray-500">QR images are read on your device. No payment app is opened and no payment is sent. You can also enter the UPI ID below.</p>
              {qrFeedback && (
                <p className={`text-xs rounded-xl p-2 ${qrFeedback.startsWith('QR scanned') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                  {qrFeedback}
                </p>
              )}
            </div>
        }
      </div>

      {/* ── Manual entry form ─────────────────────────── */}
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mb-6">
        <label className="input-label">Shop name<input className="input mt-1" maxLength={80} value={form.merchantName} onChange={e => change('merchantName', e.target.value)} placeholder="e.g. Corner Snacks" /></label>
        <label className="input-label">Merchant UPI ID<input className="input mt-1" required maxLength={80} value={form.merchantId} onChange={e => change('merchantId', e.target.value)} placeholder="e.g. shop@bank" /><span className="block text-xs text-gray-500 mt-1">Check this UPI ID with the merchant. Format validation does not verify ownership.</span></label>
        <label className="input-label">What are you buying?<input className="input mt-1" required maxLength={120} value={form.item} onChange={e => change('item', e.target.value)} placeholder="e.g. Chips and chocolate" /></label>
        <label className="input-label">Amount (₹)<input className="input mt-1" required inputMode="decimal" value={form.amount} onChange={e => change('amount', e.target.value)} placeholder="40.00" /></label>
        <label className="input-label">Purchase category<select className="input mt-1" value={form.category} onChange={e => change('category', e.target.value)}>{['Snacks / groceries', 'School supplies', 'Gift cards / digital codes', 'Other / unknown'].map(category => <option key={category}>{category}</option>)}</select></label>
        <div className="flex items-end pb-1"><button type="submit" disabled={!!error} className="btn-primary w-full"><ShieldCheck size={16} /> Review purchase</button></div>
      </form>
    </>}
    {mode === 'parent' && <>
      {/* ── Top-up panel ─────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
        {topupOpen ? (
          <form onSubmit={handleTopup} className="flex flex-wrap items-end gap-3">
            <label className="input-label flex-1 min-w-[140px]">
              Add cash (₹)
              <input
                className="input mt-1"
                required
                inputMode="decimal"
                placeholder="e.g. 500"
                value={topupAmt}
                onChange={e => setTopupAmt(e.target.value)}
                autoFocus
              />
            </label>
            <div className="flex gap-2 pb-1">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <PlusCircle size={15} /> Add cash
              </button>
              <button type="button" className="btn-ghost" onClick={() => { setTopupOpen(false); setTopupAmt(''); }}>
                <X size={15} />
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => { setTopupOpen(true); setActionError(''); setMessage(''); }}
            className="btn-secondary flex items-center gap-2"
          >
            <PlusCircle size={15} /> Add cash to everyday balance
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">Warnings use simple rules on child-entered details, not verified merchant data or fraud detection. No warning does not guarantee a safe purchase. Check the merchant and item with your child.</p>
    </>}
    {mode !== 'parent' && null}
    <ul className="space-y-3">{state.requests.map(request => <li key={request.id} className="everyday-request rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap justify-between gap-2"><strong>{request.merchantName} · {everydayMoney(request.amount)}</strong><span className={request.status === 'paid' ? 'badge-success' : request.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>{request.status === 'paid' ? 'Demo paid' : request.status === 'rejected' ? 'Declined · not paid' : 'Waiting · not paid'}</span></div>
      <p className="text-sm text-gray-600 mt-2">{request.item} · {request.category}</p><p className="text-xs text-gray-500 mt-1 break-all">Payment ID: {request.merchantId}</p>
      {mode === 'parent' && request.status === 'pending' && <>
        {request.warnings.length > 0 && <div className="rounded-xl bg-amber-50 text-amber-900 p-3 mt-3 text-sm"><p className="font-semibold flex items-center gap-2"><AlertTriangle size={15} /> Check before approving</p><ul className="list-disc pl-5 mt-2 space-y-1">{request.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div>}
        <label className="flex gap-2 items-start text-sm mt-3"><input type="checkbox" checked={!!remember[request.id]} onChange={e => setRemember(current => ({ ...current, [request.id]: e.target.checked }))} />Allow future payments to this merchant without first-time approval. Warning signals still require review.</label>
        {request.warnings.length > 0 && <label className="flex gap-2 items-start text-sm mt-3"><input type="checkbox" checked={!!acknowledged[request.id]} onChange={e => setAcknowledged(current => ({ ...current, [request.id]: e.target.checked }))} />I checked these warning signals and the payment details.</label>}
        <div className="flex flex-wrap gap-3 mt-4"><button type="button" className="btn-danger" onClick={() => decide(request, 'reject')}>Decline</button><button type="button" className="btn-primary" disabled={!!error || (request.warnings.length > 0 && !acknowledged[request.id])} onClick={() => decide(request, 'approve')}>Approve & pay (demo)</button></div>
      </>}
    </li>)}</ul>
    {!state.requests.length && <p className="text-sm text-gray-500 py-3">{mode === 'child' ? 'Your everyday purchases will appear here.' : 'No everyday purchase requests yet. Try one from Child view in this browser.'}</p>}
  </section>;
}
