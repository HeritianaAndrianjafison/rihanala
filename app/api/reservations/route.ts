import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const reservationSchema = z.object({
  prenom:         z.string().min(2),
  nom:            z.string().min(2),
  email:          z.string().email(),
  telephone:      z.string().min(6),
  hebergementId:  z.string().min(1),
  dateArrivee:    z.string().min(1),
  dateDepart:     z.string().min(1),
  nbAdultes:      z.number().int().min(1),
  nbEnfants:      z.number().int().min(0),
  messageSpecial: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    hebergementId,
    dateArrivee,
    dateDepart,
    nbAdultes,
    nbEnfants,
    messageSpecial,
    ...contact
  } = parsed.data;

  try {
    const reservation = await prisma.reservation.create({
      data: {
        ...contact,
        hebergementId,
        dateArrivee: new Date(dateArrivee),
        dateDepart: new Date(dateDepart),
        nbAdultes,
        nbEnfants,
        messageSpecial: messageSpecial ?? null,
        statut: "EN_ATTENTE",
      },
    });
    return NextResponse.json({ success: true, reference: reservation.reference }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
