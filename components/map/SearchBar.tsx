"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { useMapStore, SearchResult } from "@/lib/store";

/** Raw item shape returned by the Nominatim /search endpoint */
interface NominatimItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    setSelectedPlace,
    flyTo,
  } = useMapStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();

      const results: SearchResult[] = data.map((item: NominatimItem) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(",")[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
      }));

      setSearchResults(results);
      setIsOpen(true);
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 600);
  };

  const handleSelectResult = (result: SearchResult) => {
    setSelectedPlace({
      lat: result.lat,
      lng: result.lng,
      name: result.name,
      address: result.address,
    });
    flyTo(result.lng, result.lat, 14);
    setSearchQuery(result.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPlace(null);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-50">
      <div className="relative flex items-center w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/80 rounded-2xl shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-violet-500/50">
        <div className="flex items-center justify-center pl-4 text-zinc-400 dark:text-zinc-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          suppressHydrationWarning
          placeholder="Search cities, landmarks, addresses..."
          className="w-full py-3.5 px-3 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none font-medium"
          onFocus={() => {
            if (searchResults.length > 0) setIsOpen(true);
          }}
        />
        {isLoading && (
          <div className="flex items-center pr-3">
            <Loader2 size={16} className="animate-spin text-violet-500" />
          </div>
        )}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center p-2 mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-white/20 dark:border-zinc-900/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {searchResults.map((result) => (
              <li key={result.id}>
                <button
                  onClick={() => handleSelectResult(result)}
                  className="flex items-start w-full gap-3 p-4 text-left hover:bg-violet-500/10 transition-colors group"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 group-hover:bg-violet-500/20 group-hover:text-violet-500 text-zinc-400 dark:text-zinc-500 transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors truncate">
                      {result.name}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {result.address}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
