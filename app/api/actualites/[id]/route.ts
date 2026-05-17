import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const actualite = await prisma.actualite.findUnique({
      where: { id },
      include: { auteur: { select: { nom: true } } },
    });
    if (!actualite) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(actualite);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  try {
    const actualite = await prisma.actualite.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.titre !== undefined && { titre: body.titre }),
        ...(body.titreEn !== undefined && { titreEn: body.titreEn }),
        ...(body.resume !== undefined && { resume: body.resume }),
        ...(body.resumeEn !== undefined && { resumeEn: body.resumeEn }),
        ...(body.contenu !== undefined && { contenu: body.contenu }),
        ...(body.contenuEn !== undefined && { contenuEn: body.contenuEn }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.imageAlt !== undefined && { imageAlt: body.imageAlt }),
        ...(body.estPublie !== undefined && { estPublie: body.estPublie }),
        ...(body.estEnVedette !== undefined && { estEnVedette: body.estEnVedette }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.publieLe !== undefined && { publieLe: new Date(body.publieLe) }),
      },
    });
    return NextResponse.json(actualite);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.actualite.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
