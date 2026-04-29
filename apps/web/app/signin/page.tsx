"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getLastTenantId, getTenantForEmail, rememberTenantForEmail } from "../../lib/auth-tenant";

type LoginResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function IconHelp() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.8 9.4a2.35 2.35 0 1 1 4.4 1.2c-.6 1-1.7 1.3-2.2 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
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

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <path d="M3 3 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.8 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.3 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.7 6.7C4 8.5 2 12 2 12s3.5 6 10 6a9.8 9.8 0 0 0 4.2-.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 10a3 3 0 0 0 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.7-3.2 7.8-7 10-3.8-2.2-7-5.3-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.2 12.1 1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStats() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">
      <path d="M3 18.5h4l3-4 3.2 2.8 4.3-6.3L21 13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 6.8h5V12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17.7" cy="17.7" r="3.2" stroke="currentColor" strokeWidth="1.9" />
      <path d="m19.8 19.8 1.8 1.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoginResult | null>(null);

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_MAIN_API_URL || "http://127.0.0.1:4000",
    []
  );

  useEffect(() => {
    const stored = localStorage.getItem("vunex_login_email");
    if (stored) {
      setEmail(stored);
      setRemember(true);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const tenantId = getTenantForEmail(email) || getLastTenantId();
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(tenantId ? { tenantId } : {})
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { challengeId?: string; tenantId?: string };
      };

      if (!response.ok || !payload.ok) {
        setResult({ ok: false, message: payload.error || "Sign-in failed. Check credentials and try again." });
        return;
      }

      const challenge = payload.data?.challengeId;
      const resolvedTenantId = payload.data?.tenantId || tenantId;
      if (resolvedTenantId) {
        rememberTenantForEmail(email, resolvedTenantId);
      }
      if (challenge) {
        router.push(`/otp?challengeId=${encodeURIComponent(challenge)}&purpose=login&email=${encodeURIComponent(email)}`);
        return;
      }

      setResult({ ok: true, message: "Signed in successfully." });
      if (remember) localStorage.setItem("vunex_login_email", email);
      else localStorage.removeItem("vunex_login_email");
    } catch {
      setResult({ ok: false, message: "Unable to reach the auth server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page min-h-screen bg-[#10131b] text-[#e1e2ed]">
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-slate-950/40 px-8 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
        <div className="text-2xl font-black uppercase tracking-tighter text-white">VUNEX MARKETS</div>
        <button className="rounded-lg p-2 text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-blue-400 active:scale-95" type="button" aria-label="Help">
          <IconHelp />
        </button>
      </header>

      <section className="relative flex min-h-screen pt-20">
        <section className="relative z-10 flex w-full items-center justify-center p-6 lg:w-[45%]">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#b1c5ff]">WELCOME BACK</p>
              <h1 className="text-[48px] font-bold leading-[1.2] tracking-[-0.02em] text-white">Sign In to Vunex</h1>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[rgba(10,14,20,0.6)] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-[20px]">
              <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />
              <form className="relative z-10 space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <label className="ml-1 block text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c90a0]">
                      <IconMail />
                    </span>
                    <input className="h-14 w-full rounded-xl border border-white/10 bg-[#0b0e16] pl-12 pr-4 text-white placeholder:text-[#8c90a080] focus:border-[#b1c5ff] focus:outline-none focus:ring-1 focus:ring-[#b1c5ff]" placeholder="name@company.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[13px] font-semibold uppercase tracking-[0.05em] text-[#c2c6d7]">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c90a0]">
                      <IconLock />
                    </span>
                    <input className="h-14 w-full rounded-xl border border-white/10 bg-[#0b0e16] pl-12 pr-12 text-white placeholder:text-[#8c90a080] focus:border-[#b1c5ff] focus:outline-none focus:ring-1 focus:ring-[#b1c5ff]" placeholder="********" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c90a0] transition-colors hover:text-[#b1c5ff]" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((p) => !p)}>
                      <IconEye open={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[13px] font-semibold uppercase tracking-[0.05em]">
                  <label className="flex cursor-pointer items-center gap-2 text-[#c2c6d7]">
                    <input className="h-4 w-4 rounded border-white/20 bg-[#0b0e16] text-[#578cff]" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  <Link href="/forgot-password" className="text-[#b1c5ff] transition-colors hover:text-[#578cff]">
                    Forgot password?
                  </Link>
                </div>

                <button className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#2D78FF] to-[#1B59E6] text-[13px] font-semibold uppercase tracking-[0.05em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]" type="submit" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                  {!loading && <IconArrow />}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c2c6d7b3]">
                  <IconShield />
                  PROTECTED WITH OTP VERIFICATION
                </div>

                {result && <p className={`text-center text-sm ${result.ok ? "text-emerald-300" : "text-red-300"}`}>{result.message}</p>}
              </form>
            </div>

            <p className="text-center text-sm text-[#c2c6d7]">
              New to Vunex?{" "}
              <Link href="/signup" className="font-bold text-[#b1c5ff] hover:underline">
                Apply for an account
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden overflow-hidden border-l border-white/5 bg-[#0b0e16] lg:block lg:w-[55%]">
          <div className="absolute inset-0">
            <img className="h-full w-full object-cover opacity-40 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3bQXxMcsNGW2NdFE6Rh35MIBVGL5EhbFJ6WnXiocVI2t1_rq0YuLqRCgrWnLuXUlBwFVDkdnWhJHLHPaimj0bP5lwf1QPKs8Z-6_1yTCPYZ7HgwQ6qBA9XJdgF1sw4qUm5TycCJ_gCMj4e_cLw8FE-lB_TwxpThXa3cvV-Bf8hXr9046Ir1dIs-LIZ6RKRNdSYNit7yovqeyLVjQa7xBOLFAXAYcwFkohOeIXM59zO4aFi_7qZG8ENQlw-y1LnRVNQEe3lO5IDDYW" alt="Market visual" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#10131b] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10131b] via-transparent to-[#b1c5ff1a]" />
            <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ-UucJ5Ec6A9Z21WVUzmwW_9Fx0vpMcrGK-_OdTJ7ay8Un1YdlfgBgLp1laVXpgnWBQPmCw8BGg8kYQ_Igee9Iu_mvcL7Qu7c-GGbEteI_iiQrmBCu68knnezIJARBejJiULtLgBT__I6QxOfBZfpYd59oNLA1FpOK0_v6nvyO7Zh_NN_iiFyxMor7Vr0cnjh_5m8WD1fjWpkhaaSbDhO55gUmPK4e1ChP3DJh2KTkjLLpHz-vaTnIYjyyG0AchPhTDtM2A-foS1m')] opacity-[0.03]" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative h-[600px] w-full max-w-2xl">
              <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/20 bg-[rgba(10,14,20,0.6)] p-10 shadow-2xl backdrop-blur-[20px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <IconStats />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Institutional Grade</h3>
                      <p className="text-base text-[#c2c6d7]">Low-latency execution for global markets.</p>
                    </div>
                  </div>

                  <div className="relative h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-[#272a3266]">
                    <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-primary/20 to-transparent" />
                    <svg className="absolute bottom-4 left-0 h-24 w-full fill-none stroke-[#9db6ea] stroke-[2px]" viewBox="0 0 400 100">
                      <path d="M0,80 L40,75 L80,85 L120,40 L160,50 L200,20 L240,45 L280,10 L320,30 L360,5 L400,15" />
                    </svg>
                    <div className="absolute left-4 top-4 flex gap-4">
                      <div className="rounded-full border border-white/10 bg-[#0b0e16cc] px-3 py-1">
                        <span className="text-[10px] font-bold text-[#f7b08e]">VUNX +4.2%</span>
                      </div>
                      <div className="rounded-full border border-white/10 bg-[#0b0e16cc] px-3 py-1">
                        <span className="text-[10px] font-bold text-[#b8ccff]">BTC/USD $64,200</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/30 blur-[120px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-600/20 blur-[140px]" />
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between gap-8 border-t border-white/10 pt-8">
            <div className="max-w-xs">
              <p className="text-sm italic text-[#c2c6d7]">&quot;The speed of Vunex has fundamentally changed how we manage our algorithmic portfolio during high volatility periods.&quot;</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b1c5ff]">-- HEAD OF TRADING, QUANTUM CAPITAL</p>
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-white/20" />
              <div className="h-2 w-2 rounded-full bg-white/20" />
            </div>
          </div>
        </section>
      </section>

      <footer className="w-full bg-transparent">
        <div className="mx-auto flex h-16 max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">(c) 2024 VUNEX MARKETS. INSTITUTIONAL GRADE TRADING.</p>
          <div className="flex items-center gap-8">
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
