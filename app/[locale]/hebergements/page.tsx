import { generatePageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import HebergementsSection from "@/components/nextgen/HebergementsSection";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface HebergementsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HebergementsPageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "Accommodations — Rooms & Dormitories",
      description:
        "Discover all accommodations at Rihanala Village: double rooms, family rooms, suite and dormitories for groups. Foulpointe, Madagascar.",
      path: "/hebergements",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "Hébergements — Chambres & Dortoirs",
    description:
      "Découvrez tous les hébergements de Rihanala Village : chambre double, familiale, suite et dortoirs pour groupes. Foulpointe, Madagascar.",
    path: "/hebergements",
    locale: locale as Locale,
  });
}

async function getHebergements() {
  try {
    return await prisma.hebergement.findMany({
      where: { estActif: true },
      orderBy: [{ estEnVedette: "desc" }, { ordre: "asc" }],
      include: {
        photos: { orderBy: [{ estCouverture: "desc" }, { ordre: "asc" }] },
        equipements: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function HebergementsPage({ params }: HebergementsPageProps) {
  await params;
  const hebergements = await getHebergements();

  return (
    <>
      <HebergementsSection hebergements={hebergements} />
      <FloatingWhatsApp />
    </>
  );
}
