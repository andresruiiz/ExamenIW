'use client'
import { useEffect, useState, use } from "react";
import Link from "next/link";
import Script from 'next/script';

// Declaración de tipos para OpenLayers
declare global {
  interface Window {
    OpenLayers: any;
  }
}

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

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/eventos/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Error al cargar el evento');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError("Error al cargar el evento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [resolvedParams.id]);

  // Maneja la carga del script de OpenLayers
  const handleOpenLayersLoad = () => {
    setMapLoaded(true);
  };

  // Inicializa el mapa cuando tanto el evento como OpenLayers están disponibles
  useEffect(() => {
    if (event && mapLoaded && window.OpenLayers) {
      // Limpia cualquier mapa existente
      const existingMap = document.getElementById("mapdiv");
      if (existingMap) {
        existingMap.innerHTML = '';
      }

      // Crea el nuevo mapa
      const map = new window.OpenLayers.Map("mapdiv");
      map.addLayer(new window.OpenLayers.Layer.OSM());

      const lonLat = new window.OpenLayers.LonLat(event.lon, event.lat)
        .transform(
          new window.OpenLayers.Projection("EPSG:4326"),
          map.getProjectionObject()
        );

      const markers = new window.OpenLayers.Layer.Markers("Markers");
      markers.addMarker(new window.OpenLayers.Marker(lonLat));
      
      map.addLayer(markers);
      map.setCenter(lonLat, 16);

      // Cleanup al desmontar
      return () => {
        map.destroy();
      };
    }
  }, [event, mapLoaded]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Evento no encontrado</div>;

  return (
    <div className="p-8">
      <Script 
        src="https://www.openlayers.org/api/OpenLayers.js" 
        onLoad={handleOpenLayersLoad}
        strategy="afterInteractive"
      />
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
        <div 
          id="mapdiv" 
          className="h-[400px] w-full border rounded"
        />
      </div>
    </div>
  );
}