import { NextResponse } from "next/server";
import Log from "@/models/Log";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    await connectDB();
    const logs = await Log.find({ visitedEmail: email }).sort({ timestamp: -1 });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error al obtener logs:", error);
    return NextResponse.json({ error: "Error al obtener logs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorEmail, visitedEmail } = body;

    if (!visitorEmail || !visitedEmail) {
      return NextResponse.json(
        { error: "Se requieren visitorEmail y visitedEmail" },
        { status: 400 }
      );
    }

    await connectDB();
    const newLog = new Log({
      visitorEmail,
      visitedEmail,
      timestamp: new Date()
    });

    await newLog.save();
    return NextResponse.json(newLog);

  } catch (error) {
    console.error("Error al crear log:", error);
    return NextResponse.json(
      { error: "Error al crear log" },
      { status: 500 }
    );
  }
}