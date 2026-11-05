"use client";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/studio";
import { inquirySummary } from "@/lib/gallery";
export function GalleryInquiry({
  photo,
  messenger,
  instagram,
}: {
  photo: Photo;
  messenger: string;
  instagram: string;
}) {
  const summary = inquirySummary(photo);
  const [status, setStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <section className="gallery-inquiry" aria-labelledby="inquiry-heading">
      <h3 id="inquiry-heading" tabIndex={-1} ref={heading}>
        Por onde vamos conversar?
      </h3>
      <p>
        Copie a referência deste ensaio e cole na conversa do canal escolhido.
        Nenhuma mensagem é enviada automaticamente.
      </p>
      <label>
        Resumo do ensaio
        <textarea
          aria-label="Resumo do ensaio"
          readOnly
          rows={7}
          value={summary}
        />
      </label>
      <button
        className="button outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(summary);
            setStatus(
              "Resumo copiado. Cole na conversa para solicitar este ensaio.",
            );
          } catch {
            setStatus(
              "Selecione o texto acima e use a opção Copiar do navegador.",
            );
          }
        }}
      >
        Copiar referência do ensaio
      </button>
      <p role="status">{status}</p>
      <div className="confirmation-channels">
        {instagram ? (
          <a
            className="button"
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar pelo Instagram ↗
          </a>
        ) : (
          <button className="button" disabled>
            Conversar pelo Instagram
          </button>
        )}
        {messenger ? (
          <a
            className="button"
            href={messenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar pelo Messenger ↗
          </a>
        ) : (
          <button className="button" disabled>
            Conversar pelo Messenger
          </button>
        )}
      </div>
      {(!instagram || !messenger) && (
        <p className="form-notice">
          Os canais sem link aguardam o cadastro dos endereços oficiais no
          painel. Você pode copiar e guardar a referência; nenhum perfil foi
          inventado.
        </p>
      )}
      <small>
        A solicitação não representa pagamento ou contratação confirmada.
      </small>
    </section>
  );
}
