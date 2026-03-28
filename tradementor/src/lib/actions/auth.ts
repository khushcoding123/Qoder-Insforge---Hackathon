"use server";

import { createServerClient, setAuthCookies, clearAuthCookies, getAccessToken } from "@/lib/insforge-server";

export async function signUp(formData: {
  email: string;
  password: string;
  name: string;
}) {
  const client = createServerClient();
  const { data, error } = await client.auth.signUp({
    email: formData.email,
    password: formData.password,
    name: formData.name,
  });
  if (error) return { success: false, error: error.message };
  if (data?.requireEmailVerification) {
    return { success: true, requireVerification: true, email: formData.email };
  }
  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
    return { success: true, requireVerification: false };
  }
  return { success: false, error: "Unexpected sign-up response." };
}

export async function verifyEmail(email: string, otp: string) {
  const client = createServerClient();
  const { data, error } = await client.auth.verifyEmail({ email, otp });
  if (error) return { success: false, error: error.message };
  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
    return { success: true };
  }
  return { success: false, error: "Verification failed." };
}

export async function resendVerification(email: string) {
  const client = createServerClient();
  try {
    await client.auth.resendVerificationEmail({ email });
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to resend." };
  }
}

export async function signIn(formData: { email: string; password: string }) {
  const client = createServerClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });
  if (error) {
    if (error.statusCode === 403) {
      return { success: false, error: "Please verify your email first.", needsVerification: true, email: formData.email };
    }
    return { success: false, error: error.message };
  }
  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
    return { success: true };
  }
  return { success: false, error: "Sign in failed." };
}

export async function signOut() {
  const client = createServerClient();
  await client.auth.signOut();
  await clearAuthCookies();
  return { success: true };
}

/**
 * Exchange an OAuth authorization code for tokens and set server-side cookies.
 * Called from the /auth/callback page after Google OAuth redirects back.
 */
export async function handleOAuthCallback(code: string, codeVerifier?: string) {
  const client = createServerClient(); // no token needed — we're exchanging the code
  const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier);
  if (error) return { success: false, error: error.message };
  if (!data?.accessToken || !data?.refreshToken) {
    return { success: false, error: "OAuth exchange failed: no tokens received." };
  }
  await setAuthCookies(data.accessToken, data.refreshToken);
  return { success: true };
}

/**
 * Server-side check: is the current request authenticated, and has the user
 * completed onboarding? Uses httpOnly cookies so it works after both
 * email/password login and Google OAuth.
 */
export async function checkOnboardingStatus(): Promise<{
  authenticated: boolean;
  onboardingCompleted: boolean;
}> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { authenticated: false, onboardingCompleted: false };

  const client = createServerClient(accessToken);
  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user?.id) return { authenticated: false, onboardingCompleted: false };

  const { data: profileData } = await client.database
    .from("user_profiles")
    .select("onboarding_completed")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return {
    authenticated: true,
    onboardingCompleted: profileData?.onboarding_completed === true,
  };
}

