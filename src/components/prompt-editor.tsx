"use client";
import { useState } from "react";
import {
  savePrivatePrompt,
  importPrivatePrompts,
  deletePrivatePrompt,
} from "@/app/admin/prompts/actions";
import type { PrivatePrompt } from "@/lib/private-prompts";
export function PromptEditor({
  initial,
  photos,
}: {
  initial: PrivatePrompt[];
  photos: { id: string; title: string }[];
}) {
  const [rows, setRows] = useState(initial);
  const [id, setId] = useState(photos[0]?.id || "");
  const [prompt, setPrompt] = useState(
    initial.find((r) => r.photo_id === id)?.prompt || "",
  );
  const [guidance, setGuidance] = useState(
    initial.find((r) => r.photo_id === id)?.guidance || "",
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const row = rows.find((r) => r.photo_id === id);
  function choose(next: string) {
    setId(next);
    const selected = rows.find((r) => r.photo_id === next);
    setPrompt(selected?.prompt || "");
    setGuidance(selected?.guidance || "");
    setMessage("");
  }
  return (
    <div className="admin-editor">
      <p>
        Conteúdo restrito à administradora. Prompts não entram no conteúdo
        público da galeria. Guardar aqui não cria nem publica imagens.
      </p>
      <label>
        Importar arquivo privado JSON (máximo 2 MB)
        <input
          type="file"
          accept="application/json,.json"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 2000000) {
              setMessage("Arquivo muito grande.");
              return;
            }
            setBusy(true);
            try {
              const result = await importPrivatePrompts(
                JSON.parse(await file.text()),
              );
              setMessage(result.error || result.success || "");
              if (result.rows) {
                setRows((old) => [...old, ...result.rows]);
                const selected = result.rows.find((r) => r.photo_id === id);
                if (selected && !row) {
                  setPrompt(selected.prompt);
                  setGuidance(selected.guidance);
                }
              }
            } catch {
              setMessage("Não foi possível importar o arquivo.");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      <label>
        Referência
        <select value={id} onChange={(e) => choose(e.target.value)}>
          {photos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.id})
            </option>
          ))}
          {rows
            .filter((r) => !photos.some((p) => p.id === r.photo_id))
            .map((r) => (
              <option key={r.photo_id}>{r.photo_id}</option>
            ))}
        </select>
      </label>
      <label>
        Prompt de reprodução
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={10}
          maxLength={12000}
        />
      </label>
      <label>
        Orientações e personalização
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          rows={5}
          maxLength={5000}
        />
      </label>
      <div className="admin-inline">
        <button
          className="button"
          disabled={busy || !id || !prompt.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              const result = await savePrivatePrompt(
                { photo_id: id, prompt, guidance },
                row?.revision ?? null,
              );
              setMessage(result.error || result.success || "");
              if (result.row)
                setRows((old) => [
                  ...old.filter((r) => r.photo_id !== id),
                  result.row!,
                ]);
            } catch {
              setMessage("Não foi possível salvar.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Salvar prompt privado
        </button>
        <button
          className="button outline"
          disabled={busy || !row}
          onClick={async () => {
            if (!row || !confirm("Excluir este prompt da área privada?"))
              return;
            setBusy(true);
            try {
              const result = await deletePrivatePrompt(id, row.revision);
              setMessage(result.error || result.success || "");
              if (!result.error) {
                setRows((old) => old.filter((r) => r.photo_id !== id));
                setPrompt("");
                setGuidance("");
              }
            } catch {
              setMessage("Não foi possível excluir. Recarregue a lista.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Excluir prompt
        </button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
