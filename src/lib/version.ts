export const APP_NAME = "EDGES";
export const APP_TAGLINE = "A chess notebook by K.";
export const APP_VERSION = "v1.0";
export const APP_MILESTONE = APP_TAGLINE;
export const APP_MARK = `${APP_NAME} · ${APP_TAGLINE}`;

/**
 * iOS caches the home-screen icon by URL path. Bump this when the art changes
 * so Add to Home Screen fetches a new file instead of a letterboxed clip.
 */
export const PWA_ICON_REV = "2";

export const PWA_ICONS = {
  appleTouch: `/apple-touch-icon-v${PWA_ICON_REV}.png`,
  icon192: `/icon-192-v${PWA_ICON_REV}.png`,
  icon512: `/icon-512-v${PWA_ICON_REV}.png`,
  maskable192: `/icon-maskable-192-v${PWA_ICON_REV}.png`,
  maskable512: `/icon-maskable-512-v${PWA_ICON_REV}.png`,
  favicon: `/favicon-32-v${PWA_ICON_REV}.png`,
} as const;
