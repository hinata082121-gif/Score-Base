import type { MetadataRoute } from "next";
import { publicBaseUrl } from "@/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  const sitemap = publicBaseUrl() ? `${publicBaseUrl()}/sitemap.xml` : undefined;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/games", "/teams", "/players", "/stats/players", "/stats/teams", "/settings"],
        disallow: ["/account", "/invite", "/settings/deployment", "/settings/release-checklist"],
      },
    ],
    sitemap,
  };
}

