"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Visit {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  creador: string;
  imagen: string;
}

export default function Visitas() {
  const router = useRouter();
  const { data: session } = useSession();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 40.416775, lon: -3.703790 });

  useEffect(() => {
    const fetchVisits = async () => {
      if (session?.user?.email) {
        setLoading(true);
        try {
          const response = await fetch(`/api/visitas?email=${session.user.email}`);
          if (!response.ok) throw new Error('Error al cargar las visitas');
          const data = await response.json();
          setVisits(data);
          
          if (data.length > 0) {
            setLocation({ lat: data[0].lat, lon: data[0].lon });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVisits();
  }, [session?.user?.email]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/mapa?email=${searchText}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl mb-4 flex gap-4 items-center">
        <Link href="/crear">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Añadir visita
          </button>
        </Link>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar por email..."
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Buscar
          </button>
        </form>
      </div>
      <div className="w-full max-w-7xl mb-8">
        <Map location={location} visitas={visits} />
      </div>
    </main>
  );
}