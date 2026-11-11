import { z } from "zod";
export const privatePromptSchema = z
  .object({
    photo_id: z.string().trim().min(1).max(100),
    prompt: z.string().trim().min(1).max(12000),
    guidance: z.string().max(5000).default(""),
  })
  .strict();
export const promptImportSchema = z
  .object({ items: z.array(privatePromptSchema).min(1).max(500) })
  .strict()
  .refine(
    (v) => new Set(v.items.map((p) => p.photo_id)).size === v.items.length,
    "Cada referência deve aparecer uma única vez.",
  );
export type PrivatePrompt = {
  photo_id: string;
  prompt: string;
  guidance: string;
  revision: number;
};
