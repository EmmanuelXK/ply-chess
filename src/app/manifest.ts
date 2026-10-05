import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE, PWA_ICONS } from "@/lib/version";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_TAGLINE,
    id: "/",
    scope: "/",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#040406",
    theme_color: "#040406",
    icons: [
      {
        src: PWA_ICONS.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICONS.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICONS.maskable192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PWA_ICONS.maskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
