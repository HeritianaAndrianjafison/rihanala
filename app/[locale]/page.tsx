import { getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import { JsonLd, hotelJsonLd } from "@/components/seo/JsonLd";
import HeroSection from "@/components/nextgen/HeroSection";
import StatsSection from "@/components/nextgen/StatsSection";
import HebergementsSection from "@/components/nextgen/HebergementsSection";
import ServicesSection from "@/components/nextgen/ServicesSection";
import GalerieSection from "@/components/nextgen/GalerieSection";
import TemoignagesSection from "@/components/nextgen/TemoignagesSection";
import ContactSection from "@/components/nextgen/ContactSection";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import FacebookFeedSection from "@/components/nextgen/FacebookFeedSection";
import type { Locale } from "@/types";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;

  if (locale === "en") {
    return generatePageMetadata({
      title: "Hotel & Holiday Village in Foulpointe",
      description:
        "Rihanala Village: comfortable bungalows, suite, dormitories and restaurant in Foulpointe. Perfect for families, groups and seminars. East Coast Madagascar.",
      locale: locale as Locale,
    });
  }

  if (locale === "mg") {
    return generatePageMetadata({
      title: "Hôtel & Toeram-pialofana ao Foulpointe",
      description:
        "Rihanala Village: bungalow mahafinaritra, suite, dortoir ary restoranina ao Foulpointe. Tsara ho an'ny fianakaviana, vondrona ary seminera. Moron-tsiraka Atsinanana.",
      locale: locale as Locale,
    });
  }

  return generatePageMetadata({
    title: "Hôtel & Village Vacances à Foulpointe",
    description:
      "Rihanala Village : bungalows tout confort, suite, dortoirs et restaurant à Foulpointe. Idéal familles, groupes et séminaires. Côte Est Madagascar.",
    locale: locale as Locale,
  });
}

async function getPageData() {
  try {
    const [hebergements, avis, photos, parametres] = await Promise.all([
      prisma.hebergement.findMany({
        where: { estActif: true },
        orderBy: [{ estEnVedette: "desc" }, { ordre: "asc" }],
        include: {
          photos: { orderBy: [{ estCouverture: "desc" }, { ordre: "asc" }] },
          equipements: true,
        },
      }),
      prisma.avis.findMany({
        where: { estApprouve: true },
        orderBy: [{ note: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.photo.findMany({
        where: {
          categorie: { in: ["HEBERGEMENT", "RESTAURANT", "EXTERIEURS", "ACTIVITES"] },
          hebergementId: null,
          actualiteId: null,
        },
        orderBy: { ordre: "asc" },
        take: 5,
      }),
      prisma.parametre.findMany({
        where: { cle: { in: ["image_hero", "image_services"] } },
      }),
    ]);

    const params = Object.fromEntries(parametres.map((p) => [p.cle, p.valeur]));
    return { hebergements, avis, photos, params };
  } catch {
    return { hebergements: [], avis: [], photos: [], params: {} };
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const { hebergements, avis, photos, params: siteParams } = await getPageData();
  const t = await getTranslations({ locale, namespace: "stats" });

  const stats = [
    { value: 15000, label: t("domaine"),      suffix: "" },
    { value: 60,    label: t("restaurant"),   suffix: "+" },
    { value: 5,     label: t("hebergements"), suffix: "" },
    { value: 2021,  label: t("depuis"),       suffix: "" },
  ];

  return (
    <>
      <JsonLd data={hotelJsonLd} />
      <HeroSection imageUrl={siteParams.image_hero} />
      <StatsSection stats={stats} />
      <HebergementsSection hebergements={hebergements} />
      <ServicesSection imageUrl={siteParams.image_services} />
      <GalerieSection photos={photos} />
      <TemoignagesSection avis={avis} />
      <FacebookFeedSection />
      <ContactSection />
      <FloatingWhatsApp />
    </>
  );
}
