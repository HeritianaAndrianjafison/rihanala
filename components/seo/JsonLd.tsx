import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  data: WithContext<Thing>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRoomJsonLd(room: {
  nom: string;
  description: string;
  prixBase: number;
  capacite: number;
  slug: string;
  imageUrl?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): WithContext<any> {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.nom,
    description: room.description,
    url: `https://www.rihanala-village.mg/fr/hebergements/${room.slug}`,
    image: room.imageUrl,
    occupancy: { "@type": "QuantitativeValue", maxValue: room.capacite },
    offers: {
      "@type": "Offer",
      price: room.prixBase,
      priceCurrency: "MGA",
      availability: "https://schema.org/InStock",
    },
    containedInPlace: { "@id": "https://www.rihanala-village.mg/#hotel" },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getArticleJsonLd(article: {
  titre: string;
  resume: string;
  slug: string;
  publieLe: Date;
  updatedAt: Date;
  imageUrl?: string | null;
  auteurNom: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): WithContext<any> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.titre,
    description: article.resume,
    image: article.imageUrl ?? undefined,
    url: `https://www.rihanala-village.mg/fr/actualites/${article.slug}`,
    datePublished: article.publieLe.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.auteurNom },
    publisher: {
      "@type": "Organization",
      name: "Rihanala Village",
      url: "https://www.rihanala-village.mg",
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hotelJsonLd: WithContext<any> = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://www.rihanala-village.mg/#hotel",
  name: "Rihanala Village",
  description:
    "Village vacances et hébergement de groupe à Foulpointe, côte Est Madagascar. Bungalows, suites, dortoirs, restaurant et salle de séminaire.",
  url: "https://www.rihanala-village.mg",
  telephone: "+261346808466",
  image: "https://www.rihanala-village.mg/og/accueil.jpg",
  priceRange: "$$",
  currenciesAccepted: "MGA, EUR",
  paymentAccepted: "Cash, Mobile Money",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
    { "@type": "LocationFeatureSpecification", name: "Salle de réunion", value: true },
    { "@type": "LocationFeatureSpecification", name: "WiFi gratuit", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parking gratuit", value: true },
    { "@type": "LocationFeatureSpecification", name: "Aires de jeux", value: true },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "La Haute Ville, Parcelle 4",
    addressLocality: "Mahavelona (Foulpointe)",
    addressRegion: "Atsinanana",
    addressCountry: "MG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -17.6881238,
    longitude: 49.5140787,
  },
  hasMap: "https://www.google.com/maps/place/Rihanala+Village/@-17.6881238,49.5140787,17z",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: ["https://www.facebook.com/profile.php?id=61551955325688"],
  numberOfRooms: "5 types — Double, Familiale, Suite, Dortoir 10p, Dortoir 20p",
};
