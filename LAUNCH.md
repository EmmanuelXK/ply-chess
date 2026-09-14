# V1 — Launch with personal Profiles v1.0

Club-ready cut. Signed-in friends get everything. No subscriptions.

## Auth (only these two)

1. **Google** — Supabase Auth → Providers → Google. Paste the Google client id + secret in the Supabase dashboard (never in this repo).
2. **Phone OTP** — Supabase Auth → Phone. Twilio (or the Supabase phone provider) stays in the dashboard. The app never sees those keys. The login field defaults to France `+33` and turns `07 44 89 98 85` into E.164 before SMS. If Google or Phone is still off in the dashboard, the app stays on `/login` with a short message (it does not dump raw Supabase JSON).

Redirect URLs in Supabase Auth:

- `https://blitzbar.app/auth/callback`
- `http://127.0.0.1:43173/auth/callback`

Site URL: `https://blitzbar.app`

Do **not** enable email/password or email magic links for V1.

## Dedicated project

Create an **Opening Edge** Supabase project (do not reuse YUDO or MeeToo). Free-tier orgs are limited to two projects — pause or upgrade one unused project first.

Apply `supabase/migrations/20260913180000_v1_profiles_progress.sql` on that project.

## Vercel env vars (production + preview)

Public only — these are safe in the browser:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works. **Never** add `SERVICE_ROLE`, Twilio, or Google client secrets as `NEXT_PUBLIC_*`.

Optional server-only TTS keys stay as they are (no `NEXT_PUBLIC_`). See `.env.example`.

Redeploy after saving env vars.

## iOS Add to Home Screen

After this deploy, delete the old Home Screen icon and add it again so iOS picks up the EDGE wordmark (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`).

## Local

```bash
cp .env.example .env.local
# fill public Supabase URL + publishable key
npm run dev
```

Without keys, local/preview can still open Home / Learn for craft work. Production (`VERCEL_ENV=production`) requires login.

## Security checklist

- [x] No service-role / JWT / Twilio / Google secrets in the repo or PR
- [x] `.gitignore` covers `.env*` (`.env.example` placeholders only)
- [x] Client uses public URL + publishable/anon key
- [x] RLS on `profiles`, `opening_progress`, `opening_reps` via `auth.uid()`
- [x] Login UI is Google + Phone only
- [x] Git history on this branch: no committed `.env` or private keys found

If a secret was ever pasted into Vercel or a chat, rotate it in the provider dashboard.
