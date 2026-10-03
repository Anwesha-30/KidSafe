import { useEffect, useState } from 'react';
import { initialEveryday, submitEveryday, reviewEveryday, topupEveryday } from '@/services/everydayModel';
import { useWallet } from './useWallet';
const KEY = 'kidsafe_everyday_demo_v1';
const EVENT = 'kidsafe-everyday-demo';
function read() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialEveryday();
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Number.isSafeInteger(data.balance) || !Array.isArray(data.requests) || !data.approved) throw new Error('The everyday demo data could not be loaded.');
  return data;
}
export function useEverydayPayments() {
  const { role } = useWallet();
  const [state, setState] = useState(initialEveryday);
  const [error, setError] = useState('');
  useEffect(() => {
    function sync() { try { setState(read()); setError(''); } catch { setError('Unable to load the local everyday-payment demo. Check browser storage access.'); } }
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT, sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener(EVENT, sync); };
  }, []);
  function update(action) {
    const next = action(read());
    localStorage.setItem(KEY, JSON.stringify(next));
    setState(next);
    window.dispatchEvent(new Event(EVENT));
    return next;
  }
  return { state, error, submit: input => update(current => submitEveryday(current, input, role)), review: (id, decision, remember) => update(current => reviewEveryday(current, id, decision, remember, role)), topup: amountPaise => update(current => topupEveryday(current, amountPaise, role)) };
}
