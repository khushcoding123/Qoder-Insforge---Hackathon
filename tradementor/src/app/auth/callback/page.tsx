"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Loader2 } from "lucide-react";
import { handleOAuthCallback, checkOnboardingStatus } from "@/lib/actions/auth";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    async function handle() {
      const code = searchParams.get("insforge_code");
      if (!code) {
        // No code in URL — redirect to login with error flag
        router.replace("/login?error=oauth_failed");
        return;
      }

      // Retrieve the PKCE verifier stored before the OAuth redirect
      const codeVerifier = sessionStorage.getItem("insforge_oauth_verifier") ?? undefined;
      sessionStorage.removeItem("insforge_oauth_verifier");

      // Exchange the code server-side so httpOnly cookies are set
      const exchangeResult = await handleOAuthCallback(code, codeVerifier);
      if (!exchangeResult.success) {
        console.error("[auth/callback] OAuth exchange failed:", exchangeResult.error);
        setAuthError(true);
        return;
      }

      // Now that cookies are set, check onboarding status server-side
      const { authenticated, onboardingCompleted } = await checkOnboardingStatus();
      if (!authenticated) {
        router.replace("/login?error=oauth_failed");
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
          <p className="text-red-400">Authentication failed. Please try again.</p>
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
