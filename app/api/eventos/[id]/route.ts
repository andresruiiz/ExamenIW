import { NextRequest, NextResponse } from "next/server";
import Evento from "@/models/Evento";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID del evento no proporcionado" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const evento = await Evento.findById(id);

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