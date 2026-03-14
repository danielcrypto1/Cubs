import { formatEther, parseEther } from "viem";

export function formatWeiToEth(wei: string): string {
  try {
    const eth = formatEther(BigInt(wei));
    // Remove trailing zeros but keep at least 1 decimal
    const num = parseFloat(eth);
    if (num === 0) return "0";
    if (num < 0.001) return "<0.001";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  } catch {
    return "0";
  }
}

export function formatEthToWei(eth: string): string {
  try {
    return parseEther(eth).toString();
  } catch {
    return "0";
  }
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
