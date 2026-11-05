"use client";
import { useState } from "react";
import { saveMarketing } from "@/app/admin/marketing-actions";
import { suggestions, type Marketing } from "@/lib/marketing";
import { uploadPortfolio } from "@/app/admin/actions";
export function MarketingEditor({
  initial,
  initialRevision,
}: {
  initial: Marketing;
  initialRevision: number;
}) {
  const [data, setData] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [tab, setTab] = useState("Calendário");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  function patch<K extends keyof Marketing>(
    key: K,
    id: string,
    value: Partial<Marketing[K][number]>,
  ) {
    setData((d) => ({
      ...d,
      [key]: d[key].map((item) =>
        item.id === id
          ? {
              ...item,
              ...value,
              ...(key === "campaigns" && !("status" in value)
                ? { status: "Rascunho" }
                : {}),
            }
          : item,
      ),
    }));
  }
  function remove(key: keyof Marketing, id: string) {
    if (
      confirm(
        "Remover este registro da Central? O compartilhamento nas redes não será afetado.",
      )
    )
      setData((d) => ({
        ...d,
        [key]: d[key].filter((item) => item.id !== id),
      }));
  }
  const firstDay = new Date(`${month || "2000-01"}-01T12:00:00Z`);
  const offset = (firstDay.getUTCDay() + 6) % 7;
  const dayCount = new Date(
    firstDay.getUTCFullYear(),
    firstDay.getUTCMonth() + 1,
    0,
  ).getDate();
  const today = () => new Date().toISOString().slice(0, 10);
  return (
    <div className="admin-editor">
      <div className="admin-save">
        <span role="status">
          {message || "Alterações locais: use Salvar Central para persistir."}
        </span>
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await saveMarketing(data, revision);
              setMessage(res.error || res.success || "");
              if (res.revision) setRevision(res.revision);
            } catch {
              setMessage("Falha ao salvar. Suas alterações continuam na tela.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Salvando…" : "Salvar Central"}
        </button>
      </div>
      <div className="filters">
        {[
          "Calendário",
          "Campanhas",
          "Materiais",
          "Grupos",
          "Histórico e métricas",
          "Sugestões",
          "Integração Meta",
        ].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Calendário" && (
        <>
          <label>
            Mês de planejamento
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
          {month && (
            <div className="calendar-scroll">
              <div
                className="calendar-grid"
                aria-label="Calendário mensal de conteúdo"
              >
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                  (day) => (
                    <strong key={day}>{day}</strong>
                  ),
                )}
                {Array.from({ length: offset }, (_, i) => (
                  <div key={"blank-" + i} className="calendar-blank" />
                ))}
                {Array.from({ length: dayCount }, (_, i) => {
                  const date = `${month}-${String(i + 1).padStart(2, "0")}`;
                  return (
                    <div className="calendar-day" key={date}>
                      <time dateTime={date}>{i + 1}</time>
                      {data.campaigns
                        .filter((c) => c.date === date)
                        .map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setTab("Campanhas")}
                            title={c.channel + " · " + c.status}
                          >
                            {c.title}
                          </button>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="calendar-list">
            {data.campaigns
              .filter((c) => c.date.startsWith(month))
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((c) => (
                <article key={c.id}>
                  <time>{c.date.split("-").reverse().join("/")}</time>
                  <h3>{c.title}</h3>
                  <p>
                    {c.channel} · {c.status}
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setTab("Campanhas")}
                  >
                    Editar planejamento →
                  </button>
                </article>
              ))}
          </div>
          {!data.campaigns.some((c) => c.date.startsWith(month)) && (
            <p className="empty-state">
              Nenhuma campanha planejada neste mês. Cadastre uma em Campanhas.
            </p>
          )}
          <p className="demo-note">
            Datas são lembretes de planejamento, sem agendamento automático ou
            horário de publicação.
          </p>
        </>
      )}
      {tab === "Campanhas" && (
        <>
          <button
            className="button"
            onClick={() =>
              setData((d) => ({
                ...d,
                campaigns: [
                  ...d.campaigns,
                  {
                    id: crypto.randomUUID(),
                    title: "Nova campanha",
                    date: today(),
                    channel: "Ambos",
                    status: "Rascunho",
                    image: "",
                    caption: "",
                    hashtags: "",
                    notes: "",
                  },
                ],
              }))
            }
          >
            Adicionar campanha
          </button>
          {data.campaigns.map((c) => (
            <fieldset key={c.id}>
              <legend>{c.title}</legend>
              <label>
                Nome
                <input
                  value={c.title}
                  onChange={(e) =>
                    patch("campaigns", c.id, { title: e.target.value })
                  }
                />
              </label>
              <div className="form-row">
                <label>
                  Data planejada
                  <input
                    type="date"
                    value={c.date}
                    onChange={(e) =>
                      patch("campaigns", c.id, { date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Canal
                  <select
                    value={c.channel}
                    onChange={(e) =>
                      patch("campaigns", c.id, {
                        channel: e.target.value as typeof c.channel,
                      })
                    }
                  >
                    {["Facebook", "Instagram", "Ambos"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Material da biblioteca
                <select
                  value={c.image}
                  onChange={(e) =>
                    patch("campaigns", c.id, { image: e.target.value })
                  }
                >
                  <option value="">Sem imagem</option>
                  {c.image &&
                    !data.materials.some((m) => m.image === c.image) && (
                      <option value={c.image}>Imagem atual</option>
                    )}
                  {data.materials.map((m) => (
                    <option key={m.id} value={m.image}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Legenda
                <textarea
                  value={c.caption}
                  onChange={(e) =>
                    patch("campaigns", c.id, { caption: e.target.value })
                  }
                  rows={4}
                />
              </label>
              <label>
                Hashtags
                <textarea
                  value={c.hashtags}
                  onChange={(e) =>
                    patch("campaigns", c.id, { hashtags: e.target.value })
                  }
                />
              </label>
              <label>
                Observações
                <textarea
                  value={c.notes}
                  onChange={(e) =>
                    patch("campaigns", c.id, { notes: e.target.value })
                  }
                />
              </label>
              <p>
                Status: <strong>{c.status}</strong>
              </p>
              <div className="admin-inline">
                <button
                  className="button outline"
                  onClick={() => {
                    if (
                      confirm(
                        "Aprovar este material para uso manual? Isso não publica a campanha.",
                      )
                    )
                      patch("campaigns", c.id, {
                        status: "Aprovada para uso manual",
                      });
                  }}
                >
                  Aprovar material
                </button>
                <button
                  className="text-link"
                  onClick={() =>
                    patch("campaigns", c.id, { status: "Rascunho" })
                  }
                >
                  Voltar a rascunho
                </button>
                <button
                  className="text-link"
                  disabled={c.status === "Rascunho"}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        c.caption + "\n\n" + c.hashtags,
                      );
                      setMessage(
                        "Texto copiado. Revise as regras do destino antes de compartilhar manualmente.",
                      );
                    } catch {
                      setMessage(
                        "Selecione o texto da legenda e copie pelo navegador.",
                      );
                    }
                  }}
                >
                  Copiar texto aprovado
                </button>
                <button
                  className="text-link"
                  onClick={() => remove("campaigns", c.id)}
                >
                  Excluir campanha
                </button>
              </div>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Materiais" && (
        <>
          <p>
            Somente materiais demonstrativos ou com autorização para divulgação.
            O bucket de portfólio é público: nunca envie fotografias privadas de
            clientes.
          </p>
          <label>
            Enviar material (JPEG, PNG ou WebP até 5 MB)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const fd = new FormData();
                  fd.set("file", file);
                  const res = await uploadPortfolio(fd);
                  if (res.url)
                    setData((d) => ({
                      ...d,
                      materials: [
                        ...d.materials,
                        {
                          id: crypto.randomUUID(),
                          title: file.name,
                          image: res.url!,
                          notes: "",
                        },
                      ],
                    }));
                  setMessage(
                    res.error ||
                      "Material enviado. Salve a Central para registrar na biblioteca.",
                  );
                } catch {
                  setMessage("Upload indisponível.");
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          {data.materials.map((m) => (
            <fieldset key={m.id}>
              <legend>{m.title}</legend>
              <label>
                Título
                <input
                  value={m.title}
                  onChange={(e) =>
                    patch("materials", m.id, { title: e.target.value })
                  }
                />
              </label>
              <label>
                Endereço da imagem
                <input
                  value={m.image}
                  onChange={(e) =>
                    patch("materials", m.id, { image: e.target.value })
                  }
                />
              </label>
              <a
                className="text-link"
                href={m.image}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir imagem ↗
              </a>
              <label>
                Autorização e observações
                <textarea
                  value={m.notes}
                  onChange={(e) =>
                    patch("materials", m.id, { notes: e.target.value })
                  }
                />
              </label>
              <button
                className="text-link"
                onClick={() => remove("materials", m.id)}
              >
                Remover da biblioteca
              </button>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Grupos" && (
        <>
          <button
            className="button"
            onClick={() =>
              setData((d) => ({
                ...d,
                groups: [
                  ...d.groups,
                  {
                    id: crypto.randomUUID(),
                    name: "Novo grupo",
                    url: "",
                    rules: "",
                  },
                ],
              }))
            }
          >
            Cadastrar grupo
          </button>
          <p className="demo-note">
            Confira as regras e a permissão de divulgação antes de compartilhar.
            A central não entra em grupos nem publica neles.
          </p>
          {data.groups.map((g) => (
            <fieldset key={g.id}>
              <legend>{g.name}</legend>
              <label>
                Nome
                <input
                  value={g.name}
                  onChange={(e) =>
                    patch("groups", g.id, { name: e.target.value })
                  }
                />
              </label>
              <label>
                Link do grupo
                <input
                  type="url"
                  value={g.url}
                  onChange={(e) =>
                    patch("groups", g.id, { url: e.target.value })
                  }
                />
              </label>
              <label>
                Regras e restrições
                <textarea
                  value={g.rules}
                  onChange={(e) =>
                    patch("groups", g.id, { rules: e.target.value })
                  }
                />
              </label>
              {/^https:\/\/(www\.)?facebook\.com\/groups\//.test(g.url) && (
                <a
                  className="button outline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={g.url}
                >
                  Abrir grupo para compartilhar manualmente ↗
                </a>
              )}
              <button
                className="text-link"
                onClick={() => remove("groups", g.id)}
              >
                Excluir grupo
              </button>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Histórico e métricas" && (
        <>
          <button
            className="button"
            onClick={() =>
              setData((d) => ({
                ...d,
                history: [
                  ...d.history,
                  {
                    id: crypto.randomUUID(),
                    campaign: "",
                    destination: "",
                    date: today(),
                    notes: "",
                    reach: null,
                    interactions: null,
                  },
                ],
              }))
            }
          >
            Registrar compartilhamento manual
          </button>
          <p>
            Registros e métricas inseridos manualmente por você, sem coleta da
            Meta. Campo vazio significa métrica desconhecida, não zero.
          </p>
          {data.history.map((h) => (
            <fieldset key={h.id}>
              <legend>Registro de divulgação</legend>
              <label>
                Campanha
                <input
                  value={h.campaign}
                  onChange={(e) =>
                    patch("history", h.id, { campaign: e.target.value })
                  }
                  list="campaigns"
                />
                <datalist id="campaigns">
                  {data.campaigns.map((c) => (
                    <option key={c.id} value={c.title} />
                  ))}
                </datalist>
              </label>
              <label>
                Conta ou grupo de destino
                <input
                  value={h.destination}
                  onChange={(e) =>
                    patch("history", h.id, { destination: e.target.value })
                  }
                />
              </label>
              <label>
                Data
                <input
                  type="date"
                  value={h.date}
                  onChange={(e) =>
                    patch("history", h.id, { date: e.target.value })
                  }
                />
              </label>
              <div className="form-row">
                <label>
                  Alcance informado
                  <input
                    type="number"
                    min="0"
                    value={h.reach ?? ""}
                    onChange={(e) =>
                      patch("history", h.id, {
                        reach:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Interações informadas
                  <input
                    type="number"
                    min="0"
                    value={h.interactions ?? ""}
                    onChange={(e) =>
                      patch("history", h.id, {
                        interactions:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Observações e origem das métricas
                <textarea
                  value={h.notes}
                  onChange={(e) =>
                    patch("history", h.id, { notes: e.target.value })
                  }
                />
              </label>
              <button
                className="text-link"
                onClick={() => remove("history", h.id)}
              >
                Excluir registro
              </button>
            </fieldset>
          ))}
        </>
      )}
      {tab === "Sugestões" && (
        <div className="suggestion-grid">
          {suggestions.map((s) => (
            <article key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <button
                className="button outline"
                onClick={() => {
                  setData((d) => ({
                    ...d,
                    campaigns: [
                      ...d.campaigns,
                      {
                        id: crypto.randomUUID(),
                        title: s.title,
                        date: today(),
                        channel: "Ambos",
                        status: "Rascunho",
                        caption: s.text,
                        hashtags: "",
                        image: "",
                        notes:
                          "Sugestão editorial: revisar preços, autorização de imagem e condições antes de aprovar.",
                      },
                    ],
                  }));
                  setTab("Campanhas");
                }}
              >
                Usar como rascunho
              </button>
            </article>
          ))}
        </div>
      )}
      {tab === "Integração Meta" && (
        <div className="info-panel">
          <span className="eyebrow">NÃO CONECTADA</span>
          <h2>APIs oficiais, quando autorizadas.</h2>
          <p>
            Esta versão organiza materiais e compartilhamentos manuais. Não há
            token, conexão OAuth, publicação ou métricas da Meta simulados.
          </p>
          <p>
            Para conectar contas próprias, será necessário criar um aplicativo
            no Meta for Developers, selecionar o produto compatível com sua
            conta profissional e implementar OAuth no servidor. As permissões,
            análise do aplicativo e acesso a métricas variam conforme o produto
            escolhido e devem ser confirmados na documentação atual.
          </p>
          <p>
            Publicação em grupos não faz parte desta integração. Nenhuma
            campanha é enviada ao aprovar, salvar ou escolher uma data.
          </p>
          <a
            className="text-link"
            href="https://developers.facebook.com/docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentação oficial da Meta ↗
          </a>
        </div>
      )}
    </div>
  );
}
