"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ResetStatus =
  | { ok: true; message: string }
  | { ok: false; message: string };

interface ResetPasswordClientProps {
  challengeId: string;
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

function IconEye({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path d="M3 3 21 21" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M10.9 5.1a10.1 10.1 0 0 1 1.1-.1c6.5 0 10 7 10 7a17.6 17.6 0 0 1-4.2 4.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M6.7 6.6C4 8.4 2 12 2 12s3.5 6 10 6a9.8 9.8 0 0 0 4.2-.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.7-3.2 7.8-7 10-3.8-2.2-7-5.3-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.2 12.2 1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Low" };
  if (score <= 2) return { score, label: "Medium" };
  return { score, label: "High" };
}

export function ResetPasswordClient({ challengeId }: ResetPasswordClientProps) {
  const router = useRouter();
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_MAIN_API_URL || "http://127.0.0.1:4000", []);

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResetStatus | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const strength = getStrength(newPassword);
  const activeBars = Math.min(strength.score, 3);

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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    if (!challengeId) {
      setStatus({ ok: false, message: "Missing reset challenge. Start from forgot password." });
      return;
    }
    const code = digits.join("");
    if (code.length !== 6) {
      setStatus({ ok: false, message: "Please enter the 6-digit reset code." });
      return;
    }
    if (newPassword.length < 12) {
      setStatus({ ok: false, message: "Password must be at least 12 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ ok: false, message: "Password and confirm password do not match." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId, code, newPassword })
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setStatus({ ok: false, message: payload.error || "Failed to reset password." });
        return;
      }

      setStatus({ ok: true, message: "Password updated successfully. Redirecting to sign in..." });
      window.setTimeout(() => router.push("/signin"), 900);
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
        <div className="flex items-center gap-6">
          <nav className="hidden gap-8 md:flex">
            <Link className="rounded px-3 py-1 text-sm font-medium tracking-wide text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-blue-400 active:scale-95" href="/#markets">
              Markets
            </Link>
            <Link className="rounded px-3 py-1 text-sm font-medium tracking-wide text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-blue-400 active:scale-95" href="/trader">
              Trade
            </Link>
            <Link className="rounded px-3 py-1 text-sm font-medium tracking-wide text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-blue-400 active:scale-95" href="/#company">
              Institutional
            </Link>
          </nav>
          <button className="text-slate-400 hover:text-blue-500" type="button" aria-label="Help">
            <IconHelp />
          </button>
        </div>
      </header>

      <section className="relative flex flex-1 items-center justify-center overflow-hidden pb-12 pt-24">
        <div className="pointer-events-none absolute -left-[10%] bottom-[-10%] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(45,120,255,0.15)_0%,rgba(45,120,255,0)_70%)] blur-[60px]" />
        <div className="pointer-events-none absolute -right-[10%] top-[-10%] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(45,120,255,0.15)_0%,rgba(45,120,255,0)_70%)] blur-[60px]" />

        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[rgba(10,14,20,0.6)] p-8 shadow-2xl backdrop-blur-[20px] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:content-['']">
            <div className="mb-8 space-y-2">
              <h1 className="text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-white">Reset Your Password</h1>
              <p className="text-base leading-relaxed text-[#c2c6d7]">Enter your secure 6-digit code and choose a new high-security password to regain access.</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-[0.05em] text-slate-400">6-DIGIT RESET CODE</label>
                <div className="grid grid-cols-6 gap-2">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        inputsRef.current[index] = node;
                      }}
                      className="h-14 w-full rounded-xl border border-white/15 bg-black/40 text-center text-3xl text-primary transition-colors placeholder:text-slate-500 focus:border-[#2D78FF] focus:outline-none"
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
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-[0.05em] text-slate-400">NEW PASSWORD</label>
                <div className="relative">
                  <input className="h-[52px] w-full rounded-xl border border-white/15 bg-black/40 px-4 pr-12 text-white placeholder:text-slate-600 focus:border-[#2D78FF] focus:outline-none" placeholder="************" type={showNewPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" type="button" onClick={() => setShowNewPassword((p) => !p)} aria-label={showNewPassword ? "Hide password" : "Show password"}>
                    <IconEye open={showNewPassword} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">Security Strength</span>
                  <span className="text-sm font-semibold text-primary">{strength.label}</span>
                </div>
                <div className="flex h-1.5 w-full gap-2">
                  {[0, 1, 2, 3].map((bar) => (
                    <div key={bar} className={`flex-1 rounded-full ${bar < activeBars ? "bg-primary-container shadow-[0_0_8px_rgba(45,120,255,0.4)]" : "bg-slate-800"}`} />
                  ))}
                </div>
                <p className="text-[11px] uppercase tracking-widest leading-none text-slate-500">MIN 12 CHARACTERS, INCLUDING SYMBOLS &amp; NUMBERS</p>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-[0.05em] text-slate-400">CONFIRM NEW PASSWORD</label>
                <div className="relative">
                  <input className="h-[52px] w-full rounded-xl border border-white/15 bg-black/40 px-4 pr-12 text-white placeholder:text-slate-600 focus:border-[#2D78FF] focus:outline-none" placeholder="************" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" type="button" onClick={() => setShowConfirmPassword((p) => !p)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                    <IconEye open={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <button className="h-[52px] w-full rounded-xl bg-gradient-to-b from-[#2D78FF] to-[#1B59E6] text-2xl font-semibold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform active:scale-95" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>

              <div className="pt-4 text-center">
                <Link className="text-[13px] font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-white" href="/signin">
                  RETURN TO SECURE LOGIN
                </Link>
              </div>

              {status && <p className={`text-center text-sm ${status.ok ? "text-emerald-300" : "text-red-300"}`}>{status.message}</p>}
            </form>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
            <div className="h-px w-12 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <IconShield />
              <span className="text-[10px] uppercase tracking-[0.2em]">AES-256 ENCRYPTED ENVIRONMENT</span>
            </div>
            <div className="h-px w-12 bg-white/10" />
          </div>
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
