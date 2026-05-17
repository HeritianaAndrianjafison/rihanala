import { prisma } from "@/lib/db";
import MediasForm from "@/components/admin/MediasForm";

async function getData() {
  try {
    const [parametres, photos] = await Promise.all([
      prisma.parametre.findMany({
        where: { cle: { in: ["image_hero", "image_services"] } },
      }),
      prisma.photo.findMany({
        where: {
          hebergementId: null,
          actualiteId:   null,
          categorie: { in: ["HEBERGEMENT", "RESTAURANT", "EXTERIEURS", "ACTIVITES", "SALLE_REUNION"] },
        },
        orderBy: { ordre: "asc" },
      }),
    ]);

    const params = Object.fromEntries(parametres.map((p) => [p.cle, p.valeur]));
    return { params, photos };
  } catch {
    return { params: {}, photos: [] };
  }
}

export default async function AdminMediasPage() {
  const { params, photos } = await getData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Médias — Page d'accueil</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gérez les images affichées sur la landing page du site
        </p>
      </div>

      <MediasForm
        heroImageUrl={params.image_hero ?? ""}
        servicesImageUrl={params.image_services ?? ""}
        galeriePhotos={photos}
      />
    </div>
  );
}
