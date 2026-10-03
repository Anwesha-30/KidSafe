/**
 * parseUpiQr.js
 * Parses a UPI deep-link string (upi://pay?...) into payment fields.
 *
 * Standard UPI query params:
 *   pa  — payee address (UPI ID)
 *   pn  — payee name
 *   am  — amount (optional)
 *   tn  — transaction note / item description (optional)
 *   cu  — currency (optional, usually INR)
 */

/**
 * @param {string} raw — the raw QR text
 * @returns {{ merchantId: string, merchantName: string, amount: string, item: string } | null}
 *   Returns null when the string is not a recognisable UPI QR.
 */
export function parseUpiQr(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();

  // Must start with upi:// (case-insensitive)
  if (!/^upi:\/\//i.test(trimmed)) return null;

  let url;
  try {
    // Some QR codes omit the authority, e.g. "upi://pay?pa=..." — add a dummy host so URL parses.
    url = new URL(trimmed.replace(/^upi:\/\//i, 'upi://pay.upi/'));
  } catch {
    return null;
  }

  const pa = url.searchParams.get('pa') ?? '';
  const pn = url.searchParams.get('pn') ?? '';
  const am = url.searchParams.get('am') ?? '';
  const tn = url.searchParams.get('tn') ?? '';

  if (!pa) return null; // payee address is mandatory

  return {
    merchantId:   pa,
    merchantName: pn ? decodeURIComponent(pn) : '',
    amount:       am ? String(parseFloat(am).toFixed(2)) : '',
    item:         tn ? decodeURIComponent(tn) : '',
  };
}
