import { Metadata } from "next";
import type { Locale, ISeoMeta } from "@/types";

const SITE_CONFIG = {
  name: "Rihanala Village",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rihanala-village.mg",
  ogImage: "/og/accueil.jpg",
  twitterHandle: "@RihanalaVillage",
} as const;

export function generatePageMetadata({
  title,
  description,
  path = "",
  locale = "fr",
  image,
}: ISeoMeta): Metadata {
  const url = `${SITE_CONFIG.url}/${locale}${path}`;
  const ogImage = image ?? SITE_CONFIG.ogImage;
  const localeMap: Record<Locale, string> = {
    fr: "fr_FR",
    en: "en_US",
    mg: "mg_MG",
  };

  return {
    title: `${title} | Rihanala Village Foulpointe`,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_CONFIG.url}/fr${path}`,
        en: `${SITE_CONFIG.url}/en${path}`,
        mg: `${SITE_CONFIG.url}/mg${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: localeMap[locale as Locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

export { SITE_CONFIG };
