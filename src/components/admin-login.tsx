"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";
export function AdminLogin() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="contact-form">
      <label>
        E-mail administrativo
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? "Verificando…" : "Entrar no painel"}
      </button>
      <p role="status">{state.error}</p>
      <Link className="text-link" href="/admin/esqueci-senha">
        Esqueci minha senha
      </Link>
      <p className="demo-note">
        Acesso apenas para contas previamente autorizadas. Não há cadastro
        público. Use a opção de recuperação se precisar cadastrar uma nova
        senha.
      </p>
    </form>
  );
}
