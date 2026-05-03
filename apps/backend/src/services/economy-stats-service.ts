import { prisma } from "../lib/prisma.js";
import { economyEvents } from "../lib/economy-events.js";
import type { EconomyEvent } from "@cubs/shared";

// ─── Economy Stats Tracking Service ───────────────────
//
// Fire-and-forget daily stat aggregation.  Every economy
// event increments the appropriate counter for today's row
// using upsert (create-or-increment).
//
// Failures are logged and silently swallowed — stats must
// NEVER break the critical path of any economy operation.
// ─────────────────────────────────────────────────────────

function todayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function incrementStat(field: "totalPawsEarned" | "totalPawsSpent" | "cratesOpened" | "traitsMinted", amount = 1) {
  const date = todayUTC();

  await prisma.economyStatsDaily.upsert({
    where: { date },
    create: { date, [field]: amount },
    update: { [field]: { increment: amount } },
  });
}

// ─── Event Listeners ──────────────────────────────────

function safeHandler(handler: (event: EconomyEvent) => Promise<void>) {
  return (event: EconomyEvent) => {
    handler(event).catch((err) => {
      console.warn("Economy stats tracking error (non-fatal):", err);
    });
  };
}

economyEvents.on(
  "paws_earned",
  safeHandler(async (event) => {
    const amount = (event.data as { amount?: number })?.amount ?? 0;
    if (amount > 0) await incrementStat("totalPawsEarned", amount);
  }),
);

economyEvents.on(
  "paws_spent",
  safeHandler(async (event) => {
    const amount = (event.data as { amount?: number })?.amount ?? 0;
    if (amount > 0) await incrementStat("totalPawsSpent", amount);
  }),
);

economyEvents.on(
  "crate_opened",
  safeHandler(async (event) => {
    await incrementStat("cratesOpened");
    const rewardType = (event.data as { rewardType?: string })?.rewardType;
    if (rewardType === "TRAIT") {
      await incrementStat("traitsMinted");
    }
  }),
);

economyEvents.on(
  "staking_claimed",
  safeHandler(async (event) => {
    const totalClaimed = (event.data as { totalClaimed?: number })?.totalClaimed ?? 0;
    if (totalClaimed > 0) await incrementStat("totalPawsEarned", totalClaimed);
  }),
);
