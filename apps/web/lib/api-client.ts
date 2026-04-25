import { createApiClient } from "@vertex/clients";

const baseUrl = process.env.NEXT_PUBLIC_MAIN_API_URL || "http://127.0.0.1:4000";

export const apiClient = createApiClient({
  baseUrl,
  maxRetries: 3,
  retryDelayMs: 200
});

