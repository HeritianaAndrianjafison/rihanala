import { NextResponse } from "next/server";
import { z } from "zod";
import { enregistrerTransaction } from "@/lib/fidelite";

const schema = z.object({
  clientId:      z.string().min(1),
  montantDepense: z.number().positive(),
  categorie:     z.enum(["HEBERGEMENT", "RESTAURANT", "ACTIVITE", "AUTRE"]).optional(),
  note:          z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await enregistrerTransaction(
      parsed.data.clientId,
      parsed.data.montantDepense,
      parsed.data.categorie,
      parsed.data.note
    );
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
