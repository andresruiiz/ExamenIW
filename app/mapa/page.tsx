"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

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

export default function MapaUsuario() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 40.416775, lon: -3.703790 }); // Default Madrid

  useEffect(() => {
    const fetchVisits = async () => {
      if (email) {
        setLoading(true);
        try {
          const response = await fetch(`/api/visitas?email=${email}`);
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
  }, [email]);

  if (!email) {
    return <div>No se ha proporcionado un email</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-7xl mb-8">
        <Map location={location} visitas={visits} />
      </div>
    </main>
  );
}