import { generatePageMetadata } from "@/lib/seo";
import ContactSection from "@/components/nextgen/ContactSection";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "Contact — Book your stay at Rihanala Village",
      description:
        "Contact Rihanala Village to book your stay or ask a question. Phone: +261 34 68 084 66 · Located in Mahavelona (Foulpointe), Madagascar.",
      path: "/contact",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "Contact — Réservez votre séjour à Rihanala Village",
    description:
      "Contactez Rihanala Village pour réserver votre séjour ou poser une question. Tél : +261 34 68 084 66 · À Mahavelona (Foulpointe), Madagascar.",
    path: "/contact",
    locale: locale as Locale,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  await params;

  return (
    <>
      <ContactSection />
      <FloatingWhatsApp />
    </>
  );
}
