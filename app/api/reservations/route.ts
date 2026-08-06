import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  prenom:          z.string().min(2),
  nom:             z.string().min(2),
  email:           z.string().email(),
  telephone:       z.string().optional(),
  typeHebergement: z.string().optional(),
  nbPersonnes:     z.number().int().min(1).optional(),
  message:         z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await prisma.demandeContact.create({ data: parsed.data });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[api/reservations POST]", detail);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
