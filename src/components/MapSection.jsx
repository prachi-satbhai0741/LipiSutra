import { useEffect } from "react";

const GOOGLE_KEY = import.meta.env.VITE_MAPS_KEY || import.meta.env.VITE_VISION_KEY;

export default function MapSection({ documentLocation }) {
  useEffect(() => {
    const initMap = () => {
      if (!window.google) return;
      
      const lat = documentLocation?.lat || 19.0;
      const lng = documentLocation?.lng || 74.0;
      const zoom = documentLocation ? 11 : 6;

      const map = new window.google.maps.Map(document.getElementById("heritage-map"), {
        center: { lat, lng }, zoom,
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0B1121" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#94A3B8" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0B1121", weight: 2 }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#050810" }] },
          { featureType: "road", stylers: [{ visibility: "simplified" }, { color: "#1E293B" }] },
          { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#D4AF37", weight: 0.5 }] }
        ]
      });

      if (documentLocation) {
        const marker = new window.google.maps.Marker({
          position: { lat: documentLocation.lat, lng: documentLocation.lng }, 
          map, 
          title: documentLocation.name || "Detected Location",
          icon: { 
            path: window.google.maps.SymbolPath.CIRCLE, 
            scale: 12,
            fillColor: "#FCD34D", 
            fillOpacity: 0.9, 
            strokeColor: "#D4AF37", 
            strokeWeight: 2 
          }
        });
        
        const info = new window.google.maps.InfoWindow({
          content: `<div style="background:#131A2B;color:#F8F9FA;padding:16px;border-radius:12px;border:1px solid rgba(212,175,55,0.3);font-family:'Inter',sans-serif">
            <strong style="color:#D4AF37;font-size:15px;font-family:'Cinzel',serif">${documentLocation.name || 'Origin Site Key'}</strong>
            <span style="font-size:12px;color:#94A3B8;margin-top:8px;display:block">Identified from document analysis</span>
          </div>`
        });
        
        marker.addListener("click", () => info.open(map, marker));
        info.open(map, marker);
      }
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&callback=initLipisutraMap`;
      script.async = true;
      window.initLipisutraMap = initMap;
      document.head.appendChild(script);
    }
  }, [documentLocation]);

  return (
    <div className="bg-museum-800/40 rounded-xl overflow-hidden border border-museum-700 shadow-xl">
      <div className="p-5 border-b border-museum-700 bg-museum-900/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-heading text-gold-500 mb-1">🗺️ Heritage Map</h2>
          <p className="text-slate-400 text-xs">
            {documentLocation ? "Displaying detected geographical origin." : "Atlas overview of historical records."}
          </p>
        </div>
      </div>
      <div id="heritage-map" className="w-full h-[400px] bg-museum-900" />
    </div>
  );
}