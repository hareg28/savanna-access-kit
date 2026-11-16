import { z } from "zod";
import type { AppConfig, Partner } from "./lib/context";

const DEV_PARTNER: Partner = {
  name: "dev",
  key: "pk_dev_local",
  origins: ["http://localhost:3000", "http://localhost:4010", "http://localhost:5173", "http://localhost:8000", "http://localhost:8080"],
};

const PartnerSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(8),
  origins: z.array(z.string().url()),
});

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("postgresql://savanna:savanna@localhost:5432/savanna"),
  REDIS_URL: z.string().optional(),
  SECRET_KEY: z.string().min(16).optional(),
  /** JSON array: [{"name":"savanna","key":"pk_live_xxx","origins":["https://savanna.example"]}] */
  PARTNERS: z.string().optional(),
  RATE_LIMIT_PER_MIN: z.coerce.number().int().positive().default(120),
  /** memory = fixtures in RAM (no database). prisma = PostgreSQL. Defaults to prisma in production. */
  STORE: z.enum(["memory", "prisma"]).optional(),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const e = EnvSchema.parse(env);
  const production = e.NODE_ENV === "production";

  if (production && (!e.SECRET_KEY || !e.PARTNERS)) {
    throw new Error("In production, SECRET_KEY and PARTNERS must be set.");
  }

  const partners = e.PARTNERS
    ? z.array(PartnerSchema).parse(JSON.parse(e.PARTNERS))
    : [DEV_PARTNER];

  return {
    port: e.PORT,
    databaseUrl: e.DATABASE_URL,
    redisUrl: e.REDIS_URL,
    production,
    secretKey: e.SECRET_KEY ?? "sk_dev_local_change_me_please",
    partners,
    rateLimitPerMin: e.RATE_LIMIT_PER_MIN,
    store: e.STORE ?? (production ? "prisma" : "memory"),
  };
}
