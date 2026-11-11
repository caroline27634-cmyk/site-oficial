"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  requestRecovery,
  verifyRecoveryLink,
  updateRecoveredPassword,
} from "@/app/admin/recovery-actions";
export function ForgotPassword() {
  const [state, action, pending] = useActionState(requestRecovery, {});
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!state.cooldown) return;
    const until = Date.now() + state.cooldown * 1000;
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [state]);
  return (
    <form action={action} className="contact-form">
      <label>
        E-mail administrativo
        <input
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <button className="button" disabled={pending || remaining > 0}>
        {pending
          ? "Solicitando…"
          : remaining > 0
            ? `Aguarde ${remaining}s`
            : "Enviar link de recuperação"}
      </button>
      <p role="status">{state.error || state.success}</p>
      <p className="demo-note">
        Use sua conta já cadastrada. Nenhuma conta será criada. Se o limite de
        e-mails foi atingido, aguarde a liberação do Supabase antes de tentar
        novamente.
      </p>
      <Link className="text-link" href="/admin/login">
        Voltar ao login
      </Link>
    </form>
  );
}
export function VerifyRecovery() {
  const [state, action, pending] = useActionState(verifyRecoveryLink, {});
  return (
    <form action={action} className="contact-form">
      <p>
        Continue para validar o link de uso único e preparar sua sessão de
        recuperação. A validação só ocorre quando você aciona este botão.
      </p>
      <button className="button" disabled={pending}>
        {pending ? "Validando…" : "Continuar redefinição"}
      </button>
      <p role="status">{state.error}</p>
    </form>
  );
}
export function NewPassword() {
  const [state, action, pending] = useActionState(updateRecoveredPassword, {});
  return (
    <form action={action} className="contact-form">
      <label>
        Nova senha
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <label>
        Confirme a nova senha
        <input
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <p className="demo-note">
        Use pelo menos 12 caracteres e cumpra os requisitos adicionais definidos
        no seu Supabase. Sua autorização administrativa não é alterada.
      </p>
      <button className="button" disabled={pending}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </button>
      <p role="status">{state.error}</p>
    </form>
  );
}
