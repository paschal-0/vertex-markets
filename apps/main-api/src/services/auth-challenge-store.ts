import { createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";

export type AuthChallengePurpose = "LOGIN_OTP" | "SIGNUP_OTP" | "RESET_PASSWORD";

export interface AuthChallenge {
  id: string;
  tenantId: string;
  userId: string;
  purpose: AuthChallengePurpose;
  codeHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  consumedAt?: number;
}

const challengeStore = new Map<string, AuthChallenge>();

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function codesEqual(rawCode: string, storedCodeHash: string): boolean {
  const left = Buffer.from(hashCode(rawCode), "hex");
  const right = Buffer.from(storedCodeHash, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function purgeExpired(now: number = Date.now()): void {
  for (const [id, challenge] of challengeStore) {
    if (challenge.expiresAt <= now || challenge.consumedAt) {
      challengeStore.delete(id);
    }
  }
}

export function createAuthChallenge(input: {
  tenantId: string;
  userId: string;
  purpose: AuthChallengePurpose;
  ttlSeconds?: number;
  maxAttempts?: number;
}): { challengeId: string; code: string; expiresInSeconds: number } {
  const now = Date.now();
  purgeExpired(now);

  const ttlSeconds = input.ttlSeconds ?? 300;
  const maxAttempts = input.maxAttempts ?? 5;
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const id = randomUUID();

  challengeStore.set(id, {
    id,
    tenantId: input.tenantId,
    userId: input.userId,
    purpose: input.purpose,
    codeHash: hashCode(code),
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
    attempts: 0,
    maxAttempts
  });

  return {
    challengeId: id,
    code,
    expiresInSeconds: ttlSeconds
  };
}

export function verifyAuthChallenge(input: {
  challengeId: string;
  code: string;
  expectedPurpose: AuthChallengePurpose;
}):
  | { ok: true; challenge: AuthChallenge }
  | { ok: false; reason: "not_found" | "expired" | "consumed" | "attempts_exceeded" | "invalid_code" | "wrong_purpose" } {
  const now = Date.now();
  const challenge = challengeStore.get(input.challengeId);
  if (!challenge) {
    return { ok: false, reason: "not_found" };
  }

  if (challenge.consumedAt) {
    return { ok: false, reason: "consumed" };
  }

  if (challenge.expiresAt <= now) {
    challengeStore.delete(challenge.id);
    return { ok: false, reason: "expired" };
  }

  if (challenge.purpose !== input.expectedPurpose) {
    return { ok: false, reason: "wrong_purpose" };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    challengeStore.delete(challenge.id);
    return { ok: false, reason: "attempts_exceeded" };
  }

  if (!codesEqual(input.code, challenge.codeHash)) {
    challenge.attempts += 1;
    if (challenge.attempts >= challenge.maxAttempts) {
      challengeStore.delete(challenge.id);
      return { ok: false, reason: "attempts_exceeded" };
    }
    return { ok: false, reason: "invalid_code" };
  }

  challenge.consumedAt = now;
  challengeStore.delete(challenge.id);
  return { ok: true, challenge };
}

export function resendAuthChallenge(input: {
  challengeId: string;
  expectedPurpose: AuthChallengePurpose;
  ttlSeconds?: number;
  maxAttempts?: number;
}):
  | { ok: true; challengeId: string; code: string; expiresInSeconds: number; challenge: AuthChallenge }
  | { ok: false; reason: "not_found" | "expired" | "consumed" | "wrong_purpose" } {
  const now = Date.now();
  const challenge = challengeStore.get(input.challengeId);
  if (!challenge) {
    return { ok: false, reason: "not_found" };
  }

  if (challenge.consumedAt) {
    challengeStore.delete(challenge.id);
    return { ok: false, reason: "consumed" };
  }

  if (challenge.expiresAt <= now) {
    challengeStore.delete(challenge.id);
    return { ok: false, reason: "expired" };
  }

  if (challenge.purpose !== input.expectedPurpose) {
    return { ok: false, reason: "wrong_purpose" };
  }

  challengeStore.delete(challenge.id);
  const refreshed = createAuthChallenge({
    tenantId: challenge.tenantId,
    userId: challenge.userId,
    purpose: challenge.purpose,
    ttlSeconds: input.ttlSeconds,
    maxAttempts: input.maxAttempts
  });

  const nextChallenge = challengeStore.get(refreshed.challengeId)!;
  return { ok: true, ...refreshed, challenge: nextChallenge };
}
