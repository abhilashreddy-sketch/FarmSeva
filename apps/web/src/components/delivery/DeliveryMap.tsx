'use client';

import React, { useEffect, useRef } from 'react';
import { Navigation, MapPin, Store, Truck } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface DeliveryMapProps {
  partnerLat: number;
  partnerLng: number;
  pickupLat?: number;
  pickupLng?: number;
  pickupName?: string;
  dropLat?: number;
  dropLng?: number;
  dropName?: string;
  activeStatus?: string;
}

export default function DeliveryMap({
  partnerLat,
  partnerLng,
  pickupLat = 16.312,
  pickupLng = 80.441,
  pickupName = 'Agri Store Pickup',
  dropLat = 16.325,
  dropLng = 80.452,
  dropName = 'Farmer Ramesh Field',
  activeStatus = 'IN_TRANSIT',
}: DeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import Leaflet on client side
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      // Fix default marker icon assets issue in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Cleanup existing map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current).setView([partnerLat, partnerLng], 14);
      mapInstanceRef.current = map;

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const latLngs: L.LatLngExpression[] = [[partnerLat, partnerLng]];

      // Custom Partner Icon
      const partnerIcon = L.divIcon({
        className: 'custom-leaflet-partner-icon',
        html: `<div style="background-color: #059669; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">🚚</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([partnerLat, partnerLng], { icon: partnerIcon })
        .addTo(map)
        .bindPopup(`<b>Your Live GPS Location</b><br/>Accuracy: Live HTML5 GPS`);

      // Pickup Marker
      if (pickupLat && pickupLng) {
        latLngs.push([pickupLat, pickupLng]);
        const pickupIcon = L.divIcon({
          className: 'custom-leaflet-pickup-icon',
          html: `<div style="background-color: #d97706; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">🏪</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        L.marker([pickupLat, pickupLng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup Point:</b> ${pickupName}`);
      }

      // Drop Marker
      if (dropLat && dropLng) {
        latLngs.push([dropLat, dropLng]);
        const dropIcon = L.divIcon({
          className: 'custom-leaflet-drop-icon',
          html: `<div style="background-color: #2563eb; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">📍</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        L.marker([dropLat, dropLng], { icon: dropIcon })
          .addTo(map)
          .bindPopup(`<b>Delivery Point:</b> ${dropName}`);
      }

      // Draw Polyline Route
      if (latLngs.length > 1) {
        L.polyline(latLngs, {
          color: '#10b981',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.8,
        }).addTo(map);

        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [partnerLat, partnerLng, pickupLat, pickupLng, dropLat, dropLng]);

  // Determine Google Maps target destination based on delivery state
  const targetLat = activeStatus === 'ACCEPTED' || activeStatus === 'ASSIGNED' ? pickupLat : dropLat;
  const targetLng = activeStatus === 'ACCEPTED' || activeStatus === 'ASSIGNED' ? pickupLng : dropLng;
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${partnerLat},${partnerLng}&destination=${targetLat},${targetLng}&travelmode=driving`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-72 md:h-96 z-0" />

      {/* Floating Control Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-lg border border-emerald-400/30 transition"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Google Maps</span>
        </a>
      </div>

      {/* Map Legend */}
      <div className="bg-slate-950/90 border-t border-slate-800 p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>You (Live GPS)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>Pickup Point</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Drop Point</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400">Powered by OpenStreetMap & HTML5 GPS</span>
      </div>
    </div>
  );
}
