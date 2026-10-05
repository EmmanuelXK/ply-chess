import { APP_MARK } from "@/lib/version";
import { LoginHomeRedirect } from "@/components/auth/login-home-redirect";

/** Paints the login card before globals.css / JS. Hardcoded Lupin noir colors. */
const CRITICAL_LOGIN_CSS = `
.auth-shell{min-height:100dvh;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:1.25rem 1rem calc(env(safe-area-inset-bottom,0px) + 1.25rem);background:#070708;color:#f3ebe0}
.auth-card{width:min(100%,22rem);display:flex;flex-direction:column;gap:.4rem;padding:1.35rem 1.15rem 1.15rem;border-radius:1.15rem;background:#161412;border:1px solid #2c261e;box-shadow:0 16px 36px rgb(0 0 0 / 36%)}
.auth-mark{width:4.25rem;height:4.25rem;border-radius:.95rem;margin-bottom:.35rem}
.auth-card .dash-kicker{letter-spacing:.16em;text-transform:uppercase;color:#f59e0b;font-size:10px;font-weight:600;margin:0}
.auth-card h1{margin:.2rem 0 0;font-size:1.6rem;letter-spacing:-.034em;color:#f3ebe0}
.auth-lead,.auth-note,.auth-foot{margin:.2rem 0 .45rem;font-size:13px;line-height:1.45;color:#a39484}
.auth-note-warn{color:#fb923c}
.auth-foot{margin-top:1rem;font-size:11px;letter-spacing:.02em}
.auth-google{margin-top:.85rem;display:inline-flex;align-items:center;justify-content:center;gap:.65rem;width:100%;height:2.75rem;border-radius:.8rem;font-size:14px;font-weight:650;letter-spacing:.01em;color:#070708;background:linear-gradient(180deg,#fb923c,#f59e0b);text-decoration:none;box-sizing:border-box;border:0}
.auth-google[aria-disabled="true"]{opacity:.72;pointer-events:none}
.auth-google-mark{width:1.15rem;height:1.15rem;flex:none}
`;

function GoogleMark() {
  return (
    <svg className="auth-google-mark" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginScreen({
  next,
  note,
  configured,
}: {
  next: string;
  note: string;
  configured: boolean;
}) {
  const href = `/auth/google?next=${encodeURIComponent(next)}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CRITICAL_LOGIN_CSS }} />
      <LoginHomeRedirect next={next} />
      <div className="auth-shell" style={{ background: "#070708", color: "#f3ebe0" }}>
        <div className="auth-card">
          <img
            src="/icon-192.png"
            alt=""
            width={72}
            height={72}
            className="auth-mark"
          />
          <p className="dash-kicker">Club login</p>
          <h1>Opening Edge</h1>
          <p className="auth-lead">
            Sign in with Google to train. Every signed-in friend gets the full board.
          </p>

          {!configured ? (
            <p className="auth-note">
              Google sign-in is ready in the app. Add the public Supabase URL and
              publishable key on Vercel to turn the wall on. See LAUNCH.md.
            </p>
          ) : null}

          {configured ? (
            <a href={href} className="auth-google">
              <GoogleMark />
              Continue with Google
            </a>
          ) : (
            <span className="auth-google" aria-disabled="true">
              <GoogleMark />
              Continue with Google
            </span>
          )}

          {note ? <p className="auth-note auth-note-warn">{note}</p> : null}
          <p className="auth-foot">{APP_MARK}</p>
        </div>
      </div>
    </>
  );
}
