"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Loader2 } from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    // The InsForge SDK automatically detects `insforge_code` in the URL on init
    // and exchanges it for a session. We just need to wait for getCurrentUser().
    let attempts = 0;

    async function waitForAuth() {
      // Give the SDK a moment to process the OAuth callback
      await new Promise((r) => setTimeout(r, 800));

      while (attempts < 10) {
        attempts++;
        const { data, error } = await insforge.auth.getCurrentUser();

        if (data?.user) {
          // Check if onboarding is done
          const { data: profileData } = await insforge.database
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("user_id", data.user.id)
            .maybeSingle();

          const hasOnboarded = profileData?.onboarding_completed === true;
          router.replace(hasOnboarded ? "/dashboard" : "/onboarding");
          return;
        }

        if (error && attempts >= 5) {
          setStatus("error");
          return;
        }

        await new Promise((r) => setTimeout(r, 500));
      }

      setStatus("error");
    }

    waitForAuth();
  }, [router]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Authentication failed. Please try again.</p>
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
          Signing you in...
        </div>
      </div>
    </div>
  );
}
