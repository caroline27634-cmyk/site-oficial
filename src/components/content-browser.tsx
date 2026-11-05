"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X, Expand } from "lucide-react";
import { categories, posts } from "@/lib/content";
import type { Photo } from "@/lib/studio";
import { PostCard } from "./ui";
export function Publications() {
  const [category, setCategory] = useState("Todos");
  return (
    <>
      <div className="filters" aria-label="Filtrar publicações">
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="post-grid listing">
        {posts
          .filter((p) => category === "Todos" || p.category === category)
          .map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
      </div>
    </>
  );
}
export function Gallery({
  photos,
  themes = [],
}: {
  photos: Photo[];
  themes?: string[];
}) {
  const [album, setAlbum] = useState("Todos");
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const filtered = photos.filter((p) => album === "Todos" || p.album === album);
  const photo = active === null ? null : filtered[active];
  useEffect(() => {
    if (photo && !dialog.current?.open) dialog.current?.showModal();
    if (!photo && dialog.current?.open) dialog.current?.close();
  }, [photo]);
  function move(delta: number) {
    setActive((i) =>
      i === null ? null : (i + delta + filtered.length) % filtered.length,
    );
  }
  return (
    <>
      <div className="filters" aria-label="Filtrar álbuns">
        {["Todos", ...new Set([...themes, ...photos.map((p) => p.album)])].map(
          (c) => (
            <button
              key={c}
              aria-pressed={album === c}
              onClick={() => setAlbum(c)}
            >
              {c}
            </button>
          ),
        )}
      </div>
      <div className="gallery-grid">
        {filtered.map((p, i) => (
          <button
            className="photo-card"
            key={p.id}
            onClick={() => setActive(i)}
            aria-label={"Ampliar " + p.title}
          >
            <div>
              <Image
                unoptimized
                src={p.image}
                alt={p.title}
                width={1000}
                height={800}
              />
              <span className="image-arrow">
                <Expand size={19} />
              </span>
            </div>
            <span className="photo-caption">
              <strong>{p.title}</strong>
              <span>{p.album}</span>
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="empty-state">
          Este tema ainda não possui imagens no portfólio. Volte em breve para
          descobrir novas criações.
        </p>
      )}
      <p className="demo-note">
        Ilustrações demonstrativas e acervo preservado. Fotografias de clientes
        somente com autorização específica para o portfólio.
      </p>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Imagem ampliada"
        onCancel={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setActive(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        {photo && (
          <div className="lightbox-content">
            <button
              className="close-lightbox"
              aria-label="Fechar imagem"
              onClick={() => setActive(null)}
              autoFocus
            >
              <X />
            </button>
            <Image
              unoptimized
              src={photo.image}
              alt={photo.title}
              width={1000}
              height={800}
            />
            <div className="lightbox-toolbar">
              <button aria-label="Imagem anterior" onClick={() => move(-1)}>
                <ArrowLeft />
              </button>
              <div>
                <strong>{photo.title}</strong>
                <span>
                  {photo.album} · {(active ?? 0) + 1} de {filtered.length}
                </span>
              </div>
              <button aria-label="Próxima imagem" onClick={() => move(1)}>
                <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
