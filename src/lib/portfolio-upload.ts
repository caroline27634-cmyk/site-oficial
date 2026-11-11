import sharp from "sharp";
export async function preparePortfolioImage(bytes: Uint8Array, mime: string) {
  const ext = (
    { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<
      string,
      string
    >
  )[mime];
  if (!ext || !bytes.length || bytes.length > 5 * 1024 * 1024)
    throw new Error("invalid file");
  const image = sharp(bytes, { limitInputPixels: 40000000, failOn: "warning" });
  const metadata = await image.metadata();
  if (
    !["jpeg", "png", "webp"].includes(metadata.format || "") ||
    (metadata.pages || 1) > 1 ||
    !metadata.width ||
    !metadata.height
  )
    throw new Error("invalid image");
  if (
    ({ jpg: "jpeg", png: "png", webp: "webp" } as Record<string, string>)[
      ext
    ] !== metadata.format
  )
    throw new Error("mime mismatch");
  // Decode, apply orientation, and strip EXIF/GPS. No resizing or creative alteration.
  const rotated = image.rotate();
  const output = await (
    ext === "jpg"
      ? rotated.jpeg({ quality: 95 })
      : ext === "png"
        ? rotated.png()
        : rotated.webp({ quality: 95 })
  ).toBuffer();
  if (output.length > 5 * 1024 * 1024) throw new Error("output too large");
  return { bytes: output, ext, mime };
}
