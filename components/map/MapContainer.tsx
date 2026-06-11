"use client";

import { useEffect, useRef, useState } from "react";
import type { Feature, LineString } from "geojson";
import Map, { Marker, Source, Layer, MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { useMapStore, MapStyleType } from "@/lib/store";
import { MapPin, Navigation, ZoomIn, ZoomOut, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

// Map style JSON sheets from CartoDB
const STYLE_URLS: Record<MapStyleType, string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
};

export default function MapContainer() {
  const {
    mode,
    mapStyle,
    setMapStyle,
    savedPlaces,
    selectedPlace,
    setSelectedPlace,
    routeWaypoints,
    addRouteWaypoint,
    flyToTrigger,
  } = useMapStore();

  const mapRef = useRef<MapRef>(null);
  const [viewport, setViewport] = useState({
    longitude: 2.2945, // Paris
    latitude: 48.8584,
    zoom: 12,
    pitch: 30,
    bearing: 0,
  });

  // Watch flyToTrigger to animate map
  useEffect(() => {
    if (flyToTrigger && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToTrigger.lng, flyToTrigger.lat],
        zoom: flyToTrigger.zoom,
        duration: 2000,
        essential: true,
      });
    }
  }, [flyToTrigger]);

  const handleMapClick = (e: MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    if (mode === "plan-route") {
      addRouteWaypoint([lng, lat]);
    } else {
      setSelectedPlace({
        lat,
        lng,
        name: "Pinned Location",
        address: `Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`,
      });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 2000,
            });
            setSelectedPlace({
              lat: latitude,
              lng: longitude,
              name: "Your Location",
              address: "Based on browser geolocation sensor.",
            });
          }
        },
        (error) => {
          console.error("Error finding location:", error);
          alert("Could not access your location. Please check browser permissions.");
        }
      );
    }
  };

  const handleZoom = (amount: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.easeTo({
        zoom: currentZoom + amount,
        duration: 300,
      });
    }
  };

  const handleResetNorth = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 0, // Resetting pitch as well for a clean top-down view
        duration: 500,
      });
    }
  };

  // Compile GeoJSON line representation of path
  const routeGeoJSON: Feature<LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: routeWaypoints,
    },
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapLib={maplibregl}
        mapStyle={STYLE_URLS[mapStyle]}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
        maxZoom={20}
        minZoom={2}
      >
        {/* Route Path Rendering */}
        {routeWaypoints.length >= 2 && (
          <Source id="route-path" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#8b5cf6", // violet-500
                "line-width": 5,
                "line-opacity": 0.85,
              }}
            />
            {/* Glow / Outline */}
            <Layer
              id="route-glow"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#a78bfa", // violet-400
                "line-width": 9,
                "line-opacity": 0.25,
              }}
            />
          </Source>
        )}

        {/* Saved Markers */}
        {savedPlaces.map((place) => (
          <Marker
            key={place.id}
            longitude={place.lng}
            latitude={place.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPlace({
                lat: place.lat,
                lng: place.lng,
                name: place.name,
                address: place.description,
              });
              mapRef.current?.flyTo({
                center: [place.lng, place.lat],
                zoom: 14,
                duration: 1000,
              });
            }}
          >
            <div className="flex flex-col items-center group cursor-pointer">
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900/90 dark:bg-zinc-950/95 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2.5 rounded-lg border border-white/10 shadow-lg pointer-events-none whitespace-nowrap">
                {place.name}
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-950 hover:scale-110 hover:rotate-3 duration-250 transition-all"
                style={{ backgroundColor: place.color, color: "#fff" }}
              >
                <MapPin size={16} className="text-white drop-shadow-md" />
              </div>
              <div
                className="w-1.5 h-1.5 rounded-full mt-0.5 shadow-sm"
                style={{ backgroundColor: place.color }}
              />
            </div>
          </Marker>
        ))}

        {/* Temporary selected marker */}
        {selectedPlace && (
          <Marker
            longitude={selectedPlace.lng}
            latitude={selectedPlace.lat}
            anchor="bottom"
          >
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <span className="absolute inline-flex h-10 w-10 rounded-full bg-violet-400 opacity-75 animate-ping" />
              {/* Inner pin */}
              <div className="relative bg-violet-600 border-2 border-white text-white p-2 rounded-2xl shadow-xl">
                <MapPin size={18} />
              </div>
            </div>
          </Marker>
        )}

        {/* Route waypoints (numbered rings) */}
        {routeWaypoints.map((pt, idx) => (
          <Marker key={`wp-${idx}`} longitude={pt[0]} latitude={pt[1]} anchor="center">
            <div className="w-5 h-5 rounded-full bg-violet-600 border-2 border-white text-white text-[9px] font-black flex items-center justify-center shadow-md animate-scale">
              {idx + 1}
            </div>
          </Marker>
        ))}
      </Map>

      {/* Floating Layer Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-1.5 border border-zinc-200/50 dark:border-zinc-900/60 rounded-2xl shadow-lg">
          {(["dark", "light", "voyager"] as MapStyleType[]).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              suppressHydrationWarning
              className={cn(
                "px-3 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all duration-200 capitalize",
                mapStyle === style
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Utility Tools (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={handleResetNorth}
          title="Reset North"
          className="w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-900/60 flex items-center justify-center text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 shadow-lg transition-all duration-150"
        >
          <Compass 
            size={20} 
            style={{ transform: `rotate(-${viewport.bearing || 0}deg)` }} 
            className="transition-transform duration-75"
          />
        </button>

        <button
          onClick={handleLocateMe}
          title="My Location"
          className="w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-900/60 flex items-center justify-center text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 shadow-lg hover:scale-105 active:scale-100 transition-all duration-150 group"
        >
          <Navigation size={18} className="group-hover:animate-pulse" />
        </button>

        <div className="flex flex-col bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-900/60 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => handleZoom(1)}
            title="Zoom In"
            className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 border-b border-zinc-100 dark:border-zinc-900 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            title="Zoom Out"
            className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
