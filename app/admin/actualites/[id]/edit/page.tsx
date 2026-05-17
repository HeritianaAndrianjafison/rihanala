import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ActualiteForm from "@/components/admin/ActualiteForm";

interface EditActualitePageProps {
  params: Promise<{ id: string }>;
}

async function getActualite(id: string) {
  try {
    return await prisma.actualite.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export default async function AdminActualiteEditPage({ params }: EditActualitePageProps) {
  const { id } = await params;
  const actualite = await getActualite(id);
  if (!actualite) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Modifier l'article</h1>
        <p className="text-slate-500 text-sm mt-1 truncate max-w-md">{actualite.titre}</p>
      </div>
      <ActualiteForm initialData={actualite} />
    </div>
  );
}
