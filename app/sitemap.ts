import type { MetadataRoute } from "next";

const siteUrl = "https://trueculture.nl";

const routes = ["", "/diensten", "/werkwijze", "/over-ons", "/contact", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
