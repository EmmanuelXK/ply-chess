import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Opening Edge",
    short_name: "Opening Edge",
    description:
      "Personal repertoire. Learn one move at a time, then analyze it yourself.",
    id: "/",
    scope: "/",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#070708",
    theme_color: "#070708",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
