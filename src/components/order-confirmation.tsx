"use client";
import Link from "next/link";
import { useMemo, useSyncExternalStore, useState } from "react";
function subscribe(callback: () => void) {
  window.addEventListener("encanto-order-change", callback);
  return () => window.removeEventListener("encanto-order-change", callback);
}
function getSnapshot() {
  try {
    return sessionStorage.getItem("encanto-order");
  } catch {
    return null;
  }
}
export function OrderConfirmation({
  messenger,
  instagram,
}: {
  messenger: string;
  instagram: string;
}) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const order = useMemo(() => {
    try {
      const parsed = JSON.parse(raw || "null");
      return parsed &&
        typeof parsed.summary === "string" &&
        typeof parsed.notice === "string"
        ? (parsed as { summary: string; notice: string; saved: boolean })
        : null;
    } catch {
      return null;
    }
  }, [raw]);
  const [copy, setCopy] = useState("");
  return (
    <div className="confirmation">
      {!order ? (
        <div className="info-panel">
          <p>
            Nenhum resumo disponível neste navegador. Comece escolhendo seu
            serviço.
          </p>
          <Link className="button" href="/contato">
            Preparar solicitação
          </Link>
        </div>
      ) : (
        <>
          <span className="eyebrow">
            {order.saved
              ? "REGISTRO CONFIRMADO NO PAINEL"
              : "RESUMO PRONTO · DADOS NÃO ENVIADOS"}
          </span>
          <h2>Agora, vamos conversar?</h2>
          <p>{order.notice}</p>
          <label>
            Resumo do pedido
            <textarea
              readOnly
              value={order.summary}
              rows={12}
              aria-label="Resumo do pedido"
            />
          </label>
          <button
            className="button outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(order.summary);
                setCopy("Resumo copiado. Cole na conversa do canal escolhido.");
              } catch {
                setCopy(
                  "Selecione o texto do resumo e use a opção copiar do seu navegador.",
                );
              }
            }}
          >
            Copiar resumo do pedido
          </button>
          <p role="status">{copy}</p>
          <div className="confirmation-channels">
            {messenger ? (
              <a
                className="button"
                target="_blank"
                rel="noopener noreferrer"
                href={messenger}
              >
                Conversar pelo Messenger ↗
              </a>
            ) : (
              <button className="button" disabled>
                Conversar pelo Messenger
              </button>
            )}
            {instagram ? (
              <a
                className="button"
                target="_blank"
                rel="noopener noreferrer"
                href={instagram}
              >
                Conversar pelo Instagram ↗
              </a>
            ) : (
              <button className="button" disabled>
                Conversar pelo Instagram
              </button>
            )}
          </div>
          {(!messenger || !instagram) && (
            <p className="form-notice">
              Os canais sem link estão aguardando o cadastro dos endereços
              oficiais pelo estúdio. Nenhuma mensagem é enviada automaticamente.
            </p>
          )}
          <div className="info-panel">
            <strong>Solicitação não é contratação.</strong>
            <p>
              Nenhum pagamento foi realizado. Envie o resumo na conversa para
              confirmar disponibilidade, prazo e condições.
            </p>
          </div>
          <button
            className="text-link"
            onClick={() => {
              sessionStorage.removeItem("encanto-order");
              window.dispatchEvent(new Event("encanto-order-change"));
            }}
          >
            Limpar resumo deste navegador
          </button>
        </>
      )}
      <Link href="/" className="text-link">
        ← Voltar à página inicial
      </Link>
    </div>
  );
}
