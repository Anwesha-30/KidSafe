# Everyday payment prototype

Everyday payments currently run as a local browser demo, independent of the onchain mUSDC allowance. No bank, card, or UPI transfer occurs. Each browser starts with ₹1,000 and a ₹200 daily spending limit (UTC). There is one shared demo household in that browser, not a separate ledger per connected account.

## Try the workflow

1. Enter Child view and submit a purchase with a shop name, merchant payment ID, item, category, and amount.
2. A new merchant creates a pending request. The balance is unchanged, and the request reserves part of the available budget.
3. Sign out and enter Parent view in the same browser. Review the everyday-payment request and its warning reasons.
4. Acknowledge the warnings before approving. Approval completes only the simulated payment; rejection releases the reservation without spending.
5. Optionally allow future payments to that merchant ID. Without this explicit choice, approval covers only that purchase.
6. Return to Child view to see the result. Remembered merchants can receive simulated payments within budget, but warnings route purchases back to the parent.

Warning rules cover first-time merchants, purchases of ₹100 or more, gift cards/digital codes, unknown categories, and three or more merchant attempts within ten minutes. These are explainable review signals based on user-entered data, not fraud detection, merchant verification, or item verification. Lack of a warning is not a safety guarantee.

The state machine checks available balance and daily budget at submission and approval, reserves pending purchases, rejects duplicate pending purchases, and prevents approving a resolved request twice. Role checks demonstrate the workflow only. Browser storage can be changed by its owner and cannot provide authorization or concurrent settlement guarantees.

## Before real payments

Use a payment provider and a server-side household ledger. Authenticate the parent/child relationship on the server; verify merchant identity using provider IDs, not names or child-entered IDs. Store immutable purchase details and merchant-specific permissions. Review policy and warning signals on the server before initiating any payment. Approval must authorize exactly one request and amount, with idempotency, atomic reservations, expiry, and current-budget checks.

Separate approval from settlement: authorized → processing → paid or failed. Only a verified provider result/webhook can mark a payment paid. Handle rejection, cancellation, expiry, failed settlement, refunds, merchant permission revocation, and duplicate webhooks. Add parent notifications and an audit history. Never use this browser demo as a real payment authorization layer.

## Checks

Run `node --test frontend/src/services/__tests__/everydayModel.test.js` from the repository root, then `npm run build --prefix frontend`.
