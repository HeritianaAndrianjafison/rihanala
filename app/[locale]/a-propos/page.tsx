import { generatePageMetadata } from "@/lib/seo";
import AProposSection from "@/components/nextgen/AProposSection";
import ContactSection from "@/components/nextgen/ContactSection";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface AProposPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AProposPageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "About — Our Story & Values",
      description:
        "Discover the story of Rihanala Village: a holiday village opened in 2021 on 15,000 m² in Mahavelona, Foulpointe. Our mission, values and team.",
      path: "/a-propos",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "À propos — Notre histoire & nos valeurs",
    description:
      "Découvrez l'histoire de Rihanala Village : un village vacances ouvert en 2021 sur 15 000 m² à Mahavelona, Foulpointe. Notre mission, nos valeurs et notre équipe.",
    path: "/a-propos",
    locale: locale as Locale,
  });
}

export default async function AProposPage({ params }: AProposPageProps) {
  await params;

  return (
    <>
      <AProposSection />
      <ContactSection />
      <FloatingWhatsApp />
    </>
  );
}
