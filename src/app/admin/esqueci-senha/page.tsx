import { ForgotPassword } from "@/components/password-recovery";
export const metadata = {
  title: "Recuperar acesso administrativo",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <section className="container admin-placeholder">
      <span className="eyebrow">ACESSO ADMINISTRATIVO</span>
      <h1>Recuperar sua senha.</h1>
      <ForgotPassword />
    </section>
  );
}
