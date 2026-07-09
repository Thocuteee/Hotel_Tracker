"use client"

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '@/lib/api';

// Fix Leaflet's default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Branch {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

export default function BranchLocatorMap() {
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    // Only fetch active branches that have coordinates
    api.get('/api/v1/branches')
      .then(res => {
        const validBranches = res.data.filter((b: any) => b.latitude && b.longitude);
        setBranches(validBranches);
      })
      .catch(console.error);
  }, []);

  if (!isMounted || typeof window === 'undefined') return null; // Prevent SSR and StrictMode issues

  // Default center to Vietnam
  const center: [number, number] = [16.047079, 108.206230];

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 z-0 relative">
      <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branches.map(branch => (
          <Marker key={branch.id} position={[branch.latitude, branch.longitude]} icon={customIcon}>
            <Popup>
              <div className="font-bold text-slate-800">{branch.name}</div>
              <div className="text-xs text-slate-500 mt-1">{branch.address}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
