import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { statut } = await req.json().catch(() => ({}));

  try {
    await prisma.demandeContact.update({ where: { id }, data: { statut } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.demandeContact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }
}
