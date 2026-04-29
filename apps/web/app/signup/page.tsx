"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { rememberTenantForEmail } from "../../lib/auth-tenant";

type RegisterStatus =
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

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg viewBox="0 0 24 24" width="42" height="42" fill="none" aria-hidden="true">
      <path d="M4.5 19.6c.8-2.5 2.6-4.5 5.3-5.5l5.5-5.4c2.1-2.1 5.1-2.8 8-2.3.5 2.9-.2 5.9-2.3 8L15.6 20c-1 2.7-3 4.5-5.5 5.3l.3-4.2-1.8-1.8-4.1.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.4" cy="8.7" r="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RegisterStatus | null>(null);

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_MAIN_API_URL || "http://127.0.0.1:4000",
    []
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (password !== confirmPassword) {
      setStatus({ ok: false, message: "Password and confirm password do not match." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          tenantName: "Vunex Markets",
          fullName,
          referralCode: showReferral ? referralCode : undefined
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { challengeId?: string; tenantId?: string };
      };

      if (!response.ok || !payload.ok) {
        setStatus({ ok: false, message: payload.error || "Account creation failed." });
        return;
      }

      const challenge = payload.data?.challengeId;
      const tenantId = payload.data?.tenantId;
      if (tenantId) {
        rememberTenantForEmail(email, tenantId);
      }
      if (challenge) {
        router.push(`/otp?challengeId=${encodeURIComponent(challenge)}&purpose=signup&email=${encodeURIComponent(email)}`);
        return;
      }

      setStatus({ ok: true, message: "Account created successfully." });
    } catch {
      setStatus({ ok: false, message: "Unable to reach the auth server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page min-h-screen overflow-x-hidden bg-[#0b0e16] text-[#e1e2ed]">
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-slate-950/40 px-8 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
        <div className="text-2xl font-black uppercase tracking-tighter text-white">VUNEX MARKETS</div>
        <div className="flex items-center gap-8">
          <Link
            href="/signin"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2f4f8d]/60 bg-[#1b2f57]/35 px-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#d9e2ff] transition-all hover:border-[#578cff] hover:bg-[#25447f]/55 hover:text-white active:scale-[0.98]"
          >
            Login
          </Link>
          <button className="text-slate-400 transition-colors hover:text-blue-500" type="button" aria-label="Help">
            <IconHelp />
          </button>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-28 pt-28 md:grid-cols-2">
        <div className="pointer-events-none absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,120,255,0.15)_0%,rgba(45,120,255,0)_70%)] blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-10 -right-20 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,120,255,0.15)_0%,rgba(45,120,255,0)_70%)] opacity-50 blur-[80px]" />

        <section className="order-2 z-10 md:order-1">
          <article className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[rgba(10,14,20,0.6)] p-8 shadow-2xl backdrop-blur-[20px] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent">
            <div className="relative mb-8">
              <p className="mb-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#b1c5ff]">CREATE YOUR ACCOUNT</p>
              <h1 className="mb-2 text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-white">Join Vunex Markets</h1>
              <p className="text-base leading-relaxed text-[#c2c6d7]">Access institutional-grade liquidity and advanced trading tools in seconds.</p>
            </div>

            <form className="relative space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="px-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]">Full Name</label>
                <input className="h-[54px] w-full rounded-xl border border-white/10 bg-[#32343d] px-4 text-base text-white placeholder:text-slate-600 focus:border-[#578cff] focus:outline-none" placeholder="Enter your full name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <label className="px-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]">Email Address</label>
                <input className="h-[54px] w-full rounded-xl border border-white/10 bg-[#32343d] px-4 text-base text-white placeholder:text-slate-600 focus:border-[#578cff] focus:outline-none" placeholder="name@company.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="px-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]">Password</label>
                  <input className="h-[54px] w-full rounded-xl border border-white/10 bg-[#32343d] px-4 text-base text-white placeholder:text-slate-600 focus:border-[#578cff] focus:outline-none" placeholder="********" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="px-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]">Confirm Password</label>
                  <input className="h-[54px] w-full rounded-xl border border-white/10 bg-[#32343d] px-4 text-base text-white placeholder:text-slate-600 focus:border-[#578cff] focus:outline-none" placeholder="********" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>

              <div>
                <button className="flex items-center gap-2 px-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#b1c5ff] transition-colors hover:text-blue-400" type="button" onClick={() => setShowReferral((p) => !p)}>
                  <IconPlus />
                  Have a Referral Code?
                </button>
                {showReferral && (
                  <div className="mt-2">
                    <input className="h-[54px] w-full rounded-xl border border-white/10 bg-[#32343d] px-4 text-base text-white placeholder:text-slate-600 focus:border-[#578cff] focus:outline-none" placeholder="Optional code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
                  </div>
                )}
              </div>

              <button className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-[13px] font-semibold uppercase tracking-[0.05em] text-white shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98]" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
                {!loading && <IconArrow />}
              </button>

              <p className="pt-1 text-center text-xs text-slate-500">
                By signing up, you agree to our <Link href="#" className="text-[#b1c5ff] hover:underline">Terms of Service</Link> and{" "}
                <Link href="#" className="text-[#b1c5ff] hover:underline">Privacy Policy</Link>.
              </p>

              {status && <p className={`text-center text-sm ${status.ok ? "text-emerald-300" : "text-red-300"}`}>{status.message}</p>}
            </form>
          </article>
        </section>

        <section className="order-1 hidden flex-col gap-8 md:order-2 md:flex">
          <div className="group relative">
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-blue-600 to-cyan-500 opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200" />
            <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[32px] border border-white/15 bg-[rgba(10,14,20,0.6)] p-8 backdrop-blur-[20px] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent">
              <img alt="Financial visualization" className="absolute inset-0 h-full w-full rounded-[32px] object-cover opacity-40 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpFSfEI_uJgDFC3U824naeJ30MT8ekedXrJNQEaR1utAdLaBD9hyBig528TM1K9ZH6ygZPopVjqQsh_RufvhxS_kcp0hvgnEozIZ7_oG9BTmkuANwKU-4lhPKGFVJWrRxP01ZLYbvQT9GCwC6a9QCAX9IaSRlJM8tVuL0wGyjEmuNeLVdaWLtpUM2r9W0S5R1eNUUPU80D7gGTbDIKXkAEvLF3jn6fbwNP_3nNaqkMA_XuL20HzLOsOH7ZfsqSUZyF0Ru-uYLZiexF" />
              <div className="relative z-10 space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary backdrop-blur-md">
                  <IconRocket />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">The Future of Exchange</h3>
                  <p className="mt-2 text-base text-slate-400">Ultra-low latency execution for the modern global trader.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-8">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-primary">$2.4B+</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">24h Volume</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-primary">5ms</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">Execution Speed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4">
            <div className="flex -space-x-4">
              <img alt="User" className="h-10 w-10 rounded-full border-2 border-[#0b0e16]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfTr61ukc0h5_CRuN8OHjv0ydh2qcAJ8Vc4yi9t4H2oDZ7hhUS9MXeAokT6NLAef_SRBueWPgugbV8eOs7HMz7edCxT87OV2OsuN0hstSKMG36L5QZIV7FFZMH3V7VGfJQrlVfBY_P9Fg6nE3CngQUn9IesaIQjdDhIvmWvtOdML4namV_3cdR5PcS2T7k59IOMbqzrmCfQG6j7l0aYkkUU7NU7-oIqiRs_7U5JSigPyBLIHYyPoAWAWEnKk0BJRV2SP9-O-ZtxqJL" />
              <img alt="User" className="h-10 w-10 rounded-full border-2 border-[#0b0e16]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOWubZl689bGYluVtOPG9R8mDcCrKStJdH9gJ9hptT-L5jp9FhecMaQm8zStbxSv6VYiHmFqwN-6O-chGwUzGnVz5cZOleWC5ALKy8kzIA81WxPB8Cs6m6F0m8MslVoXhm0qPsSqUQfsTJ2izL0ztAqjSBbJJUbs_Byl-7o1SFZLquTrRqKDM7nRYWpq27Wtzgjcdfd_9lxKTAiNiRQ4IFThDW-3dCNZiT99_K-goukHHjbdQDtWAkmn4RSoi--0nNG3mIrMbBiNjQ" />
              <img alt="User" className="h-10 w-10 rounded-full border-2 border-[#0b0e16]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4EUaCq0z6XPV2orLFd9RkjuhgKys2yKt5WjI81VAq6uB0sWSi2WeOTjXkavPQfMX9sj8l_9_Ay_VFzOEy0stSuLoZxcodo7Qubsx78L0XG6jaPUuE5VG0rRtcCpInpth0mda67w9RpVjckJsRNh-IVRIwfOZdRxx3v5e1K40vWO4iPGgmrNC3goaNT_ecfUkqt7qUbf7XpUu4WfNN8ao5PHrSpOz50631juuCFCSVgO2pCeXOg2JU06ZIlYlArqBUUdpGo-wlcaW2" />
            </div>
            <p className="text-[13px] text-slate-400">Join 12,000+ institutional traders today.</p>
          </div>
        </section>
      </section>

      <footer className="w-full bg-transparent pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">(c) 2024 VUNEX MARKETS. INSTITUTIONAL GRADE TRADING.</p>
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
