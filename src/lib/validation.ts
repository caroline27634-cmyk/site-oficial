import { z } from "zod";
const text = z.string().trim().min(1).max(5000);
export const imagePath = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      /^\/images\/[a-zA-Z0-9/_.-]+$/.test(v) ||
      /^https:\/\/[a-z0-9.-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio\/[a-zA-Z0-9/_.-]+$/.test(
        v,
      ),
    "Use uma imagem local ou do Storage público de portfólio.",
  );
const social = (hosts: string[]) =>
  z
    .string()
    .max(1000)
    .refine((v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return (
          u.protocol === "https:" &&
          !u.username &&
          !u.password &&
          hosts.includes(u.hostname)
        );
      } catch {
        return false;
      }
    }, "Informe uma URL HTTPS oficial do canal.");
export const contentSchema = z
  .object({
    slogan: text,
    intro: text,
    about: text,
    mission: text,
    heroImage: imagePath,
    facebook: social(["facebook.com", "www.facebook.com"]),
    instagram: social(["instagram.com", "www.instagram.com"]),
    messenger: social(["m.me", "www.messenger.com", "messenger.com"]),
    instagramDirect: social(["ig.me", "www.instagram.com", "instagram.com"]),
    categories: z.array(z.string().trim().min(1).max(100)).max(100),
    photos: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          title: text,
          album: text,
          image: imagePath,
          description: z.string().trim().max(2000).default(""),
          kind: z.enum(["placeholder", "ai"]).default("placeholder"),
        }),
      )
      .max(500),
    services: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          title: text,
          description: text,
          image: imagePath,
        }),
      )
      .min(1)
      .max(50),
    packages: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          title: text,
          count: z.number().int().positive().max(10000),
          cents: z.number().int().nonnegative().max(10000000),
        }),
      )
      .min(1)
      .max(20),
  })
  .superRefine((c, ctx) => {
    for (const key of ["photos", "services", "packages"] as const) {
      if (new Set(c[key].map((p) => p.id)).size !== c[key].length)
        ctx.addIssue({
          code: "custom",
          message: "Identificadores devem ser únicos.",
          path: [key],
        });
    }
    if (c.photos.some((p) => !c.categories.includes(p.album)))
      ctx.addIssue({
        code: "custom",
        message: "Cada foto deve pertencer a uma categoria existente.",
        path: ["categories"],
      });
  });
export const quoteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  service: z.string().trim().min(1).max(200),
  package: z.string().trim().min(1).max(200),
  theme: z.string().trim().min(2).max(500),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
});
