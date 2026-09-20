import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";

export const metadata = {
  title: "Login · Opening Edge",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-shell" />}>
      <LoginScreen />
    </Suspense>
  );
}
