import type { MetadataRoute } from "next";
import { publicBaseUrl } from "@/lib/deployment";

const paths = ["/", "/login", "/register", "/games", "/teams", "/players", "/stats/players", "/stats/teams", "/settings"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = publicBaseUrl() || "http://localhost:3000";
  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
