import type { MetadataRoute } from "next";
import { buildShareUrl } from "@/lib/url";

const paths = ["/", "/login", "/register", "/games", "/teams", "/players", "/stats/players", "/stats/teams", "/settings"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: buildShareUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
