"use server";

import { createServerClient, getAccessToken } from "@/lib/insforge-server";

export interface OnboardingProfile {
  experience: "beginner" | "basic" | "intermediate" | "advanced";
  familiarity: string[];
  markets: string[];
  goal: "learning-basics" | "becoming-consistent" | "building-strategy" | "improving-discipline";
  timeCommitment: "casual" | "moderate" | "serious";
}

const DEV_UI_PREVIEW = process.env.NODE_ENV !== "production";

const DEV_PREVIEW_PROFILE: OnboardingProfile = {
  experience: "intermediate",
  familiarity: ["price-action", "risk-management", "psychology"],
  markets: ["stocks", "crypto"],
  goal: "building-strategy",
  timeCommitment: "moderate",
};

export async function saveOnboardingProfile(profile: OnboardingProfile) {
  if (DEV_UI_PREVIEW) {
    return { success: true };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Not authenticated." };

  const client = createServerClient(accessToken);
  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user?.id) return { success: false, error: "No session." };

  const userId = userData.user.id;

  const { error } = await client.database
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        experience: profile.experience,
        familiarity: profile.familiarity,
        markets: profile.markets,
        goal: profile.goal,
        time_commitment: profile.timeCommitment,
        onboarding_completed: true,
      },
      { onConflict: "user_id" }
    );

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function getOnboardingProfile(): Promise<OnboardingProfile | null> {
  if (DEV_UI_PREVIEW) {
    return DEV_PREVIEW_PROFILE;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const client = createServerClient(accessToken);
  const { data, error } = await client.database
    .from("user_profiles")
    .select("experience, familiarity, markets, goal, time_commitment, onboarding_completed")
    .maybeSingle();

  if (error || !data || !data.onboarding_completed) return null;

  return {
    experience: data.experience,
    familiarity: data.familiarity,
    markets: data.markets,
    goal: data.goal,
    timeCommitment: data.time_commitment,
  };
}

export async function markTopicComplete(topicId: string, topicTitle: string, topicCategory: string) {
  if (DEV_UI_PREVIEW) {
    return { success: true };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false };

  const client = createServerClient(accessToken);
  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) return { success: false };

  const userId = userData.user.id;

  await client.database
    .from("user_learn_progress")
    .insert([
      {
        user_id: userId,
        topic_id: topicId,
        topic_title: topicTitle,
        topic_category: topicCategory,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
    ])
    .select();

  return { success: true };
}

export async function getLearnProgress() {
  if (DEV_UI_PREVIEW) return [];

  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  const client = createServerClient(accessToken);
  const { data, error } = await client.database
    .from("user_learn_progress")
    .select("topic_id, topic_title, topic_category, status, completed_at")
    .order("completed_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
