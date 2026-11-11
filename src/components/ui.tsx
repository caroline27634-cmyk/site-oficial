import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Asterisk } from "lucide-react";
import { posts, formatDate, socialLinks } from "@/lib/content";
export function Brand() {
  return (
    <Link href="/" className="brand studio-brand">
      <Asterisk size={32} aria-hidden="true" />
      <span>
        Encanto no Retrato<small>STUDIO IA</small>
      </span>
    </Link>
  );
}
export function SocialLinks() {
  return (
    <div className="social-links">
      {Object.entries(socialLinks)
        .filter(([, url]) => /^https:\/\//.test(url))
        .map(([name, url]) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer">
            {name}
            <ArrowUpRight size={15} />
          </a>
        ))}
    </div>
  );
}
export function PostCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <article className="post-card">
      <Link href={"/publicacoes/" + post.slug} className="card-image">
        <Image
          src={post.image}
          alt={"Ilustração editorial: " + post.title}
          width={1000}
          height={800}
        />
        <span className="image-arrow">
          <ArrowUpRight size={21} />
        </span>
      </Link>
      <div className="post-meta">
        <span>{post.category}</span>
        <span>{post.read} de leitura</span>
      </div>
      <h3>
        <Link href={"/publicacoes/" + post.slug}>{post.title}</Link>
      </h3>
      <p>{post.description}</p>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
    </article>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
