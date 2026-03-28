import { createClient } from "@insforge/sdk";

// Browser-side InsForge client (uses httpOnly cookies managed by the server)
export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});
