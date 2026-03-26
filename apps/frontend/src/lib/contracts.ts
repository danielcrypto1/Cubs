// Contract addresses
export const BUD_BEAR_ADDRESS = "0xce91808e4612d803c3383326d2d5e0be98b7811b" as const;
export const CUBS_NFT_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // TBD

// Supported chains for bridging
export const SUPPORTED_CHAINS = [
  { id: "ethereum", name: "Ethereum", chainId: 1, icon: "⟠", status: "active" as const, estimatedTime: "~15 min", estimatedGas: "~0.005 ETH" },
  { id: "base", name: "Base", chainId: 8453, icon: "🔵", status: "coming_soon" as const, estimatedTime: "~5 min", estimatedGas: "~0.001 ETH" },
  { id: "arbitrum", name: "Arbitrum", chainId: 42161, icon: "🔷", status: "coming_soon" as const, estimatedTime: "~7 min", estimatedGas: "~0.002 ETH" },
  { id: "polygon", name: "Polygon", chainId: 137, icon: "🟣", status: "coming_soon" as const, estimatedTime: "~3 min", estimatedGas: "~0.001 ETH" },
  { id: "optimism", name: "Optimism", chainId: 10, icon: "🔴", status: "coming_soon" as const, estimatedTime: "~5 min", estimatedGas: "~0.001 ETH" },
] as const;
