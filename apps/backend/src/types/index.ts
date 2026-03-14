import "fastify";

declare module "fastify" {
  interface Session {
    nonce?: string;
    siwe?: {
      address: string;
      chainId: number;
    };
  }
}
