import { create } from "zustand";

export interface SavedPlace {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: "food" | "nature" | "work" | "cultural" | "other";
  color: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export type MapMode = "view" | "add-marker" | "plan-route";
export type MapStyleType = "dark" | "light" | "voyager";

interface MapState {
  // App state
  mode: MapMode;
  setMode: (mode: MapMode) => void;
  mapStyle: MapStyleType;
  setMapStyle: (style: MapStyleType) => void;

  // Saved Places (Bookmarks)
  savedPlaces: SavedPlace[];
  addSavedPlace: (place: Omit<SavedPlace, "id" | "createdAt">) => void;
  deleteSavedPlace: (id: string) => void;
  updateSavedPlace: (id: string, place: Partial<SavedPlace>) => void;

  // Selected Location (clicked or searched)
  selectedPlace: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
  } | null;
  setSelectedPlace: (
    place: { lat: number; lng: number; name?: string; address?: string } | null
  ) => void;

  // Search results
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Routing
  routeWaypoints: [number, number][]; // Array of [lng, lat]
  addRouteWaypoint: (point: [number, number]) => void;
  clearRouteWaypoints: () => void;
  removeLastRouteWaypoint: () => void;

  // Navigation controller
  flyToTrigger: {
    lng: number;
    lat: number;
    zoom: number;
    timestamp: number;
  } | null;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

// Helper to load saved places from localStorage (client-side only)
const getInitialSavedPlaces = (): SavedPlace[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("atlasify-saved-places");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse saved places", e);
      return [];
    }
  }
  // Default POIs if empty to make the map look lively on first load!
  const defaultPOIs: SavedPlace[] = [
    {
      id: "1",
      name: "Eiffel Tower",
      description: "Iconic iron tower in the heart of Paris.",
      lat: 48.8584,
      lng: 2.2945,
      category: "cultural",
      color: "#ec4899", // Pink-500
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Central Park",
      description: "Beautiful green space in NYC.",
      lat: 40.785091,
      lng: -73.968285,
      category: "nature",
      color: "#22c55e", // Green-500
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Shibuya Crossing",
      description: "World famous pedestrian scramble crossing.",
      lat: 35.6595,
      lng: 139.7005,
      category: "food",
      color: "#f59e0b", // Amber-500
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem("atlasify-saved-places", JSON.stringify(defaultPOIs));
  return defaultPOIs;
};

export const useMapStore = create<MapState>((set) => ({
  mode: "view",
  setMode: (mode) => set({ mode }),
  mapStyle: "dark",
  setMapStyle: (mapStyle) => set({ mapStyle }),

  savedPlaces: getInitialSavedPlaces(),
  addSavedPlace: (place) =>
    set((state) => {
      const newPlace: SavedPlace = {
        ...place,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...state.savedPlaces, newPlace];
      localStorage.setItem("atlasify-saved-places", JSON.stringify(updated));
      return { savedPlaces: updated };
    }),
  deleteSavedPlace: (id) =>
    set((state) => {
      const updated = state.savedPlaces.filter((p) => p.id !== id);
      localStorage.setItem("atlasify-saved-places", JSON.stringify(updated));
      return { savedPlaces: updated };
    }),
  updateSavedPlace: (id, updatedFields) =>
    set((state) => {
      const updated = state.savedPlaces.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      );
      localStorage.setItem("atlasify-saved-places", JSON.stringify(updated));
      return { savedPlaces: updated };
    }),

  selectedPlace: null,
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),

  searchResults: [],
  setSearchResults: (searchResults) => set({ searchResults }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  routeWaypoints: [],
  addRouteWaypoint: (point) =>
    set((state) => ({ routeWaypoints: [...state.routeWaypoints, point] })),
  clearRouteWaypoints: () => set({ routeWaypoints: [] }),
  removeLastRouteWaypoint: () =>
    set((state) => ({
      routeWaypoints: state.routeWaypoints.slice(0, -1),
    })),

  flyToTrigger: null,
  flyTo: (lng, lat, zoom = 14) =>
    set({
      flyToTrigger: {
        lng,
        lat,
        zoom,
        timestamp: Date.now(),
      },
    }),
}));
