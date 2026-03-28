"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BrandMark } from "@/components/brand/Brand";
import { setSessionFromAccessToken, checkOnboardingStatus } from "@/lib/actions/auth";
import { insforge } from "@/lib/insforge";

function AuthCallbackInner() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function handle() {
      // The InsForge SDK automatically detects `insforge_code` in the URL on
      // initialization, exchanges it for tokens, and stores them in memory.
      // We just need to wait for that to finish.
      await (insforge.auth as unknown as { authCallbackHandled: Promise<void> }).authCallbackHandled;

      // Get the access token the SDK just stored in memory.
      const session = (insforge.auth as unknown as { tokenManager: { getSession: () => { accessToken: string } | null } }).tokenManager.getSession();

      if (!session?.accessToken) {
        const providerError = new URLSearchParams(window.location.search).get("error");
        const msg = providerError
          ? `OAuth error from provider: ${providerError}`
          : "Sign-in was not completed. Please try again from the login screen.";
        setAuthError(msg);
        return;
      }

      // Pass the access token to the server so it can set httpOnly cookies.
      const result = await setSessionFromAccessToken(session.accessToken);
      if (!result.success) {
        setAuthError(result.error ?? "Failed to complete sign-in.");
        return;
      }

      // Cookies are now set — check onboarding status and redirect.
      const { authenticated, onboardingCompleted } = await checkOnboardingStatus();
      if (!authenticated) {
        setAuthError("Authentication check failed after sign-in.");
        return;
      }

      router.replace(onboardingCompleted ? "/dashboard" : "/onboarding");
    }

    handle();
  }, [router]);

  if (authError) {
    return (
      <div className="auth-shell">
        <div className="premium-panel w-full max-w-md p-8 text-center">
          <BrandMark className="mx-auto mb-5 h-10 w-10" />
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
        <BrandMark className="h-10 w-10" />
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing you in…
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return <AuthCallbackInner />;
}
