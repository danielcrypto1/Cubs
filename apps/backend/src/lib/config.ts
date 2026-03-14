import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(16),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ALCHEMY_API_KEY: z.string().default(""),
  PINATA_API_KEY: z.string().default(""),
  PINATA_SECRET_KEY: z.string().default(""),
  ADMIN_WALLETS: z.string().default(""),
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  adminWallets: parsed.data.ADMIN_WALLETS
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
};
