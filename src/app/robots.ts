import type { MetadataRoute } from "next";
import { buildShareUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/games", "/teams", "/players", "/stats/players", "/stats/teams", "/settings"],
        disallow: ["/account", "/invite", "/settings/deployment", "/settings/release-checklist"],
      },
    ],
    sitemap: buildShareUrl("/sitemap.xml"),
  };
}
