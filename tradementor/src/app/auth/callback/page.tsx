"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Loader2 } from "lucide-react";
import { handleOAuthCallback, checkOnboardingStatus } from "@/lib/actions/auth";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function handle() {
      const code = searchParams.get("insforge_code");
      const providerError = searchParams.get("error");
      if (!code) {
        const msg = providerError
          ? `OAuth error from provider: ${providerError}`
          : `No authorization code in URL. Params: ${window.location.search || "(none)"} Hash: ${window.location.hash || "(none)"}`;
        setAuthError(msg);
        return;
      }

      // Retrieve the PKCE verifier stored before the OAuth redirect.
      // Try our custom key first, then fall back to the SDK's internal key.
      const codeVerifier =
        sessionStorage.getItem("insforge_oauth_verifier") ??
        sessionStorage.getItem("insforge_pkce_verifier") ??
        undefined;
      sessionStorage.removeItem("insforge_oauth_verifier");
      sessionStorage.removeItem("insforge_pkce_verifier");

      // Exchange the code server-side so httpOnly cookies are set
      const exchangeResult = await handleOAuthCallback(code, codeVerifier);
      if (!exchangeResult.success) {
        console.error("[auth/callback] OAuth exchange failed:", exchangeResult.error);
        setAuthError(exchangeResult.error ?? "Token exchange failed.");
        return;
      }

      // Now that cookies are set, check onboarding status server-side
      const { authenticated, onboardingCompleted } = await checkOnboardingStatus();
      if (!authenticated) {
        setAuthError("Authentication check failed after token exchange.");
        return;
      }

      router.replace(onboardingCompleted ? "/dashboard" : "/onboarding");
    }

    handle();
  }, [router, searchParams]);

  if (authError) {
    return (
      <div className="auth-shell">
        <div className="premium-panel w-full max-w-md p-8 text-center">
          <div className="site-logo-mark mx-auto mb-5">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-white">We couldn&apos;t complete sign-in</h1>
          <p className="mb-5 text-sm leading-7 text-zinc-400">
            The authentication flow did not finish successfully. Please try again from the login screen.
          </p>
          <div className="status-note mb-5 text-left text-sm text-red-300">{authError}</div>
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-6 py-3 text-sm font-medium text-white"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="flex flex-col items-center gap-4">
        <div className="site-logo-mark">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing you in…
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-shell">
          <div className="site-logo-mark animate-pulse">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
