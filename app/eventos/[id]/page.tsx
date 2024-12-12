import Link from "next/link";

interface Event {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  organizador: string;
  imagen: string;
}

async function getEvent(id: string): Promise<Event> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/eventos/${id}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al cargar el evento');
  }

  const data = await res.json();
  return data;
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  return (
    <div className="p-8">
      <Link href="/" className="text-blue-500 mb-4 block">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold mb-4">{event.nombre}</h1>
      <div className="grid gap-4">
        <img 
          src={event.imagen} 
          alt={event.nombre}
          className="w-full h-64 object-cover rounded"
        />
        <p><strong>Fecha:</strong> {new Date(event.timestamp).toLocaleString()}</p>
        <p><strong>Lugar:</strong> {event.lugar}</p>
        <p><strong>Organizador:</strong> {event.organizador}</p>
      </div>
    </div>
  );
}