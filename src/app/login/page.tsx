import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";

export const metadata = {
  title: "Login · Opening Edge",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-shell">
          <div className="auth-card">
            <p className="dash-kicker">Club login</p>
            <h1>Opening Edge</h1>
            <p className="auth-lead">Loading Google sign-in…</p>
          </div>
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  );
}
