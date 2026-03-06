import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GEOJSON_URL = "https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/assam.geojson";

// Helper component to handle zoom animation
const ZoomHandler = ({ bounds }: { bounds: any }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [bounds, map]);
  return null;
};

const MapComponent: React.FC = () => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState<any>(null);
  const [targetBounds, setTargetBounds] = useState<any>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON:", err));
  }, []);

  // Standard district style
  const districtStyle = () => ({
    fillColor: 'transparent',
    weight: 1.5,
    opacity: 1,
    color: '#78350f', // amber-900
    fillOpacity: 0.1,
    className: 'district-polygon'
  });

  const onEachDistrict = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.4,
          fillColor: '#f59e0b', // amber-500 (The Glow)
          weight: 2,
          color: '#78350f'
        });
        layer.bringToFront();
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(districtStyle());
      },
      click: (e: any) => {
        const layer = e.target;
        const bounds = layer.getBounds();
        setTargetBounds(bounds);
        
        // The district name property might vary by GeoJSON source
        const districtName = feature.properties.district || feature.properties.NAME_1 || feature.properties.name || 'district';
        
        setTimeout(() => {
          navigate(`/district/${districtName.toLowerCase()}`);
        }, 1500);
      }
    });

    layer.bindTooltip(feature.properties.district || feature.properties.NAME_1 || feature.properties.name, {
      sticky: true,
      className: 'district-tooltip'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-3xl overflow-hidden border-8 border-amber-50 shadow-2xl relative bg-[#fffdfa]"
    >
      <MapContainer 
        center={[26.2006, 92.9376]} 
        zoom={7} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={districtStyle} 
            onEachFeature={onEachDistrict} 
          />
        )}
        {targetBounds && <ZoomHandler bounds={targetBounds} />}
      </MapContainer>
      
      <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
        <h3 className="text-4xl font-black text-amber-900 leading-none">THE LAND</h3>
        <p className="text-amber-800 font-bold opacity-60">District-wise Heritage Map</p>
      </div>

      <style>{`
        .district-polygon {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .district-tooltip {
          background: #451a03 !important;
          color: #fef3c7 !important;
          border: none !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }
        .leaflet-container {
          background-color: transparent !important;
        }
      `}</style>
    </motion.div>
  );
};

export default MapComponent;
