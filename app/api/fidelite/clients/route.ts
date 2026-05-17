import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  try {
    const clients = await prisma.clientFidelite.findMany({
      where: q
        ? {
            OR: [
              { nom:       { contains: q, mode: "insensitive" } },
              { prenom:    { contains: q, mode: "insensitive" } },
              { telephone: { contains: q } },
              { email:     { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { cartes: { where: { estActif: true }, take: 1 } },
    });
    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
}

const createSchema = z.object({
  nom:           z.string().min(2),
  prenom:        z.string().min(2),
  telephone:     z.string().min(6),
  email:         z.string().email().optional().or(z.literal("")),
  dateNaissance: z.string().optional(),
  carteId:       z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { carteId, email, dateNaissance, ...rest } = parsed.data;

  try {
    const client = await prisma.$transaction(async (tx) => {
      const newClient = await tx.clientFidelite.create({
        data: {
          ...rest,
          email:         email || null,
          dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        },
      });

      if (carteId) {
        await tx.carteQR.update({
          where: { id: carteId },
          data:  { clientId: newClient.id },
        });
      } else {
        await tx.carteQR.create({ data: { clientId: newClient.id } });
      }

      return newClient;
    });

    return NextResponse.json(client, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint") && msg.includes("telephone")) {
      return NextResponse.json({ error: "Ce numéro de téléphone est déjà enregistré" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
