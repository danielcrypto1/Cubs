import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";
import { http } from "wagmi";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
const activeChain = chainId === 1 ? mainnet : sepolia;

export const wagmiConfig = getDefaultConfig({
  appName: "CUBS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder",
  chains: [activeChain],
  transports: {
    [sepolia.id]: http(
      alchemyKey
        ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
        : undefined
    ),
    [mainnet.id]: http(
      alchemyKey
        ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
        : undefined
    ),
  },
  ssr: true,
});
