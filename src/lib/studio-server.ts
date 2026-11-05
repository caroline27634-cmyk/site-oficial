import "server-only";
import { defaults } from "./studio";
import { publicDb } from "./supabase";
import { contentSchema } from "./validation";
import { cache } from "react";
export const loadStudio = cache(async () => {
  const db = publicDb();
  if (!db) return { content: defaults, connected: false };
  try {
    const { data, error } = await db
      .from("studio_content")
      .select("data,revision")
      .eq("id", 1)
      .single();
    const parsed = contentSchema.safeParse(data?.data);
    if (error || !parsed.success)
      return { content: defaults, connected: false };
    return {
      content: parsed.data,
      connected: true,
      revision: data.revision as number,
    };
  } catch {
    return { content: defaults, connected: false };
  }
});
