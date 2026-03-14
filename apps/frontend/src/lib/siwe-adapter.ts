import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import { BACKEND_URL } from "./constants";

export function getSiweAdapter() {
  return createAuthenticationAdapter({
    getNonce: async () => {
      const res = await fetch(`${BACKEND_URL}/api/auth/nonce`, {
        credentials: "include",
      });
      return res.text();
    },

    createMessage: ({ nonce, address, chainId }) => {
      return createSiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to CUBS Platform",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
    },

    verify: async ({ message, signature }) => {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      return res.ok;
    },

    signOut: async () => {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    },
  });
}
