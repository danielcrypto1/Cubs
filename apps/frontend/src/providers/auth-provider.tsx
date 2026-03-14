"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RainbowKitAuthenticationProvider } from "@rainbow-me/rainbowkit";
import { getSiweAdapter } from "@/lib/siwe-adapter";
import { BACKEND_URL } from "@/lib/constants";
import type { AuthSession } from "@/types";

type AuthStatus = "loading" | "unauthenticated" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
}

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  session: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const adapter = useMemo(() => getSiweAdapter(), []);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.address) {
          setSession(data);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        setStatus("unauthenticated");
      }
    }
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ status, session }}>
      <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
        {children}
      </RainbowKitAuthenticationProvider>
    </AuthContext.Provider>
  );
}
