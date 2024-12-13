import { NextResponse } from "next/server";
import Visita from "@/models/Visita";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const visita = await Visita.findById(id);

    if (!visita) {
      return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
    }

    return NextResponse.json(visita);
  } catch (error) {
    console.error("Error al obtener la visita:", error);
    return NextResponse.json({ error: "Error al obtener la visita" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const visita = await Visita.findById(id);
    if (!visita) {
      return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario es el creador
    if (visita.creador !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const timestamp = formData.get("timestamp") as string;
    const lugar = formData.get("lugar") as string;
    const imagen = formData.get("imagen") as File;

    // Procesar nueva imagen si se proporciona
    let imagenUrl = visita.imagen;
    if (imagen) {
      const bytes = await imagen.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const response = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });
      imagenUrl = (response as { secure_url: string }).secure_url;
    }

    // Obtener coordenadas del lugar
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      lugar
    )}&format=json&limit=1`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    let lat = visita.lat;
    let lon = visita.lon;

    if (geocodeData && geocodeData.length > 0) {
      lat = parseFloat(geocodeData[0].lat);
      lon = parseFloat(geocodeData[0].lon);
    }

    const visitaActualizada = await Visita.findByIdAndUpdate(
      id,
      {
        nombre,
        timestamp,
        lugar,
        lat,
        lon,
        imagen: imagenUrl
      },
      { new: true }
    );

    return NextResponse.json(visitaActualizada);
  } catch (error) {
    console.error("Error al actualizar la visita:", error);
    return NextResponse.json(
      { error: "Error al actualizar la visita" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const visita = await Visita.findById(id);
    if (!visita) {
      return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario es el creador
    if (visita.creador !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await Visita.findByIdAndDelete(id);
    return NextResponse.json({ message: "Visita eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la visita:", error);
    return NextResponse.json(
      { error: "Error al eliminar la visita" },
      { status: 500 }
    );
  }
}