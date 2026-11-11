"use server";
import { adminSession } from "@/lib/supabase";
import { preparePortfolioImage } from "@/lib/portfolio-upload";
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export async function beginPortfolioUpload(type: string, size: number) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida." };
  const ext = extensions[type];
  if (!ext || !Number.isInteger(size) || size < 1 || size > 5242880)
    return { error: "Use JPEG, PNG ou WebP até 5 MB." };
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await session.db.storage
    .from("portfolio-staging")
    .createSignedUploadUrl(path, { upsert: false });
  if (error || !data)
    return {
      error:
        "Não foi possível preparar o upload. Verifique a migração de Storage.",
    };
  return { path, signedUrl: data.signedUrl };
}
export async function finishPortfolioUpload(path: string) {
  const session = await adminSession();
  if (!session) return { error: "Sessão inválida." };
  if (
    typeof path !== "string" ||
    !path.startsWith(session.user.id + "/") ||
    !new RegExp(
      "^" + session.user.id + "/[a-f0-9-]{36}\\.(jpg|png|webp)$",
    ).test(path)
  )
    return { error: "Referência de upload inválida." };
  const { data, error } = await session.db.storage
    .from("portfolio-staging")
    .download(path);
  if (error || !data)
    return { error: "Upload não encontrado. Tente novamente." };
  try {
    const ext = path.split(".").at(-1)!;
    const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const prepared = await preparePortfolioImage(
      new Uint8Array(await data.arrayBuffer()),
      mime,
    );
    const { error: uploadError } = await session.db.storage
      .from("portfolio")
      .upload(path, prepared.bytes, { contentType: mime, upsert: false });
    if (uploadError)
      return { error: "Não foi possível concluir a imagem pública." };
    return {
      url: session.db.storage.from("portfolio").getPublicUrl(path).data
        .publicUrl,
    };
  } catch {
    return {
      error: "Imagem inválida, animada, acima de 5 MB ou 40 megapixels.",
    };
  } finally {
    await session.db.storage.from("portfolio-staging").remove([path]);
  }
}
