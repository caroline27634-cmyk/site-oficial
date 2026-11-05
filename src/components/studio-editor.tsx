"use client";
import { useState } from "react";
import { saveStudio, uploadPortfolio, deleteQuote } from "@/app/admin/actions";
import type { StudioContent } from "@/lib/studio";
export type Quote = {
  id: string;
  name: string;
  service: string;
  package: string;
  theme: string;
  created_at: string;
};
export function StudioEditor({
  initial,
  initialRevision,
  quotes,
}: {
  initial: StudioContent;
  initialRevision: number;
  quotes: Quote[];
}) {
  const [data, setData] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [tab, setTab] = useState("Textos e redes");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState(quotes);
  const [newCategory, setNewCategory] = useState("");
  function set<K extends keyof StudioContent>(key: K, value: StudioContent[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }
  async function upload(file: File, apply: (url: string) => void) {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await uploadPortfolio(form);
      if (res.url) apply(res.url);
      setStatus(
        res.error || "Imagem enviada. Salve as alterações para exibir no site.",
      );
    } catch {
      setStatus("Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-editor">
      <div className="admin-save">
        <span role="status">
          {status ||
            "Edite e salve para atualizar o site conectado. Não faz deploy."}
        </span>
        <button
          disabled={busy}
          className="button"
          onClick={async () => {
            setBusy(true);
            try {
              const res = await saveStudio(data, revision);
              setStatus(res.error || res.success || "");
              if (res.revision) setRevision(res.revision);
            } catch {
              setStatus("Falha ao salvar. As alterações continuam na tela.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
      <div className="filters">
        {[
          "Textos e redes",
          "Galeria e categorias",
          "Serviços",
          "Preços",
          "Pedidos",
        ].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Textos e redes" && (
        <>
          <h2>Apresentação do estúdio</h2>
          {(
            [
              ["slogan", "Slogan"],
              ["intro", "Apresentação da página inicial"],
              ["about", "Quem somos"],
              ["mission", "Missão"],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              {label}
              <textarea
                value={data[k]}
                onChange={(e) => set(k, e.target.value)}
                rows={3}
              />
            </label>
          ))}
          <label>
            Imagem do banner
            <input
              value={data.heroImage}
              onChange={(e) => set("heroImage", e.target.value)}
            />
          </label>
          <label>
            Substituir imagem do banner
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, (url) => set("heroImage", url));
              }}
            />
          </label>
          <h2>Canais oficiais</h2>
          <p>
            Cadastre somente links verificados. Os campos vazios não criam
            perfis ou canais fictícios.
          </p>
          {(
            [
              ["facebook", "Página oficial do Facebook"],
              ["instagram", "Perfil profissional do Instagram"],
              ["messenger", "Link de conversa do Messenger (m.me)"],
              [
                "instagramDirect",
                "Link oficial de conversa do Instagram (ig.me)",
              ],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                type="url"
                value={data[k]}
                onChange={(e) => set(k, e.target.value)}
                placeholder="https://…"
              />
            </label>
          ))}
        </>
      )}
      {tab === "Galeria e categorias" && (
        <>
          <h2>Categorias e temas</h2>
          <div className="admin-inline">
            <input
              aria-label="Nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              className="button outline"
              onClick={() => {
                const name = newCategory.trim();
                if (name && !data.categories.includes(name)) {
                  set("categories", [...data.categories, name]);
                  setNewCategory("");
                }
              }}
            >
              Adicionar categoria
            </button>
          </div>
          {data.categories.map((category, index) => (
            <div className="admin-inline" key={index}>
              <input
                aria-label={"Categoria " + category}
                value={category}
                onChange={(e) => {
                  const next = e.target.value;
                  setData((d) => ({
                    ...d,
                    categories: d.categories.map((x, i) =>
                      i === index ? next : x,
                    ),
                    photos: d.photos.map((p) =>
                      p.album === category ? { ...p, album: next } : p,
                    ),
                  }));
                }}
              />
              <button
                className="text-link"
                disabled={data.photos.some((p) => p.album === category)}
                onClick={() =>
                  set(
                    "categories",
                    data.categories.filter((_, i) => i !== index),
                  )
                }
              >
                Excluir categoria vazia
              </button>
            </div>
          ))}
          <p>
            Para excluir uma categoria com imagens, mova as imagens para outro
            tema primeiro.
          </p>
          <h2>Fotografias do portfólio</h2>
          <p>
            Apenas imagens demonstrativas ou com autorização específica de
            divulgação. Não envie fotos privadas para o bucket público.
          </p>
          <button
            className="button"
            disabled={!data.categories.length}
            onClick={() =>
              set("photos", [
                ...data.photos,
                {
                  id: crypto.randomUUID(),
                  title: "Nova imagem",
                  album: data.categories[0],
                  image: "/images/studio-balloons.svg",
                },
              ])
            }
          >
            Adicionar imagem
          </button>
          {data.photos.map((p, i) => (
            <fieldset key={p.id}>
              <legend>{p.title}</legend>
              <label>
                Título e descrição acessível
                <input
                  value={p.title}
                  onChange={(e) =>
                    set(
                      "photos",
                      data.photos.map((x, j) =>
                        i === j ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Tema
                <select
                  value={p.album}
                  onChange={(e) =>
                    set(
                      "photos",
                      data.photos.map((x, j) =>
                        i === j ? { ...x, album: e.target.value } : x,
                      ),
                    )
                  }
                >
                  {data.categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Imagem
                <input
                  value={p.image}
                  onChange={(e) =>
                    set(
                      "photos",
                      data.photos.map((x, j) =>
                        i === j ? { ...x, image: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Substituir arquivo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f)
                      void upload(f, (url) =>
                        setData((d) => ({
                          ...d,
                          photos: d.photos.map((x) =>
                            x.id === p.id ? { ...x, image: url } : x,
                          ),
                        })),
                      );
                  }}
                />
              </label>
              <button
                className="text-link"
                onClick={() => {
                  if (
                    confirm(
                      "Remover esta imagem da galeria? O arquivo original será preservado.",
                    )
                  )
                    set(
                      "photos",
                      data.photos.filter((x) => x.id !== p.id),
                    );
                }}
              >
                Remover da galeria
              </button>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Serviços" && (
        <>
          <h2>Serviços do estúdio</h2>
          <button
            className="button"
            onClick={() =>
              set("services", [
                ...data.services,
                {
                  id: crypto.randomUUID(),
                  title: "Novo serviço",
                  description: "Descrição do serviço",
                  image: "/images/studio-balloons.svg",
                },
              ])
            }
          >
            Adicionar serviço
          </button>
          {data.services.map((s, i) => (
            <fieldset key={s.id}>
              <legend>{s.title}</legend>
              {(["title", "description", "image"] as const).map((k) => (
                <label key={k}>
                  {
                    {
                      title: "Nome",
                      description: "Descrição",
                      image: "Endereço da imagem",
                    }[k]
                  }
                  <textarea
                    value={s[k]}
                    onChange={(e) =>
                      set(
                        "services",
                        data.services.map((x, j) =>
                          i === j ? { ...x, [k]: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
              ))}
              <label>
                Substituir imagem
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f)
                      void upload(f, (url) =>
                        setData((d) => ({
                          ...d,
                          services: d.services.map((x) =>
                            x.id === s.id ? { ...x, image: url } : x,
                          ),
                        })),
                      );
                  }}
                />
              </label>
              <button
                className="text-link"
                onClick={() => {
                  if (confirm("Excluir este serviço?"))
                    set(
                      "services",
                      data.services.filter((x) => x.id !== s.id),
                    );
                }}
              >
                Excluir serviço
              </button>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Preços" && (
        <>
          <h2>Pacotes promocionais</h2>
          <p>
            Os valores aparecem no site após salvar. Não há cobrança ou
            pagamento automático.
          </p>
          {data.packages.map((p, i) => (
            <fieldset key={p.id}>
              <legend>{p.title}</legend>
              <label>
                Nome
                <input
                  value={p.title}
                  onChange={(e) =>
                    set(
                      "packages",
                      data.packages.map((x, j) =>
                        i === j ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <div className="form-row">
                <label>
                  Quantidade de fotos
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={p.count}
                    onChange={(e) =>
                      set(
                        "packages",
                        data.packages.map((x, j) =>
                          i === j ? { ...x, count: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Preço em reais
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.cents / 100}
                    onChange={(e) =>
                      set(
                        "packages",
                        data.packages.map((x, j) =>
                          i === j
                            ? {
                                ...x,
                                cents: Math.round(Number(e.target.value) * 100),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Pedidos" && (
        <>
          <h2>Solicitações autorizadas</h2>
          <p>
            O cliente inicia a conversa no Messenger ou Instagram. O registro
            aqui não confirma contratação, pagamento nem o recebimento de uma
            mensagem nessas plataformas.
          </p>
          {!requests.length && (
            <p className="empty-state">Nenhum pedido autorizado registrado.</p>
          )}
          {requests.map((q) => (
            <article className="quote-record" key={q.id}>
              <time>
                {new Date(q.created_at).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </time>
              <h3>{q.name}</h3>
              <p>
                Serviço: {q.service}
                <br />
                Pacote: {q.package}
                <br />
                Tema: {q.theme}
              </p>
              <button
                className="text-link"
                onClick={async () => {
                  if (!confirm("Excluir definitivamente este pedido?")) return;
                  const res = await deleteQuote(q.id);
                  setStatus(res.error || res.success || "");
                  if (!res.error)
                    setRequests((r) => r.filter((x) => x.id !== q.id));
                }}
              >
                Excluir pedido
              </button>
            </article>
          ))}
        </>
      )}
    </div>
  );
}
