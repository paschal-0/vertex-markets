import { Router } from "express";
import { UserRole } from "@prisma/client";
import { issueAccessToken, issueRefreshToken, type SessionIdentity, type TokenConfig } from "@vertex/auth";
import type { Role } from "@vertex/types";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { createAuthChallenge, resendAuthChallenge, verifyAuthChallenge, type AuthChallengePurpose } from "../../services/auth-challenge-store";
import { hashPassword, verifyPassword } from "../../services/password";
import { sendOtpEmail, type OtpEmailConfig } from "../../services/otp-email";
import { randomUUID } from "crypto";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  tenantId: z.string().optional(),
  tenantName: z.string().min(2).max(80).optional()
});

const loginSchema = z.object({
  tenantId: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const otpVerifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(["login", "signup"]).default("login")
});

const otpResendSchema = z.object({
  challengeId: z.string().uuid(),
  purpose: z.enum(["login", "signup"])
});

const forgotPasswordSchema = z.object({
  tenantId: z.string().optional(),
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128)
});

function mapRoles(rawRoles: { role: UserRole }[]): Role[] {
  if (!rawRoles.length) return ["TRADER"];
  return rawRoles.map((entry) => entry.role as Role);
}

function buildSession(identity: Omit<SessionIdentity, "sessionId">, tokenConfig: TokenConfig) {
  const payload: SessionIdentity = {
    ...identity,
    sessionId: randomUUID()
  };

  const accessToken = issueAccessToken(payload, tokenConfig);
  const refreshToken = issueRefreshToken(payload, tokenConfig);

  return { accessToken, refreshToken };
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isDevMode() {
  return process.env.NODE_ENV !== "production";
}

function otpErrorMessage(reason: string): string {
  switch (reason) {
    case "expired":
      return "OTP expired. Please request a new code.";
    case "attempts_exceeded":
      return "Too many invalid attempts. Request a new OTP.";
    case "wrong_purpose":
      return "OTP purpose mismatch.";
    default:
      return "Invalid OTP code.";
  }
}

async function createTenantForSignup(email: string, tenantName?: string) {
  const base = email.split("@")[0].replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase() || "vunex";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${Math.floor(Math.random() * 9000 + 1000)}`;
    const slug = `${base}${suffix}`;
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (!existing) {
      return prisma.tenant.create({
        data: {
          slug,
          name: tenantName ?? "Vunex Markets"
        }
      });
    }
  }

  return prisma.tenant.create({
    data: {
      slug: `vunex-${Date.now()}`,
      name: tenantName ?? "Vunex Markets"
    }
  });
}

function resolveTenantId(reqTenantId: string | undefined, bodyTenantId: string | undefined): string | undefined {
  return bodyTenantId?.trim() || reqTenantId?.trim();
}

async function resolveTenantFromEmail(email: string): Promise<string | "ambiguous" | null> {
  const matches = await prisma.user.findMany({
    where: { email },
    select: { tenantId: true },
    take: 3
  });

  if (!matches.length) return null;

  const tenantIds = [...new Set(matches.map((match) => match.tenantId))];
  if (tenantIds.length === 1) return tenantIds[0];
  return "ambiguous";
}

function mapOtpPurposeToInternal(purpose: "login" | "signup"): AuthChallengePurpose {
  return purpose === "signup" ? "SIGNUP_OTP" : "LOGIN_OTP";
}

export function createAuthRouter(tokenConfig: TokenConfig, otpEmailConfig?: OtpEmailConfig) {
  const router = Router();
  const resolvedOtpEmailConfig: OtpEmailConfig = otpEmailConfig ?? {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || "Vunex Markets <no-reply@vunex.live>",
    brandName: process.env.OTP_EMAIL_BRAND || "Vunex Markets",
    isProduction: process.env.NODE_ENV === "production"
  };

  router.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const email = sanitizeEmail(parsed.data.email);
    const passwordHash = hashPassword(parsed.data.password);
    const explicitTenantId = resolveTenantId((req as { tenantId?: string }).tenantId, parsed.data.tenantId);

    try {
      const tenant =
        explicitTenantId
          ? await prisma.tenant.findUnique({ where: { id: explicitTenantId } })
          : await createTenantForSignup(email, parsed.data.tenantName);

      if (!tenant) {
        res.status(404).json({ ok: false, error: "Tenant not found." });
        return;
      }

      const existing = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email
          }
        }
      });

      if (existing) {
        res.status(409).json({ ok: false, error: "Account already exists for this tenant." });
        return;
      }

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash,
          roles: {
            create: [{ role: UserRole.TRADER }]
          }
        },
        include: { roles: true }
      });

      const otp = createAuthChallenge({
        tenantId: tenant.id,
        userId: user.id,
        purpose: "SIGNUP_OTP",
        ttlSeconds: 600
      });

      await sendOtpEmail(resolvedOtpEmailConfig, {
        to: email,
        code: otp.code,
        purpose: "signup",
        expiresInSeconds: otp.expiresInSeconds
      });

      res.status(201).json({
        ok: true,
        data: {
          accountCreated: true,
          tenantId: tenant.id,
          userId: user.id,
          otpRequired: true,
          challengeId: otp.challengeId,
          expiresInSeconds: otp.expiresInSeconds,
          otpCode: isDevMode() ? otp.code : undefined
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to create account.", details: String(error) });
    }
  });

  router.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const email = sanitizeEmail(parsed.data.email);

    try {
      const explicitTenantId = resolveTenantId((req as { tenantId?: string }).tenantId, parsed.data.tenantId);
      let tenantId = explicitTenantId;
      if (!tenantId) {
        const inferredTenantId = await resolveTenantFromEmail(email);
        if (inferredTenantId === "ambiguous") {
          res.status(400).json({ ok: false, error: "Multiple tenant accounts found for this email. Provide tenantId." });
          return;
        }
        tenantId = inferredTenantId ?? undefined;
      }

      if (!tenantId) {
        res.status(401).json({ ok: false, error: "Invalid credentials." });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email
          }
        },
        include: {
          roles: true
        }
      });

      if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
        res.status(401).json({ ok: false, error: "Invalid credentials." });
        return;
      }

      const otp = createAuthChallenge({
        tenantId: user.tenantId,
        userId: user.id,
        purpose: "LOGIN_OTP",
        ttlSeconds: 300
      });

      await sendOtpEmail(resolvedOtpEmailConfig, {
        to: email,
        code: otp.code,
        purpose: "login",
        expiresInSeconds: otp.expiresInSeconds
      });

      res.json({
        ok: true,
        data: {
          otpRequired: true,
          tenantId: user.tenantId,
          challengeId: otp.challengeId,
          expiresInSeconds: otp.expiresInSeconds,
          otpCode: isDevMode() ? otp.code : undefined
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Login failed.", details: String(error) });
    }
  });

  router.post("/otp/verify", async (req, res) => {
    const parsed = otpVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const expectedPurpose = mapOtpPurposeToInternal(parsed.data.purpose);
    const result = verifyAuthChallenge({
      challengeId: parsed.data.challengeId,
      code: parsed.data.code,
      expectedPurpose
    });

    if (!result.ok) {
      res.status(401).json({ ok: false, error: otpErrorMessage(result.reason) });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: result.challenge.userId },
        include: { roles: true }
      });

      if (!user) {
        res.status(404).json({ ok: false, error: "User not found." });
        return;
      }

      const roles = mapRoles(user.roles);
      const tokens = buildSession(
        {
          userId: user.id,
          tenantId: user.tenantId,
          roles
        },
        tokenConfig
      );

      res.json({
        ok: true,
        data: {
          verified: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tenantId: user.tenantId,
          userId: user.id,
          roles
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "OTP verification failed.", details: String(error) });
    }
  });

  router.post("/otp/resend", async (req, res) => {
    const parsed = otpResendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const expectedPurpose = mapOtpPurposeToInternal(parsed.data.purpose);
    const ttlSeconds = parsed.data.purpose === "signup" ? 600 : 300;
    const refreshed = resendAuthChallenge({
      challengeId: parsed.data.challengeId,
      expectedPurpose,
      ttlSeconds
    });

    if (!refreshed.ok) {
      res.status(400).json({ ok: false, error: otpErrorMessage(refreshed.reason) });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: refreshed.challenge.userId }
      });
      if (!user) {
        res.status(404).json({ ok: false, error: "User not found." });
        return;
      }

      await sendOtpEmail(resolvedOtpEmailConfig, {
        to: user.email,
        code: refreshed.code,
        purpose: parsed.data.purpose,
        expiresInSeconds: refreshed.expiresInSeconds
      });

      res.json({
        ok: true,
        data: {
          challengeId: refreshed.challengeId,
          expiresInSeconds: refreshed.expiresInSeconds,
          otpCode: isDevMode() ? refreshed.code : undefined
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to resend OTP.", details: String(error) });
    }
  });

  router.post("/2fa/verify", async (req, res) => {
    const mergedBody = { ...(req.body || {}), purpose: req.body?.purpose ?? "login" };
    req.body = mergedBody;
    const parsed = otpVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const expectedPurpose = mapOtpPurposeToInternal(parsed.data.purpose);
    const result = verifyAuthChallenge({
      challengeId: parsed.data.challengeId,
      code: parsed.data.code,
      expectedPurpose
    });

    if (!result.ok) {
      res.status(401).json({ ok: false, error: otpErrorMessage(result.reason) });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: result.challenge.userId },
        include: { roles: true }
      });

      if (!user) {
        res.status(404).json({ ok: false, error: "User not found." });
        return;
      }

      const roles = mapRoles(user.roles);
      const tokens = buildSession(
        {
          userId: user.id,
          tenantId: user.tenantId,
          roles
        },
        tokenConfig
      );

      res.json({
        ok: true,
        data: {
          verified: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tenantId: user.tenantId,
          userId: user.id,
          roles
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "OTP verification failed.", details: String(error) });
    }
  });

  router.post("/forgot-password", async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const email = sanitizeEmail(parsed.data.email);

    try {
      const explicitTenantId = resolveTenantId((req as { tenantId?: string }).tenantId, parsed.data.tenantId);
      let tenantId = explicitTenantId;
      if (!tenantId) {
        const inferredTenantId = await resolveTenantFromEmail(email);
        if (inferredTenantId === "ambiguous") {
          res.json({
            ok: true,
            data: {
              sent: true,
              message: "If the account exists, a reset code has been sent."
            }
          });
          return;
        }
        tenantId = inferredTenantId ?? undefined;
      }

      if (!tenantId) {
        res.json({
          ok: true,
          data: {
            sent: true,
            message: "If the account exists, a reset code has been sent."
          }
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email
          }
        }
      });

      if (!user) {
        res.json({
          ok: true,
          data: {
            sent: true,
            message: "If the account exists, a reset code has been sent."
          }
        });
        return;
      }

      const reset = createAuthChallenge({
        tenantId: user.tenantId,
        userId: user.id,
        purpose: "RESET_PASSWORD",
        ttlSeconds: 900
      });

      await sendOtpEmail(resolvedOtpEmailConfig, {
        to: email,
        code: reset.code,
        purpose: "reset_password",
        expiresInSeconds: reset.expiresInSeconds
      });

      res.json({
        ok: true,
        data: {
          sent: true,
          tenantId: user.tenantId,
          message: "If the account exists, a reset code has been sent.",
          challengeId: reset.challengeId,
          expiresInSeconds: reset.expiresInSeconds,
          resetCode: isDevMode() ? reset.code : undefined
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to initiate password reset.", details: String(error) });
    }
  });

  router.post("/reset-password", async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "Invalid request payload.", details: parsed.error.flatten() });
      return;
    }

    const challenge = verifyAuthChallenge({
      challengeId: parsed.data.challengeId,
      code: parsed.data.code,
      expectedPurpose: "RESET_PASSWORD"
    });

    if (!challenge.ok) {
      res.status(401).json({ ok: false, error: otpErrorMessage(challenge.reason) });
      return;
    }

    try {
      await prisma.user.update({
        where: { id: challenge.challenge.userId },
        data: {
          passwordHash: hashPassword(parsed.data.newPassword)
        }
      });

      res.json({
        ok: true,
        data: {
          reset: true
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to reset password.", details: String(error) });
    }
  });

  router.post("/refresh", (_req, res) => {
    res.status(501).json({ ok: false, error: "Refresh rotation stub pending persistence layer." });
  });

  return router;
}
