"use client";
import {
  beginPortfolioUpload,
  finishPortfolioUpload,
} from "@/app/admin/upload-actions";
export async function uploadPortfolioFile(file: File) {
  if (
    file.size > 5242880 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    return { error: "Use JPEG, PNG ou WebP até 5 MB." };
  const prepared = await beginPortfolioUpload(file.type, file.size);
  if (prepared.error || !prepared.signedUrl || !prepared.path)
    return { error: prepared.error || "Upload indisponível." };
  // Direct signed upload to a private staging bucket avoids Vercel function body limits.
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  const response = await fetch(prepared.signedUrl, {
    method: "PUT",
    headers: { "x-upsert": "false" },
    body,
  });
  if (!response.ok)
    return {
      error: "Não foi possível enviar o arquivo ao armazenamento privado.",
    };
  return finishPortfolioUpload(prepared.path);
}
