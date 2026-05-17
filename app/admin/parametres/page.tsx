import { prisma } from "@/lib/db";
import ParametresForm from "@/components/admin/ParametresForm";

async function getParametres() {
  try {
    return await prisma.parametre.findMany({ orderBy: { cle: "asc" } });
  } catch {
    return [];
  }
}

export default async function AdminParametresPage() {
  const parametres = await getParametres();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">Configuration globale du site</p>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <ParametresForm parametres={parametres} />
      </div>
    </div>
  );
}
