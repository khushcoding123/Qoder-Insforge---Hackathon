"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle } from "lucide-react";
import { signUp, verifyEmail, resendVerification } from "@/lib/actions/auth";
import { insforge } from "@/lib/insforge";
import { AuthShell } from "@/components/ui/AuthShell";

type Step = "form" | "verify";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUp({ email, password, name });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Sign up failed.");
      return;
    }
    if (result.requireVerification) {
      setStep("verify");
    } else {
      router.push("/onboarding");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifyEmail(email, otp.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Invalid code. Try again.");
      return;
    }
    router.push("/onboarding");
  }

  async function handleResend() {
    setResendCooldown(true);
    await resendVerification(email);
    setTimeout(() => setResendCooldown(false), 30000);
  }

  async function handleGoogleSignIn() {
    setOauthLoading(true);
    setError("");
    const origin = window.location.origin;
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider: "google",
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true, // we handle the redirect so we can store the codeVerifier
    });
    if (error || !data?.url) {
      setError("Google sign-in is unavailable.");
      setOauthLoading(false);
      return;
    }
    // Store PKCE code verifier so the callback page can exchange it server-side
    if (data.codeVerifier) {
      sessionStorage.setItem("insforge_oauth_verifier", data.codeVerifier);
    }
    window.location.href = data.url;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <AuthShell
        title={step === "form" ? "Create your account" : "Check your email"}
        description={
          step === "form"
            ? "Start a structured trading education journey with AI guidance, clear progress, and focused tools built to improve how you think."
            : `We sent a 6-digit code to ${email}.`
        }
        footer={
          step === "form" ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-300 transition-colors hover:text-cyan-200">
                  Sign in
                </Link>
              </p>
              <p className="text-center text-xs leading-relaxed text-zinc-600">
                By creating an account, you&apos;re joining an educational platform built to improve process, discipline, and decision quality.
              </p>
            </div>
          ) : null
        }
      >
        {step === "form" ? (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={oauthLoading}
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:border-white/16 hover:bg-white/8 disabled:opacity-60"
            >
              {oauthLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="auth-divider mb-5">or continue with email</div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Display Name</label>
                <div className="field-shell">
                  <User className="field-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="field-input pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
                <div className="field-shell">
                  <Mail className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="field-input pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Password</label>
                <div className="field-shell">
                  <Lock className="field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    className="field-input pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Account
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-5 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Mail className="h-6 w-6 text-cyan-300" />
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-center text-sm text-zinc-400">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="field-input px-4 py-4 text-center font-mono text-2xl tracking-[1rem]"
                />
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify & Continue
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleResend}
                disabled={resendCooldown}
                className="text-sm text-zinc-500 transition-colors hover:text-cyan-300 disabled:opacity-40"
              >
                {resendCooldown ? "Code sent — check your inbox" : "Resend code"}
              </button>
            </div>
            <button
              onClick={() => {
                setStep("form");
                setError("");
                setOtp("");
              }}
              className="mt-2 w-full text-center text-sm text-zinc-600 transition-colors hover:text-zinc-400"
            >
              ← Use a different email
            </button>
          </>
        )}
      </AuthShell>
    </motion.div>
  );
}
