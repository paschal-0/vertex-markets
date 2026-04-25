import { z } from "zod";

const sharedEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  POSTGRES_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d")
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;

export function loadSharedEnv(input: NodeJS.ProcessEnv = process.env): SharedEnv {
  return sharedEnvSchema.parse(input);
}

