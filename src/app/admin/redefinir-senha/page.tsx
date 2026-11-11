import Link from "next/link";
import { cookies } from "next/headers";
import { adminSession } from "@/lib/supabase";
import {
  recoveryTokenCookie,
  recoveryReadyCookie,
} from "@/lib/recovery-session";
import { VerifyRecovery, NewPassword } from "@/components/password-recovery";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Redefinir senha administrativa",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const jar = await cookies();
  const pending = jar.has(recoveryTokenCookie);
  const session = await adminSession();
  const ready = Boolean(
    session && jar.get(recoveryReadyCookie)?.value === session.user.id,
  );
  return (
    <section className="container admin-placeholder">
      <span className="eyebrow">RECUPERAÇÃO SEGURA</span>
      <h1>Defina uma nova senha.</h1>
      {ready ? (
        <NewPassword />
      ) : pending ? (
        <VerifyRecovery />
      ) : (
        <div className="info-panel">
          <p>
            Link inválido, expirado ou sessão de recuperação ausente. Solicite
            um novo link quando o envio estiver disponível e abra-o no mesmo
            navegador usado para solicitar.
          </p>
          <Link className="text-link" href="/admin/esqueci-senha">
            Solicitar recuperação →
          </Link>
        </div>
      )}
      <Link className="text-link" href="/admin/login">
        Voltar ao login
      </Link>
    </section>
  );
}
