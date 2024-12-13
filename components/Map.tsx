"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Marker, Popup, TileLayer, MapContainer, useMap } from "react-leaflet";
import L from "leaflet";

const popupContentStyle = {
  padding: '10px',
  maxWidth: '500px', // Aumentado para acomodar imágenes más grandes
  width: '100%'
};

import { CSSProperties } from "react";

const imageStyle: CSSProperties = {
  width: '100%', // Usar ancho relativo
  maxWidth: '480px', // Máximo ancho de la imagen
  height: 'auto', // Altura automática para mantener proporción
  objectFit: 'contain', // Asegura que la imagen completa sea visible
  borderRadius: '8px',
  marginTop: '8px',
  marginBottom: '8px'
};

// Cargar el componente dinámicamente para evitar problemas con el lado del servidor
const Map = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
  }
);

// Icono personalizado para los marcadores del mapa
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Visit {
  _id: string;
  nombre: string;
  lugar: string;
  lat: number;
  lon: number;
  imagen: string;
}

interface MapProps {
  location?: { lat: number; lon: number }; // Hacer location opcional
  visitas: Visit[];
}

const RecenterAutomatically = ({
  location,
}: {
  location: { lat: number; lon: number };
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lon]);
  }, [location.lat, location.lon]);
  return null;
};

const EventMap: React.FC<MapProps> = ({
  location = { lat: 54.526, lon: 15.2551 }, // Valor por defecto: centro de Europa
  visitas,
}) => {
  const [zoom, setZoom] = useState(4); // Zoom inicial más alejado para ver Europa

  useEffect(() => {
    if (location.lat && location.lon) {
      setZoom(13);
    }
  }, [location]);

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={zoom}
      style={{ height: "500px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {visitas.map((visita) => (
        <Marker
          key={visita._id}
          position={[visita.lat, visita.lon]}
          icon={customIcon}
        >
          <Popup>
            <div style={popupContentStyle}>
              <strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>{visita.nombre}</strong>
              <img
                src={visita.imagen}
                alt={visita.nombre}
                style={imageStyle}
              />
              <div style={{ marginTop: '8px' }}>{visita.lugar}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      <RecenterAutomatically location={location} />
    </MapContainer>
  );
};

export default EventMap;
