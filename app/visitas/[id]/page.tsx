'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { use } from 'react';
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Visita {
  _id: string;
  nombre: string;
  timestamp: string;
  lugar: string;
  lat: number;
  lon: number;
  creador: string;
  imagen: string;
}

async function getVisita(id: string): Promise<Visita> {
  const res = await fetch(`/api/visitas/${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Error al cargar la visita');
  }
  
  return res.json();
}

export default function VisitaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [visita, setVisita] = useState<Visita | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = use(params);

  useEffect(() => {
    getVisita(id)
      .then(setVisita)
      .catch(err => setError(err.message));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar esta visita?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/visitas/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al borrar la visita');
      }
    } catch (err) {
      setError('Error al borrar la visita');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!visita) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-blue-500 mb-4 block">
          ← Volver
        </Link>
        
        <h1 className="text-2xl font-bold mb-4">{visita.nombre}</h1>
        
        <div className="mb-8">
          <img 
            src={visita.imagen} 
            alt={visita.nombre}
            className="w-full h-64 object-cover rounded"
          />
        </div>

        <div className="grid gap-4 mb-8">
          <p><strong>Fecha:</strong> {new Date(visita.timestamp).toLocaleString()}</p>
          <p><strong>Lugar:</strong> {visita.lugar}</p>
          <p><strong>Creador:</strong> {visita.creador}</p>
        </div>

        <div className="mb-8">
          <Map location={{ lat: visita.lat, lon: visita.lon }} visitas={[visita]} />
        </div>

        {session?.user?.email === visita.creador && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
          >
            {isDeleting ? 'Borrando...' : 'Borrar visita'}
          </button>
        )}
      </div>
    </main>
  );
}