import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { posts, formatDate } from "@/lib/content";
import { PostCard } from "@/components/ui";
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return {
    title: post?.title ?? "Publicação não encontrada",
    description: post?.description,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article className="container article">
      <Link href="/publicacoes" className="text-link">
        ← Todas as publicações
      </Link>
      <header className="article-header">
        <span className="eyebrow">
          {post.category} · CONTEÚDO DEMONSTRATIVO
        </span>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="article-meta">
          <span>Acervo editorial preservado</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.read} de leitura</span>
        </div>
      </header>
      <Image
        className="article-cover"
        src={post.image}
        alt={"Ilustração: " + post.title}
        width={1000}
        height={800}
        priority
      />
      <div className="article-body">
        {post.body.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <aside>
          Um convite do nosso acervo: leve uma nova perspectiva para o seu dia.
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>Continue explorando</h2>
        </div>
        <div className="post-grid">
          {posts
            .filter((p) => p.slug !== slug)
            .slice(0, 3)
            .map((p) => (
              <PostCard post={p} key={p.slug} />
            ))}
        </div>
      </section>
    </article>
  );
}
