"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { getLastTenantId, getTenantForEmail, rememberTenantForEmail } from "../../lib/auth-tenant";

type ForgotPasswordStatus =
  | { ok: true; message: string }
  | { ok: false; message: string };

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.8 9.5a2.35 2.35 0 1 1 4.4 1.2c-.6 1-1.7 1.3-2.2 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconLockReset() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
      <path d="M10 2v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M14.8 3.2a9 9 0 1 1-5.4 16.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M2.5 7.5h5v5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9a3 3 0 0 1 3 3v1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <rect x="8.5" y="13" width="7" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ForgotPasswordStatus | null>(null);
  const [challengeId, setChallengeId] = useState("");

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_MAIN_API_URL || "http://127.0.0.1:4000",
    []
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setChallengeId("");

    try {
      const tenantId = getTenantForEmail(email) || getLastTenantId();
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          ...(tenantId ? { tenantId } : {})
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { message?: string; challengeId?: string; tenantId?: string };
      };

      if (!response.ok || !payload.ok) {
        setStatus({ ok: false, message: payload.error || "Failed to send reset code. Please try again." });
        return;
      }

      setStatus({
        ok: true,
        message: payload.data?.message || "If the account exists, a reset code has been sent."
      });
      if (payload.data?.tenantId) {
        rememberTenantForEmail(email, payload.data.tenantId);
      }
      setChallengeId(payload.data?.challengeId || "");
    } catch {
      setStatus({ ok: false, message: "Unable to reach the auth server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page flex min-h-screen flex-col bg-[#10131b] text-[#e1e2ed]">
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-slate-950/40 px-8 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
        <div className="text-2xl font-black uppercase tracking-tighter text-white">VUNEX MARKETS</div>
        <button className="rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-blue-400" type="button" aria-label="Help">
          <IconHelp />
        </button>
      </header>

      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pt-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(45,120,255,0.15)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />

        <section className="relative z-10 w-full max-w-[480px] rounded-[24px] border border-white/15 bg-[rgba(10,14,20,0.6)] p-8 shadow-2xl backdrop-blur-[20px]">
          <div className="mb-8 flex flex-col items-center space-y-4 text-center">
            <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-[#b1c5ff]">
              <IconLockReset />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white">Forgot Password?</h1>
            <p className="max-w-[320px] text-base leading-relaxed text-[#c2c6d7]">
              Enter your email below and we&apos;ll send you a secure link to reset your institutional trading access.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-1">
              <label className="ml-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]" htmlFor="forgot-email">
                WORK EMAIL ADDRESS
              </label>
              <div className="group relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c90a0] transition-colors group-focus-within:text-[#b1c5ff]">
                  <IconMail />
                </span>
                <input
                  id="forgot-email"
                  className="h-14 w-full rounded-xl border border-white/15 bg-[#0b0e16] pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-[#b1c5ff] focus:outline-none focus:ring-1 focus:ring-[#b1c5ff]"
                  placeholder="name@institution.com"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <button className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#2D78FF] to-[#1B59E6] text-[13px] font-semibold uppercase tracking-[0.1em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform active:scale-[0.98]" type="submit" disabled={loading}>
                <span>{loading ? "SENDING..." : "SEND RESET CODE"}</span>
                {!loading && <IconArrow />}
              </button>

              <Link className="group flex w-full items-center justify-center gap-2 py-2 text-[13px] font-semibold text-slate-400 transition-colors hover:text-blue-500" href="/signin">
                <span className="transition-transform group-hover:-translate-x-1">
                  <IconChevronLeft />
                </span>
                Back to Sign In
              </Link>
            </div>

            {challengeId && (
              <Link className="block text-center text-xs text-[#8fb0f4]" href={`/reset-password?challengeId=${encodeURIComponent(challengeId)}`}>
                Continue to Reset Password
              </Link>
            )}

            {status && <p className={`text-center text-sm ${status.ok ? "text-emerald-300" : "text-red-300"}`}>{status.message}</p>}
          </form>

          <div className="mt-8 flex items-center gap-4 border-t border-white/5 pt-8">
            <div className="flex -space-x-2">
              <img className="h-8 w-8 rounded-full border-2 border-[#1d1f28] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADt_m93KEKVzXP8m1I_JkgzhrPXh66U4x3ioi-ZqOu4fXas8tFTkpIgBujsKqOkdjWIjenPXgnHpcuJeKi8iavfDUjopHB6HjZh0dekLiDK7KPxRYHlQ0ffLSYRTQk_KWTTdPUTiJrs7HLy1fBurUga_pBKOk4JAGkSPMio0RrraVyth4o7pLfDuS6iIAubt-MwPNjt6ZrW3YLYj-MhM7KGZM66PcBS-CHbsEmsFR2uoDbU2824YsNntN6x-qVHWDT1-Pr-sQdpED-" alt="Analyst" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1d1f28] bg-[#32343d] text-[10px] font-bold text-[#b1c5ff]">+4k</div>
            </div>
            <p className="text-xs leading-tight text-slate-500">Join 4,000+ institutional traders using Vunex multi-layer security.</p>
          </div>
        </section>
      </section>

      <footer className="w-full bg-transparent pb-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">(c) 2024 VUNEX MARKETS. INSTITUTIONAL GRADE TRADING.</p>
          <div className="flex gap-8">
            <Link className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-500" href="#">
              Privacy Policy
            </Link>
            <Link className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-500" href="#">
              Terms of Service
            </Link>
            <Link className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-500" href="#">
              Security Disclosure
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
