"use server";

import { createServerClient, getAccessToken } from "@/lib/insforge-server";

export interface OnboardingProfile {
  experience: "beginner" | "basic" | "intermediate" | "advanced";
  familiarity: string[];
  markets: string[];
  goal: "learning-basics" | "becoming-consistent" | "building-strategy" | "improving-discipline";
  timeCommitment: "casual" | "moderate" | "serious";
}

export async function saveOnboardingProfile(profile: OnboardingProfile) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Not authenticated." };

  const client = createServerClient(accessToken);
  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user?.id) return { success: false, error: "No session." };

  const userId = userData.user.id;

  const { error } = await client.database
    .from("user_profiles")
    .insert([
      {
        user_id: userId,
        experience: profile.experience,
        familiarity: profile.familiarity,
        markets: profile.markets,
        goal: profile.goal,
        time_commitment: profile.timeCommitment,
        onboarding_completed: true,
      },
    ])
    .select();

  if (error) {
    // Try update if insert fails (user already has a profile)
    const { error: updateError } = await client.database
      .from("user_profiles")
      .update({
        experience: profile.experience,
        familiarity: profile.familiarity,
        markets: profile.markets,
        goal: profile.goal,
        time_commitment: profile.timeCommitment,
        onboarding_completed: true,
      })
      .eq("user_id", userId);
    if (updateError) return { success: false, error: updateError.message };
  }

  return { success: true };
}

export async function getOnboardingProfile(): Promise<OnboardingProfile | null> {
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
