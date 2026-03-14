"use client";

import { useAuth } from "@/providers/auth-provider";

const ADMIN_WALLETS = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || "")
  .split(",")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

export function useAdmin() {
  const { session, status } = useAuth();

  const isAdmin =
    status === "authenticated" &&
    session?.address &&
    ADMIN_WALLETS.includes(session.address.toLowerCase());

  return { isAdmin };
}
