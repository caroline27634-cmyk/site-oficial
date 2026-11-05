"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StudioContent } from "@/lib/studio";
import { money } from "@/lib/studio";
export function ContactForm({
  interest = "",
  enabled = false,
  content: c,
}: {
  interest?: string;
  enabled?: boolean;
  content: StudioContent;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        const form = e.currentTarget;
        const fd = new FormData(form);
        const payload = {
          name: String(fd.get("name")),
          service: String(fd.get("service")),
          package: String(fd.get("package")),
          theme: String(fd.get("theme")),
          consent: fd.get("consent") === "on",
          website: String(fd.get("website") || ""),
        };
        setPending(true);
        setStatus("");
        let saved = false;
        let notice =
          "Você escolheu não registrar os dados no painel. Copie o resumo para conversar com o estúdio.";
        if (payload.consent) {
          if (!enabled) {
            setPending(false);
            setStatus(
              "O registro ainda não está disponível. Desmarque a autorização para gerar apenas o resumo, sem enviar seus dados.",
            );
            return;
          }
          try {
            const res = await fetch("/api/orcamentos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (!res.ok) {
              setPending(false);
              setStatus(
                result.error ||
                  "Registro indisponível. Desmarque a autorização se preferir gerar apenas o resumo.",
              );
              return;
            }
            saved = true;
            notice =
              "Pedido registrado no painel. Para iniciar o atendimento, envie o resumo por um dos canais oficiais.";
          } catch {
            setPending(false);
            setStatus(
              "Não foi possível confirmar o registro. Tente novamente ou desmarque a autorização para continuar sem enviar os dados.",
            );
            return;
          }
        }
        const summary = `SOLICITAÇÃO — Encanto no Retrato Studio IA\nNome: ${payload.name}\nServiço: ${payload.service}\nPacote: ${payload.package}\nTema: ${payload.theme}\n\nEsta solicitação não representa pagamento ou contratação confirmada. Tema, prazo, condições e disponibilidade serão alinhados na conversa.`;
        try {
          sessionStorage.setItem(
            "encanto-order",
            JSON.stringify({ summary, saved, notice }),
          );
          router.push("/contato/confirmacao");
        } catch {
          setStatus(
            "O navegador bloqueou o armazenamento temporário. Habilite-o para visualizar o resumo.",
          );
          setPending(false);
        }
      }}
    >
      <span className="eyebrow">SEU PRÓXIMO MOMENTO ESPECIAL</span>
      <h2>Escolha seu encanto.</h2>
      <label>
        Como podemos chamar você?
        <input
          name="name"
          autoComplete="given-name"
          required
          minLength={2}
          maxLength={100}
        />
      </label>
      <label>
        Serviço
        <select
          name="service"
          required
          defaultValue={
            c.services.some((s) => s.title === interest) ? interest : ""
          }
        >
          <option value="" disabled>
            Escolha um serviço
          </option>
          {c.services.map((s) => (
            <option key={s.id} value={s.title}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Pacote
        <select
          name="package"
          required
          defaultValue={
            c.packages.some(
              (p) =>
                `${p.count} ${p.count === 1 ? "foto" : "fotos"} — ${money(p.cents)}` ===
                interest,
            )
              ? interest
              : "A combinar"
          }
        >
          <option>A combinar</option>
          {c.packages.map((p) => (
            <option key={p.id}>
              {p.count} {p.count === 1 ? "foto" : "fotos"} — {money(p.cents)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tema desejado
        <textarea
          name="theme"
          required
          minLength={2}
          maxLength={500}
          rows={3}
          placeholder="Ex.: jardim encantado, tons suaves, aniversário… Não inclua fotografias ou dados sensíveis."
        />
      </label>
      <div hidden aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="checkbox">
        <input name="consent" type="checkbox" disabled={!enabled} />
        Autorizo registrar meu nome e as escolhas deste pedido no painel privado
        do estúdio. Opcional: sem marcar, apenas o resumo será criado neste
        navegador.
      </label>
      {!enabled && (
        <p className="form-notice">
          O registro no painel aguarda a configuração do Supabase. Você já pode
          gerar e copiar o resumo, sem enviar dados.
        </p>
      )}
      <Link href="/privacidade" className="text-link">
        Privacidade e uso de imagens ↗
      </Link>
      <button className="button" disabled={pending}>
        {pending ? "Preparando…" : "Revisar solicitação →"}
      </button>
      <p className="form-notice" role="status">
        {status ||
          "Não é um pagamento nem uma contratação. O atendimento ocorre exclusivamente pelo Messenger ou Instagram Direct."}
      </p>
    </form>
  );
}
