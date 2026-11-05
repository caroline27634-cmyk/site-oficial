import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container admin-placeholder">
      <span className="eyebrow">404 · UM DESVIO NO CAMINHO</span>
      <h1>Essa história ainda não está aqui.</h1>
      <p>Explore as publicações e descubra uma nova perspectiva.</p>
      <Link href="/publicacoes" className="button">
        Ver publicações
      </Link>
    </section>
  );
}
