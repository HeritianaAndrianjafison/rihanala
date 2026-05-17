import { generatePageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import GalerieSection from "@/components/nextgen/GalerieSection";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface GaleriePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GaleriePageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "Photo Gallery — Rihanala Village",
      description:
        "Discover Rihanala Village in pictures: rooms, grounds, restaurant and outdoor spaces in Foulpointe, East Coast Madagascar.",
      path: "/galerie",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "Galerie Photos — Rihanala Village",
    description:
      "Découvrez Rihanala Village en images : chambres, espaces extérieurs, restaurant et domaine à Foulpointe, côte Est Madagascar.",
    path: "/galerie",
    locale: locale as Locale,
  });
}

async function getPhotos() {
  try {
    return await prisma.photo.findMany({
      orderBy: { ordre: "asc" },
      take: 20,
    });
  } catch {
    return [];
  }
}

export default async function GaleriePage({ params }: GaleriePageProps) {
  await params;
  const photos = await getPhotos();

  return (
    <>
      <GalerieSection photos={photos} />
      <FloatingWhatsApp />
    </>
  );
}
