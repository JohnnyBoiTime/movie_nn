import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://movie-nn.vercel.app";
    return [ {
        url: `${base}/`, lastModified: new Date().toISOString(), changeFrequency: "weekly", priority: 1
    }]
}