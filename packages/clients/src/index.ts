import type { ApiEnvelope } from "@vertex/types";

export interface ApiClientOptions {
  baseUrl: string;
  token?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function createApiClient(options: ApiClientOptions) {
  const maxRetries = options.maxRetries ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 250;

  async function request<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
    let attempt = 0;
    while (true) {
      try {
        const response = await fetch(`${options.baseUrl}${path}`, {
          ...init,
          headers: {
            "content-type": "application/json",
            ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
            ...(init.headers || {})
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return (await response.json()) as ApiEnvelope<T>;
      } catch (error) {
        attempt += 1;
        if (attempt > maxRetries) {
          throw error;
        }
        await wait(retryDelayMs * attempt);
      }
    }
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(body) })
  };
}

