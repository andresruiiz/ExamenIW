"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Event {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  organizador: string;
  imagen: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/eventos');
        if (!response.ok) {
          throw new Error('Error al cargar los eventos');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError("Error al cargar los eventos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const showSession = () => {
    if (status === "authenticated") {
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2>Bienvenido {session?.user?.name}</h2>
          <img src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} className="w-20 h-20 rounded-full" />
          <button
            className="border border-solid border-black rounded px-4 py-2"
            onClick={() => {
              signOut({ redirect: false }).then(() => {
                router.push("/");
              });
            }}
          >
            Sign Out
          </button>
        </div>
      )
    } else if (status === "loading") {
      return (
        <span className="text-[#888] text-sm mt-7">Loading...</span>
      )
    } else {
      return (
        <Link
          href="/login"
          className="border border-solid border-black rounded px-4 py-2 mb-8"
        >
          Sign In
        </Link>
      )
    }
  }

  if (loading && status !== "loading") return <div>Cargando eventos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {showSession()}
      
      <h1 className="text-2xl font-bold mb-6">Eventos Disponibles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {events.map((event) => (
          <Link href={`/eventos/${event._id}`} key={event._id}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={event.imagen} 
                alt={event.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{event.nombre}</h2>
                <p className="text-gray-600">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{event.lugar}</p>
                <p className="text-gray-600">{event.organizador}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}