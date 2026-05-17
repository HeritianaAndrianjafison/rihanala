import { generatePageMetadata } from "@/lib/seo";
import ServicesSection from "@/components/nextgen/ServicesSection";
import ContactSection from "@/components/nextgen/ContactSection";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ServicesPageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "Services — Restaurant, Seminar Room & Activities",
      description:
        "Restaurant for 60 guests, seminar room, prayer room and lush outdoor spaces. All services offered by Rihanala Village in Foulpointe.",
      path: "/services",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "Services — Restaurant, Séminaire & Activités",
    description:
      "Restaurant 60 couverts, salle de séminaire, salle de prière et espaces verts. Tous les services proposés par Rihanala Village à Foulpointe.",
    path: "/services",
    locale: locale as Locale,
  });
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  await params;

  return (
    <>
      <ServicesSection />
      <ContactSection />
      <FloatingWhatsApp />
    </>
  );
}
