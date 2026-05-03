import "fastify";

declare module "fastify" {
  interface Session {
    nonce?: string;
    siwe?: {
      address: string;
      chainId: number;
    };
  }

  interface FastifyRequest {
    resolvedUser?: {
      userId: string;
      walletAddress: string;
      source: "website" | "discord";
    };
  }
}
