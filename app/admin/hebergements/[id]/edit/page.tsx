import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import HebergementForm from "@/components/admin/HebergementForm";
import type { HebergementType } from "@/types";

interface EditHebergementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHebergementPage({ params }: EditHebergementPageProps) {
  const { id } = await params;

  let hebergement = null;
  let photos: { url: string; estCouverture: boolean }[] = [];
  try {
    hebergement = await prisma.hebergement.findUnique({
      where: { id },
      include: { photos: { orderBy: [{ estCouverture: "desc" }, { ordre: "asc" }] } },
    });
    if (hebergement) {
      photos = hebergement.photos.map((p) => ({ url: p.url, estCouverture: p.estCouverture }));
    }
  } catch {
    // DB not connected
  }

  if (!hebergement) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/hebergements"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Retour aux hébergements
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Modifier — {hebergement.nom}</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <HebergementForm
          hebergementId={id}
          initialPhotos={photos}
          defaultValues={{
            nom:           hebergement.nom,
            nomEn:         hebergement.nomEn,
            type:          hebergement.type as HebergementType,
            description:   hebergement.description,
            descriptionEn: hebergement.descriptionEn,
            capacite:      hebergement.capacite,
            superficie:    hebergement.superficie ?? undefined,
            prixBase:      hebergement.prixBase,
            prixWeekend:   hebergement.prixWeekend ?? undefined,
            estActif:      hebergement.estActif,
            estEnVedette:  hebergement.estEnVedette,
            ordre:         hebergement.ordre,
          }}
        />
      </div>
    </div>
  );
}
