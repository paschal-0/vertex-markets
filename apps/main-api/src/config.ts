import { z } from "zod";
import { loadSharedEnv } from "@vertex/config";

const serviceEnvSchema = z.object({
  MAIN_API_PORT: z.coerce.number().default(4000),
  TENANT_HEADER: z.string().default("x-tenant-id"),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("Vunex Markets <no-reply@vunex.live>"),
  OTP_EMAIL_BRAND: z.string().default("Vunex Markets")
});

export function loadMainApiEnv(input: NodeJS.ProcessEnv = process.env) {
  const shared = loadSharedEnv(input);
  const service = serviceEnvSchema.parse(input);
  return {
    ...shared,
    ...service
  };
}

export type MainApiEnv = ReturnType<typeof loadMainApiEnv>;
