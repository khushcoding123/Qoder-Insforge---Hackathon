"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { signIn, verifyEmail, resendVerification } from "@/lib/actions/auth";
import { insforge } from "@/lib/insforge";

type Step = "form" | "verify";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error") === "oauth_failed";

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState(oauthError ? "Google sign-in failed. Please try again." : "");
  const [resendCooldown, setResendCooldown] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);
    if (!result.success) {
      if (result.needsVerification) {
        setStep("verify");
      } else {
        setError(result.error ?? "Sign in failed.");
      }
      return;
    }
    router.push("/dashboard");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifyEmail(email, otp.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Invalid code.");
      return;
    }
    router.push("/dashboard");
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
    });
    if (error || !data?.url) {
      setError("Google sign-in is unavailable.");
      setOauthLoading(false);
    }
    // SDK auto-redirects when skipBrowserRedirect is not set
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-xl tracking-tight">
            TradeMentor <span className="text-cyan-400">AI</span>
          </span>
        </Link>

        <div className="bg-[#0F0F1A] border border-white/10 rounded-2xl p-8 shadow-xl">
          {step === "form" ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-gray-400 text-sm mb-6">Sign in to continue your trading education.</p>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={oauthLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-white text-sm font-medium mb-6 disabled:opacity-60"
              >
                {oauthLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-500 text-xs">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm text-gray-400">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Your password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-cyan-400 hover:underline">Sign up free</Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1 text-center">Verify your email</h1>
              <p className="text-gray-400 text-sm mb-6 text-center">
                Enter the 6-digit code sent to <span className="text-white">{email}</span>
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[1rem] placeholder-gray-700 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-mono"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Sign In
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResend}
                  disabled={resendCooldown}
                  className="text-sm text-gray-500 hover:text-cyan-400 transition-colors disabled:opacity-40"
                >
                  {resendCooldown ? "Code sent!" : "Resend code"}
                </button>
              </div>
              <button
                onClick={() => { setStep("form"); setError(""); setOtp(""); }}
                className="w-full text-center text-gray-600 text-sm mt-2 hover:text-gray-400 transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
