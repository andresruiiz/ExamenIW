import { NextRequest, NextResponse } from "next/server";
import Evento from "@/models/Evento";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const evento = await Evento.findById(params.id);

    if (!evento) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error("Error al obtener el evento:", error);
    return NextResponse.json(
      { error: "Error al obtener el evento" },
      { status: 500 }
    );
  }
}