/**
 * mockData.js
 * -----------
 * Clearly-labelled DEMO MODE data used when:
 *   - MetaMask is not connected, or
 *   - VITE_DEMO_MODE=true in .env, or
 *   - Contract addresses are not configured.
 *
 * IMPORTANT: Mock data is never passed off as real on-chain transactions.
 * Every mock value is explicitly typed so components can show a "Demo" badge.
 */

import { RequestStatus } from "@/utils/constants";

// ─── Addresses ────────────────────────────────────────────────────────────────
export const MOCK_PARENT_ADDRESS  = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
export const MOCK_CHILD_ADDRESS   = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
export const MOCK_RECIPIENT_1     = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";
export const MOCK_RECIPIENT_2     = "0x90f79bf6eb2c4f870365e785982e1f101e93b906";
export const MOCK_RECIPIENT_3     = "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65";

// ─── Child profile ────────────────────────────────────────────────────────────
export const MOCK_CHILD_DETAILS = {
  parent:           MOCK_PARENT_ADDRESS,
  allowanceBalance: 465_000_000n,   // $465.00 remaining
  dailyLimit:       50_000_000n,    // $50.00/day
  dailySpent:       35_000_000n,    // $35.00 spent today
  registered:       true,
};

// ─── Approved recipients ──────────────────────────────────────────────────────
export const MOCK_APPROVED_RECIPIENTS = [
  { address: MOCK_RECIPIENT_1, label: "Pixel Quest", category: "Games", description: "A fictional Web3 game for exploring avatar and game-item payments." },
  { address: MOCK_RECIPIENT_2, label: "Creator Lab", category: "Create", description: "A fictional creative dApp for exploring digital art and creation tools." },
  { address: MOCK_RECIPIENT_3, label: "Orbit Academy", category: "Learn", description: "A fictional learning dApp for exploring Web3 lessons and learning passes." },
];

// ─── Token balances ───────────────────────────────────────────────────────────
export const MOCK_PARENT_TOKEN_BALANCE = 1_500_000_000n;  // $1,500
export const MOCK_CHILD_TOKEN_BALANCE  =   465_000_000n;  // $465

// ─── Transactions ─────────────────────────────────────────────────────────────
const now = Math.floor(Date.now() / 1000);
const DAY = 86_400;

export const MOCK_TRANSACTIONS = [
  {
    txHash:    "0xabc1230000000000000000000000000000000000000000000000000000000001",
    child:     MOCK_CHILD_ADDRESS,
    recipient: MOCK_RECIPIENT_3,
    amount:    8_000_000n,
    requestId: 0n,
    timestamp: BigInt(now - 3600),
    blockNumber: 42,
    type:      "Direct Payment",
    status:    "success",
    label:     "Orbit Academy",
  },
  {
    txHash:    "0xabc1230000000000000000000000000000000000000000000000000000000002",
    child:     MOCK_CHILD_ADDRESS,
    recipient: MOCK_RECIPIENT_1,
    amount:    12_000_000n,
    requestId: 0n,
    timestamp: BigInt(now - 7200),
    blockNumber: 41,
    type:      "Direct Payment",
    status:    "success",
    label:     "Pixel Quest",
  },
  {
    txHash:    "0xabc1230000000000000000000000000000000000000000000000000000000003",
    child:     MOCK_CHILD_ADDRESS,
    recipient: MOCK_RECIPIENT_2,
    amount:    15_000_000n,
    requestId: 1n,
    timestamp: BigInt(now - DAY),
    blockNumber: 38,
    type:      "Approved Request",
    status:    "success",
    label:     "Creator Lab",
  },
  {
    txHash:    "0xabc1230000000000000000000000000000000000000000000000000000000004",
    child:     MOCK_CHILD_ADDRESS,
    recipient: MOCK_RECIPIENT_1,
    amount:    20_000_000n,
    requestId: 2n,
    timestamp: BigInt(now - DAY * 2),
    blockNumber: 35,
    type:      "Approved Request",
    status:    "success",
    label:     "Pixel Quest",
  },
  {
    txHash:    null,
    child:     MOCK_CHILD_ADDRESS,
    recipient: MOCK_RECIPIENT_3,
    amount:    60_000_000n,
    requestId: 3n,
    timestamp: BigInt(now - DAY * 2 - 3600),
    blockNumber: null,
    type:      "Direct Payment",
    status:    "rejected",
    label:     "Orbit Academy",
    rejectReason: "Daily limit exceeded",
  },
];

// ─── Spending requests ────────────────────────────────────────────────────────
export const MOCK_REQUESTS = [
  {
    id:         BigInt(4),
    child:      MOCK_CHILD_ADDRESS,
    recipient:  MOCK_RECIPIENT_1,
    amount:     25_000_000n,
    memo:       "Pixel Quest avatar purchase",
    status:     RequestStatus.Pending,
    createdAt:  BigInt(now - 1800),
    resolvedAt: 0n,
    label:      "Pixel Quest",
  },
  {
    id:         BigInt(3),
    child:      MOCK_CHILD_ADDRESS,
    recipient:  MOCK_RECIPIENT_3,
    amount:     60_000_000n,
    memo:       "Orbit Academy learning pass",
    status:     RequestStatus.Rejected,
    createdAt:  BigInt(now - DAY * 2 - 3600),
    resolvedAt: BigInt(now - DAY * 2),
    label:      "Orbit Academy",
  },
  {
    id:         BigInt(2),
    child:      MOCK_CHILD_ADDRESS,
    recipient:  MOCK_RECIPIENT_1,
    amount:     20_000_000n,
    memo:       "Creator Lab digital art tools",
    status:     RequestStatus.Approved,
    createdAt:  BigInt(now - DAY * 2 - 7200),
    resolvedAt: BigInt(now - DAY * 2),
    label:      "Pixel Quest",
  },
  {
    id:         BigInt(1),
    child:      MOCK_CHILD_ADDRESS,
    recipient:  MOCK_RECIPIENT_2,
    amount:     15_000_000n,
    memo:       "Creator Lab creation pack",
    status:     RequestStatus.Approved,
    createdAt:  BigInt(now - DAY - 3600),
    resolvedAt: BigInt(now - DAY),
    label:      "Creator Lab",
  },
];

// ─── Spending chart data (for the parent dashboard bar chart) ─────────────────
export const MOCK_WEEKLY_SPENDING = [
  { day: "Mon", amount: 12 },
  { day: "Tue", amount: 0  },
  { day: "Wed", amount: 8  },
  { day: "Thu", amount: 15 },
  { day: "Fri", amount: 35 },
  { day: "Sat", amount: 0  },
  { day: "Sun", amount: 0  },
];

// ─── Parent summary stats ─────────────────────────────────────────────────────
export const MOCK_PARENT_STATS = {
  totalAllocated:  500_000_000n,   // $500 allocated this month
  childBalance:    465_000_000n,   // $465 remaining
  todaySpending:    35_000_000n,   // $35 spent today
  pendingRequests: 1,
};
