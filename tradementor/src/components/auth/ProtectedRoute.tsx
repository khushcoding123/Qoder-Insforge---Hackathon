"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/Brand";
import { checkOnboardingStatus } from "@/lib/actions/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        // Server action reads httpOnly cookies — works for both email/password
        // and Google OAuth flows.
        const { authenticated, onboardingCompleted } = await checkOnboardingStatus();
        if (cancelled) return;

        if (!authenticated) {
          router.replace("/login");
          setStatus("unauthed");
          return;
        }

        if (requireOnboarding && !onboardingCompleted && pathname !== "/onboarding") {
          router.replace("/onboarding");
          setStatus("unauthed");
          return;
        }

        setStatus("authed");
      } catch {
        if (!cancelled) {
          router.replace("/login");
          setStatus("unauthed");
        }
      }
    }

    check();
    return () => { cancelled = true; };
  }, [router, pathname, requireOnboarding]);

  if (status === "loading") {
    return (
      <div className="auth-shell">
        <div className="flex flex-col items-center gap-4">
          <BrandMark className="h-10 w-10 animate-pulse" />
          <p className="text-sm text-zinc-500">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthed") return null;

  return <>{children}</>;
}
