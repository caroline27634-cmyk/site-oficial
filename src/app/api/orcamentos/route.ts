import { NextResponse } from "next/server";
import { publicDb } from "@/lib/supabase";
import { boundedJson, BodyTooLarge } from "@/lib/request-body";
import { quoteSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 16000)
    return NextResponse.json(
      { error: "Mensagem muito longa." },
      { status: 413 },
    );
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    const parsedOrigin = new URL(origin || "");
    // Compare the browser-facing Host, not the internal Next.js bind address.
    sameOrigin =
      ["https:", "http:"].includes(parsedOrigin.protocol) &&
      parsedOrigin.host === request.headers.get("host");
  } catch {
    /* Missing or malformed Origin is rejected. */
  }
  if (!sameOrigin)
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  let input;
  try {
    input = quoteSchema.safeParse(await boundedJson(request));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof BodyTooLarge
            ? "Mensagem muito longa."
            : "Dados inválidos.",
      },
      { status: error instanceof BodyTooLarge ? 413 : 400 },
    );
  }
  if (!input.success)
    return NextResponse.json(
      {
        error:
          "Revise nome, serviço, pacote e tema e confirme o consentimento.",
      },
      { status: 400 },
    );
  if (input.data.website)
    return NextResponse.json(
      { error: "Solicitação recusada." },
      { status: 400 },
    );
  const db = publicDb();
  if (!db)
    return NextResponse.json(
      {
        error:
          "O recebimento de orçamentos ainda não está configurado. Nenhum dado foi salvo.",
      },
      { status: 503 },
    );
  try {
    const { error } = await db.rpc("submit_studio_quote", {
      p_name: input.data.name,
      p_service: input.data.service,
      p_package: input.data.package,
      p_theme: input.data.theme,
      p_consent: input.data.consent,
    });
    if (error)
      return NextResponse.json(
        {
          error:
            "Não foi possível registrar agora. Aguarde antes de tentar novamente; se persistir, use um canal oficial configurado.",
        },
        { status: 503 },
      );
    return NextResponse.json({
      message:
        "Solicitação registrada. Copie o resumo e inicie a conversa pelo Messenger ou Instagram.",
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Serviço temporariamente indisponível. Tente novamente mais tarde.",
      },
      { status: 503 },
    );
  }
}
