"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type OtpStatus =
  | { ok: true; message: string }
  | { ok: false; message: string };

interface OtpClientProps {
  challengeId: string;
  purpose: "login" | "signup";
  email: string;
}

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.8 9.5a2.35 2.35 0 1 1 4.4 1.2c-.6 1-1.7 1.3-2.2 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.7-3.2 7.8-7 10-3.8-2.2-7-5.3-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.2 12.2 1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OtpClient({ challengeId, purpose, email }: OtpClientProps) {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_MAIN_API_URL || "http://127.0.0.1:4000", []);

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [status, setStatus] = useState<OtpStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState(challengeId);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timerId = window.setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  function updateDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function onOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
  }

  function onOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i += 1) next[i] = text[i];
    setDigits(next);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    const code = digits.join("");

    if (!activeChallengeId) {
      setStatus({ ok: false, message: "Missing challenge ID. Return and request a new code." });
      return;
    }
    if (code.length !== 6) {
      setStatus({ ok: false, message: "Please enter the complete 6-digit code." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: activeChallengeId, code, purpose })
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setStatus({ ok: false, message: payload.error || "OTP verification failed." });
        return;
      }

      setStatus({ ok: true, message: "Verification successful. Redirecting..." });
      window.setTimeout(() => router.push("/trader"), 600);
    } catch {
      setStatus({ ok: false, message: "Unable to reach auth server." });
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (countdown > 0) return;
    if (!activeChallengeId) {
      setStatus({ ok: false, message: "Missing challenge ID. Return and request a new code." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/otp/resend`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: activeChallengeId, purpose })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { challengeId?: string };
      };

      if (!response.ok || !payload.ok || !payload.data?.challengeId) {
        setStatus({ ok: false, message: payload.error || "Failed to resend code." });
        return;
      }

      setActiveChallengeId(payload.data.challengeId);
      setDigits(["", "", "", "", "", ""]);
      setCountdown(30);
      inputsRef.current[0]?.focus();
      setStatus({ ok: true, message: "A new code has been sent to your email." });
    } catch {
      setStatus({ ok: false, message: "Unable to reach auth server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page relative flex min-h-screen flex-col overflow-x-hidden bg-[#10131b] text-[#e1e2ed]">
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-slate-950/40 px-8 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
        <div className="text-2xl font-black uppercase tracking-tighter text-white">VUNEX MARKETS</div>
        <button className="text-slate-400 transition-all hover:text-blue-400 active:scale-95" type="button" aria-label="Help">
          <IconHelp />
        </button>
      </header>

      <section className="relative flex flex-1 items-center justify-center px-6 pt-28">
        <div className="pointer-events-none absolute -left-20 -top-20 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(45,120,255,0.15)_0%,rgba(45,120,255,0)_70%)]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(45,120,255,0.15)_0%,rgba(45,120,255,0)_70%)]" />
        <div className="pointer-events-none fixed inset-0 z-0 opacity-20 [background-image:url('https://lh3.googleusercontent.com/aida-public/AB6AXuDq6d2ueZPrpGLY1bi_Pz_nhFzClhFRiw197EQTmPCZzrVpdf3SbYJoUYvpHOK07lyyP3c246RhMydVm9tb1Ji2t4njQONHpn5tnTAY0qJiKJeIxOrMtIDn4CsHNQD-sOxjov6LtdJ5e6NdjbH4b8EaP1fxUIBjYFCfLRJRSVhTdcodev1ofJzsA13JCg0QpVSR0Hvg4SLI0ZyPP9w9QVuI-YhKEb_mSlm3r_7bl5DDEtLcxMLs9hpZKHNGcz3NIVdOIKPoic4dnDl4')]" />

        <div className="relative z-10 w-full max-w-md">
          <article className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[rgba(10,14,20,0.6)] p-8 shadow-2xl backdrop-blur-[20px] before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:content-['']">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <IconShield />
              </div>
              <h1 className="mb-2 text-[32px] font-bold leading-[1.2] tracking-[-0.01em] text-white">Verify Your Identity</h1>
              <p className="px-4 text-base text-[#c2c6d7]">Enter the 6-digit code sent to your email{email ? ` (${email})` : ""}</p>
            </div>

            <form onSubmit={verifyCode}>
              <div className="mb-8 grid grid-cols-6 gap-3">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputsRef.current[index] = node;
                    }}
                    className="h-16 w-full rounded-xl border border-white/20 bg-black/40 text-center text-3xl font-bold text-white transition-all placeholder:text-slate-500 focus:scale-105 focus:border-[#578cff] focus:bg-[#2d78ff1a] focus:shadow-[0_0_15px_rgba(45,120,255,0.2)] focus:outline-none"
                    maxLength={1}
                    placeholder="*"
                    value={digit}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => updateDigit(index, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(index, e)}
                    onPaste={onOtpPaste}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button className="h-[52px] w-full rounded-full border-t border-white/20 bg-gradient-to-b from-[#2D78FF] to-[#1B59E6] text-[13px] font-semibold uppercase tracking-widest text-white shadow-lg shadow-blue-900/40 transition-all active:scale-95" type="submit" disabled={loading}>
                  {loading ? "VERIFYING..." : "VERIFY CODE"}
                </button>

                <div className="flex flex-col items-center gap-2">
                  <button className={`text-[13px] font-semibold uppercase tracking-[0.05em] transition-colors ${countdown > 0 || loading ? "cursor-not-allowed text-slate-400" : "text-blue-300 hover:text-blue-500"}`} type="button" onClick={onResend} disabled={countdown > 0 || loading}>
                    {loading ? "SENDING..." : countdown > 0 ? `RESEND CODE (00:${String(countdown).padStart(2, "0")})` : "RESEND CODE"}
                  </button>
                  <Link className="text-[13px] text-slate-600 underline decoration-slate-800 underline-offset-4 transition-colors hover:text-blue-500" href={purpose === "signup" ? "/signup" : "/signin"}>
                    Change email address
                  </Link>
                </div>
              </div>

              {status && <p className={`mt-4 text-center text-sm ${status.ok ? "text-emerald-300" : "text-red-300"}`}>{status.message}</p>}
            </form>
          </article>

          <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Secured by Vunex Guard Protocol</p>
        </div>
      </section>

      <footer className="w-full bg-transparent pb-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">(c) 2024 VUNEX MARKETS. INSTITUTIONAL GRADE TRADING.</span>
          <div className="flex gap-8">
            <Link className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-500" href="#">
              Privacy Policy
            </Link>
            <Link className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-500" href="#">
              Terms of Service
            </Link>
            <Link className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-500" href="#">
              Security Disclosure
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
