import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rihanala-village.mg";
const LOCALES = ["fr", "en", "mg"] as const;

const STATIC_PAGES = [
  { path: "",              changeFrequency: "daily"   as const, priority: 1.0 },
  { path: "/hebergements", changeFrequency: "weekly"  as const, priority: 0.9 },
  { path: "/services",     changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/galerie",      changeFrequency: "weekly"  as const, priority: 0.7 },
  { path: "/actualites",   changeFrequency: "weekly"  as const, priority: 0.8 },
  { path: "/contact",      changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/a-propos",     changeFrequency: "monthly" as const, priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls = STATIC_PAGES.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  );

  let hebergementUrls: MetadataRoute.Sitemap = [];
  let actualiteUrls: MetadataRoute.Sitemap = [];

  try {
    const [hebergements, actualites] = await Promise.all([
      prisma.hebergement.findMany({
        where: { estActif: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.actualite.findMany({
        where: { estPublie: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    hebergementUrls = hebergements.flatMap((h) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}/hebergements/${h.slug}`,
        lastModified: h.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      }))
    );

    actualiteUrls = actualites.flatMap((a) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}/actualites/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  } catch {
    // DB not yet connected — return static pages only
  }

  return [...staticUrls, ...hebergementUrls, ...actualiteUrls];
}
