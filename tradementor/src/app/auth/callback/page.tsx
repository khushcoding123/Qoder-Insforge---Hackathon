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
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Authentication failed: {authError}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)]">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
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
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] animate-pulse">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
