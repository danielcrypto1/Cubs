import { config } from "./config.js";

const PINATA_API_URL = "https://api.pinata.cloud";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadImageToIpfs(imageBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/png" });
  formData.append("file", blob, fileName);

  const res = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      pinata_api_key: config.PINATA_API_KEY,
      pinata_secret_api_key: config.PINATA_SECRET_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as PinataResponse;
  return `ipfs://${data.IpfsHash}`;
}

export async function uploadJsonToIpfs(json: Record<string, unknown>, name: string): Promise<string> {
  const res = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: config.PINATA_API_KEY,
      pinata_secret_api_key: config.PINATA_SECRET_KEY,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata JSON upload failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as PinataResponse;
  return `ipfs://${data.IpfsHash}`;
}
