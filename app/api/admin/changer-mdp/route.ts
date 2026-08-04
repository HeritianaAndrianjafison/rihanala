import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  ancienMdp:  z.string().min(1),
  nouveauMdp: z.string().min(8, "Le nouveau mot de passe doit faire au moins 8 caractères"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const user = await prisma.utilisateur.findUnique({
    where: { email: session.user.email },
  });
  if (!user?.motDePasse) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(parsed.data.ancienMdp, user.motDePasse);
  if (!isValid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
  }

  const hash = await bcrypt.hash(parsed.data.nouveauMdp, 12);
  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { motDePasse: hash },
  });

  return NextResponse.json({ ok: true });
}
