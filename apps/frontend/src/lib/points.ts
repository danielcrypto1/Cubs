// ─── Points System ──────────────────────────────────────────────────────────
// Replaces token rewards until CUBS token launches.
// Backend-ready: all functions take/return plain data, easy to swap localStorage for API.

export interface PointsBalance {
  total: number;
  earned: {
    staking: number;
    activity: number;
    discord: number;
    achievements: number;
  };
  spent: number;
}

export interface PointsTransaction {
  id: string;
  type: "earn" | "spend";
  source: "staking" | "activity" | "discord" | "achievements" | "crate_purchase" | "item_purchase";
  amount: number;
  description: string;
  timestamp: number;
}

const STORAGE_KEY = "cubs_points";
const HISTORY_KEY = "cubs_points_history";

/** Get current points balance */
export function getPointsBalance(): PointsBalance {
  if (typeof window === "undefined") return defaultBalance();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultBalance();
  } catch {
    return defaultBalance();
  }
}

/** Get transaction history */
export function getPointsHistory(): PointsTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Award points */
export function earnPoints(
  source: PointsTransaction["source"],
  amount: number,
  description: string,
): PointsBalance {
  const balance = getPointsBalance();
  balance.total += amount;

  if (source === "staking") balance.earned.staking += amount;
  else if (source === "discord") balance.earned.discord += amount;
  else if (source === "achievements") balance.earned.achievements += amount;
  else balance.earned.activity += amount;

  saveBalance(balance);
  addTransaction("earn", source, amount, description);
  return balance;
}

/** Spend points (returns false if insufficient) */
export function spendPoints(
  source: PointsTransaction["source"],
  amount: number,
  description: string,
): PointsBalance | null {
  const balance = getPointsBalance();
  if (balance.total - balance.spent < amount) return null;

  balance.spent += amount;
  saveBalance(balance);
  addTransaction("spend", source, amount, description);
  return balance;
}

/** Available (unspent) points */
export function getAvailablePoints(): number {
  const b = getPointsBalance();
  return b.total - b.spent;
}

// ─── Internal ───────────────────────────────────────────────────────────────

function defaultBalance(): PointsBalance {
  return { total: 0, earned: { staking: 0, activity: 0, discord: 0, achievements: 0 }, spent: 0 };
}

function saveBalance(balance: PointsBalance) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balance));
}

function addTransaction(
  type: PointsTransaction["type"],
  source: PointsTransaction["source"],
  amount: number,
  description: string,
) {
  if (typeof window === "undefined") return;
  const history = getPointsHistory();
  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    source,
    amount,
    description,
    timestamp: Date.now(),
  });
  // Keep last 100 transactions
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}
