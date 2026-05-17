import { generatePageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/db";
import ReservationForm from "@/components/nextgen/ReservationForm";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface ReservationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ReservationPageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "Book your stay — Rihanala Village Foulpointe",
      description:
        "Request your booking at Rihanala Village. Double rooms, family rooms, suite and dormitories. Free quote, reply within 24h.",
      path: "/reservation",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "Réserver votre séjour — Rihanala Village Foulpointe",
    description:
      "Faites une demande de réservation à Rihanala Village. Chambres, suites et dortoirs disponibles. Devis gratuit, réponse sous 24h.",
    path: "/reservation",
    locale: locale as Locale,
  });
}

async function getHebergements() {
  try {
    return await prisma.hebergement.findMany({
      where: { estActif: true },
      orderBy: { ordre: "asc" },
      select: { id: true, nom: true, nomEn: true, capacite: true, type: true },
    });
  } catch {
    return [];
  }
}

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { locale } = await params;
  const hebergements = await getHebergements();

  return (
    <>
      <div className="min-h-screen bg-surface">
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-4">
              {locale === "en" ? "Booking request" : "Demande de réservation"}
            </p>
            <h1 className="font-accent text-4xl md:text-5xl text-primary mb-4">
              {locale === "en" ? "Plan your stay" : "Planifiez votre séjour"}
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              {locale === "en"
                ? "Fill in the form below and our team will get back to you within 24 hours to confirm your reservation."
                : "Remplissez le formulaire ci-dessous et notre équipe vous répond sous 24h pour confirmer votre réservation."}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <ReservationForm hebergements={hebergements} locale={locale} />
          </div>

          {/* Infos pratiques */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                icon: "🕐",
                label: locale === "en" ? "Reply within 24h" : "Réponse sous 24h",
                sub: locale === "en" ? "We confirm quickly" : "Confirmation rapide",
              },
              {
                icon: "💬",
                label: locale === "en" ? "WhatsApp" : "WhatsApp",
                sub: "+261 34 68 084 66",
              },
              {
                icon: "✓",
                label: locale === "en" ? "No commitment" : "Sans engagement",
                sub: locale === "en" ? "Free quote" : "Devis gratuit",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl p-6 shadow-sm text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FloatingWhatsApp />
    </>
  );
}
