"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
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
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)] animate-pulse">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthed") return null;

  return <>{children}</>;
}
