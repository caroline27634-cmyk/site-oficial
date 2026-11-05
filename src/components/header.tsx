"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Brand } from "./ui";
const links = [
  ["/", "Início"],
  ["/quem-somos", "Quem somos"],
  ["/nossos-servicos", "Nossos serviços"],
  ["/precos-e-pacotes", "Preços e pacotes"],
  ["/galeria", "Galeria de fotos"],
  ["/como-funciona", "Como funciona"],
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="container header-inner">
        <Brand />
        <button
          className="menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-nav"
          className={open ? "nav open" : "nav"}
          aria-label="Principal"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? path === "/" : path.startsWith(href))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="contact-link"
            aria-current={path === "/contato" ? "page" : undefined}
            href="/contato"
            onClick={() => setOpen(false)}
          >
            Contato <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
