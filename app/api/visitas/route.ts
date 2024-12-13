import { NextRequest, NextResponse } from "next/server";
import Visita from "@/models/Visita";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    await connectDB();

    if (email) {
      // Búsqueda por email del creador
      const visitas = await Visita.find({
        creador: email
      }).sort({ timestamp: 1 });
      
      return NextResponse.json(visitas);
    }

    // Si no hay email, devuelve todas las visitas
    const visitas = await Visita.find({}).sort({ timestamp: 1 });
    return NextResponse.json(visitas);
  } catch (error) {
    console.error("Error al obtener visitas:", error);
    return NextResponse.json(
      { error: "Error al obtener visitas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear visitas" },
        { status: 401 }
      );
    }

    await connectDB();
    const formData = await req.formData();
    const nombre = formData.get("nombre") as string;
    const timestamp = formData.get("timestamp") as string;
    const lugar = formData.get("lugar") as string;
    const imagen = formData.get("imagen") as File;

    if (!imagen) {
      return NextResponse.json(
        { error: "No se ha proporcionado una imagen" },
        { status: 400 }
      );
    }

    const bytes = await imagen.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });

    const imagenUrl = (response as { secure_url: string }).secure_url;

    // Obtener las coordenadas basadas en 'lugar' usando OpenStreetMap Nominatim API
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      lugar
    )}&format=json&limit=1`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    let lat = 0;
    let lon = 0;

    if (geocodeData && geocodeData.length > 0) {
      lat = parseFloat(geocodeData[0].lat);
      lon = parseFloat(geocodeData[0].lon);
    } else {
      console.error(
        "No se pudieron obtener las coordenadas para el lugar proporcionado."
      );
    }

    // Crear la visita usando el email del usuario autenticado
    const visita = new Visita({
      nombre,
      timestamp,
      lugar,
      lat,
      lon,
      creador: session.user.email,
      imagen: imagenUrl,
    });

    await visita.save();
    return NextResponse.json(visita, { status: 201 });
  } catch (error) {
    console.error("Error al crear la visita:", error);
    return NextResponse.json(
      { error: "Error al crear la visita" },
      { status: 500 }
    );
  }
}