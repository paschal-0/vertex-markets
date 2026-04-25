import { z } from "zod";
import { loadSharedEnv } from "@vertex/config";

const serviceEnvSchema = z.object({
  MAIN_API_PORT: z.coerce.number().default(4000),
  TENANT_HEADER: z.string().default("x-tenant-id")
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

