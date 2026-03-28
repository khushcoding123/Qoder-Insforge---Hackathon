"use server";

import { createServerClient, getAccessToken } from "@/lib/insforge-server";

export interface SavedStrategy {
  userId: string;
  blueprintText: string;
  strategyName: string;
  assetClass: string;
  tradingStyle: string;
  experienceLevel: string;
  riskTolerance: string;
  preferredConcepts: string[];
  createdAt: string;
  updatedAt: string;
}

function extractStrategyName(blueprintText: string): string {
  const match = blueprintText.match(/\*\*Strategy Name\*\*:\s*(.+)/i);
  return match?.[1]?.trim() || "My Strategy";
}

export async function saveStrategy(params: {
  blueprintText: string;
  assetClass: string;
  tradingStyle: string;
  experienceLevel: string;
  riskTolerance: string;
  preferredConcepts: string[];
}) {
  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Not authenticated." };

  const client = createServerClient(accessToken);
  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user?.id) return { success: false, error: "No session." };

  const userId = userData.user.id;
  const strategyName = extractStrategyName(params.blueprintText);

  const { error } = await client.database
    .from("user_strategies")
    .upsert(
      {
        user_id: userId,
        blueprint_text: params.blueprintText,
        strategy_name: strategyName,
        asset_class: params.assetClass,
        trading_style: params.tradingStyle,
        experience_level: params.experienceLevel,
        risk_tolerance: params.riskTolerance,
        preferred_concepts: JSON.stringify(params.preferredConcepts),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true, strategyName };
}

export async function getStrategy(): Promise<SavedStrategy | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const client = createServerClient(accessToken);
  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) return null;

  const { data, error } = await client.database
    .from("user_strategies")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    blueprintText: data.blueprint_text,
    strategyName: data.strategy_name,
    assetClass: data.asset_class,
    tradingStyle: data.trading_style,
    experienceLevel: data.experience_level,
    riskTolerance: data.risk_tolerance,
    preferredConcepts: JSON.parse(data.preferred_concepts || "[]"),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/** Used by extension API routes — accepts a raw access token instead of cookies */
export async function getStrategyByToken(accessToken: string): Promise<SavedStrategy | null> {
  const client = createServerClient(accessToken);
  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) return null;

  const { data, error } = await client.database
    .from("user_strategies")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    blueprintText: data.blueprint_text,
    strategyName: data.strategy_name,
    assetClass: data.asset_class,
    tradingStyle: data.trading_style,
    experienceLevel: data.experience_level,
    riskTolerance: data.risk_tolerance,
    preferredConcepts: JSON.parse(data.preferred_concepts || "[]"),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
