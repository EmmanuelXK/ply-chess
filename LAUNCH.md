# Opening Edge

Personal phone trainer. Home, Learn, and Analyze open with no account. The display name, side, and club tag save in this browser. Learn progress saves in this browser too.

## Vercel

Optional server keys only. The app builds and runs when they are unset.

```
LICHESS_TOKEN=
AI_GATEWAY_API_KEY=
```

`ANTHROPIC_API_KEY` is an alternate coach key. Do not add secrets as `NEXT_PUBLIC_*`.

Voice playback is off. Do not add TTS keys.

Redeploy after saving env vars.

## iOS Add to Home Screen

After a deploy that changes the icon, delete the old Home Screen icon and Add to Home Screen again. iOS will not replace a saved icon on the next open. The touch icon is the full-bleed fedora (`apple-touch-icon-v2.png`).

## Local

```bash
npm install
npm run dev
```

App: http://127.0.0.1:43173
