import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  auteurNom:   z.string().min(2).max(80),
  auteurPays:  z.string().min(2).max(80).default("Madagascar"),
  note:        z.number().int().min(1).max(5),
  commentaire: z.string().min(10).max(1000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const avis = await prisma.avis.create({
      data: {
        ...parsed.data,
        estApprouve: false,
      },
    });
    return NextResponse.json({ success: true, id: avis.id }, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[api/avis POST]", detail);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
