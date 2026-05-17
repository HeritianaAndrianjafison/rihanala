import { NextResponse } from "next/server";
import { z } from "zod";
import { utiliserCagnotte } from "@/lib/fidelite";

const schema = z.object({
  clientId:        z.string().min(1),
  montantAUtiliser: z.number().positive(),
  description:     z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let result;
  try {
    result = await utiliserCagnotte(
      parsed.data.clientId,
      parsed.data.montantAUtiliser,
      parsed.data.description
    );
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
