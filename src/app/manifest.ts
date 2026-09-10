import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Opening Edge",
    short_name: "Opening Edge",
    description:
      "iPhone-first chess opening trainer. 21 attacking systems, professor Why, hybrid practice.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c0c0e",
    theme_color: "#0c0c0e",
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
    ],
  };
}
