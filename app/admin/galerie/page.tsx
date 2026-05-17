import { prisma } from "@/lib/db";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

async function getPhotos() {
  try {
    return await prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    return [];
  }
}

export default async function AdminGaleriePage() {
  const photos = await getPhotos();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Galerie</h1>
          <p className="text-slate-500 text-sm mt-1">{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-slate-400 text-sm mb-2">Aucune photo dans la galerie.</p>
          <p className="text-slate-400 text-xs">Les photos uploadées via Cloudinary apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm group relative aspect-square">
              <Image
                src={photo.url}
                alt={photo.altFr}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                <p className="text-white text-xs truncate">{photo.altFr}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
