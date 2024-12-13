import { NextResponse } from "next/server";
import Evento from "@/models/Evento";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const evento = await Evento.findById(id);

    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Error al obtener el evento:", error);
    return NextResponse.json({ error: "Error al obtener el evento" }, { status: 500 });
  }
}