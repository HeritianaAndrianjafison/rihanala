import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import HotelAHFForm from "@/components/admin/HotelAHFForm";
import AdminDeleteHotelAHF from "@/components/admin/AdminDeleteHotelAHF";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getHotel(id: string) {
  try {
    return await prisma.hotelAHF.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export default async function AdminAHFEditPage({ params }: PageProps) {
  const { id } = await params;
  const hotel = await getHotel(id);
  if (!hotel) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ahf"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Modifier — {hotel.nom}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Mise à jour des informations de cet hôtel</p>
          </div>
        </div>
        <AdminDeleteHotelAHF id={hotel.id} nom={hotel.nom} />
      </div>

      <HotelAHFForm
        initial={{
          id:              hotel.id,
          nom:             hotel.nom,
          slug:            hotel.slug,
          description:     hotel.description,
          adresse:         hotel.adresse,
          telephone:       hotel.telephone,
          email:           hotel.email,
          siteWeb:         hotel.siteWeb,
          facebook:        hotel.facebook,
          instagram:       hotel.instagram,
          latitude:        hotel.latitude,
          longitude:       hotel.longitude,
          photoCouverture: hotel.photoCouverture,
          photos:          hotel.photos,
          estActif:        hotel.estActif,
          ordre:           hotel.ordre,
        }}
      />
    </div>
  );
}
