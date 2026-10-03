// Local demonstration only. Production authorization and settlement belong on a server.
export const everydayMoney = (paise) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
export const initialEveryday = () => ({ version: 1, balance: 100000, dailyLimit: 20000, approved: {}, requests: [] });
const utcDay = (now) => new Date(now).toISOString().slice(0, 10);
export function everydayAvailable(state, now = Date.now()) {
  const reserved = state.requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const spent = state.requests.filter(r => r.status === 'paid' && utcDay(r.resolvedAt) === utcDay(now)).reduce((sum, r) => sum + r.amount, 0);
  return Math.max(0, Math.min(state.balance - reserved, state.dailyLimit - spent - reserved));
}
export function everydayWarnings(state, request, now = Date.now()) {
  const warnings = [];
  if (!state.approved[request.merchantId]) warnings.push('First payment to this merchant. Its identity has not been verified.');
  if (request.amount >= 10000) warnings.push('This purchase uses at least half of the ₹200 daily demo budget.');
  if (request.category === 'Gift cards / digital codes') warnings.push('Gift cards and digital codes may be difficult to recover after payment.');
  if (request.category === 'Other / unknown') warnings.push('The purchase category is unclear. Check what is being bought.');
  if (state.requests.filter(r => r.merchantId === request.merchantId && now - r.createdAt < 600000).length >= 2) warnings.push('Multiple attempts at this merchant within 10 minutes. Check for duplicate purchases.');
  return warnings;
}
export function submitEveryday(state, input, role, now = Date.now(), id = crypto.randomUUID()) {
  if (role !== 'child') throw new Error('Open Child view to prepare a purchase.');
  const merchantId = String(input.merchantId ?? '').trim().toLowerCase();
  const merchantName = String(input.merchantName ?? '').trim();
  const item = String(input.item ?? '').trim();
  if (!/^[a-z0-9][a-z0-9@._-]{2,79}$/.test(merchantId)) throw new Error('Enter a merchant payment ID (3–80 letters, numbers, @, dots, hyphens or underscores).');
  if (!merchantName || merchantName.length > 80 || !item || item.length > 120) throw new Error('Enter a shop name and a short description of the purchase.');
  if (!['Snacks / groceries', 'School supplies', 'Gift cards / digital codes', 'Other / unknown'].includes(input.category)) throw new Error('Choose a purchase category.');
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error('Enter a valid amount greater than zero.');
  if (input.amount > everydayAvailable(state, now)) throw new Error('This exceeds your available demo budget, including requests waiting for approval.');
  if (state.requests.some(r => r.status === 'pending' && r.merchantId === merchantId && r.amount === input.amount && r.item === item)) throw new Error('This purchase is already waiting for approval.');
  const request = { id, merchantId, merchantName, item, category: input.category, amount: input.amount, createdAt: now };
  const warnings = everydayWarnings(state, request, now);
  // Even an approved merchant requires review if a warning signal is present.
  const status = state.approved[merchantId] && warnings.length === 0 ? 'paid' : 'pending';
  return { ...state, balance: state.balance - (status === 'paid' ? request.amount : 0), requests: [{ ...request, warnings, status, resolvedAt: status === 'paid' ? now : null }, ...state.requests] };
}
export function reviewEveryday(state, id, decision, remember, role, now = Date.now()) {
  if (role !== 'parent') throw new Error('Only Parent view can review a purchase.');
  if (!['approve', 'reject'].includes(decision)) throw new Error('Choose approve or reject.');
  const request = state.requests.find(r => r.id === id);
  if (!request || request.status !== 'pending') throw new Error('This request has already been reviewed or no longer exists.');
  if (decision === 'approve') {
    const withoutThis = { ...state, requests: state.requests.filter(r => r.id !== id) };
    if (request.amount > everydayAvailable(withoutThis, now)) throw new Error('The current balance or daily limit no longer covers this payment.');
  }
  return { ...state, balance: state.balance - (decision === 'approve' ? request.amount : 0), approved: decision === 'approve' && remember ? { ...state.approved, [request.merchantId]: request.merchantName } : state.approved, requests: state.requests.map(r => r.id === id ? { ...r, status: decision === 'approve' ? 'paid' : 'rejected', resolvedAt: now } : r) };
}
