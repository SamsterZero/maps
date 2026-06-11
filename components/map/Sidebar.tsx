"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Route,
  BarChart3,
  Trash2,
  Compass,
  Plus,
  Undo,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import { useMapStore, SavedPlace, MapMode } from "@/lib/store";
import { cn } from "@/lib/utils";
import * as turf from "@turf/turf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

type ActiveTab = "places" | "routes" | "analytics";

export default function Sidebar() {
  const {
    mode,
    setMode,
    savedPlaces,
    addSavedPlace,
    deleteSavedPlace,
    selectedPlace,
    setSelectedPlace,
    routeWaypoints,
    clearRouteWaypoints,
    removeLastRouteWaypoint,
    flyTo,
  } = useMapStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("places");
  const [mounted, setMounted] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state for new place
  const [placeName, setPlaceName] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const [placeCat, setPlaceCat] = useState<SavedPlace["category"]>("nature");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync details from selectedPlace to place creation form
  useEffect(() => {
    if (selectedPlace) {
      setPlaceName(selectedPlace.name || "");
      setPlaceDesc(selectedPlace.address || "");
    }
  }, [selectedPlace]);

  if (!mounted) return null;

  // Compute route distance
  const routeDistance = (() => {
    if (routeWaypoints.length < 2) return 0;
    try {
      const line = turf.lineString(routeWaypoints);
      return turf.length(line, { units: "kilometers" });
    } catch (e) {
      console.error(e);
      return 0;
    }
  })();

  const categories = [
    { value: "food", label: "Dining", color: "#f59e0b" },
    { value: "nature", label: "Nature", color: "#22c55e" },
    { value: "work", label: "Work", color: "#3b82f6" },
    { value: "cultural", label: "Cultural", color: "#ec4899" },
    { value: "other", label: "Other", color: "#a855f7" },
  ];

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;

    const catInfo = categories.find((c) => c.value === placeCat);

    addSavedPlace({
      name: placeName || "Custom Point",
      description: placeDesc || "Custom coordinates",
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      category: placeCat,
      color: catInfo ? catInfo.color : "#6366f1",
    });

    // Reset selected state and exit creation mode
    setSelectedPlace(null);
    setPlaceName("");
    setPlaceDesc("");
    setMode("view");
  };

  // Compile data for Recharts
  const chartData = categories.map((cat) => {
    const count = savedPlaces.filter((p) => p.category === cat.value).length;
    return {
      name: cat.label,
      value: count,
      color: cat.color,
    };
  });

  const totalPlaces = savedPlaces.length;

  return (
    <div className="flex flex-col w-full md:w-96 h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-900/60 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
              Atlasify
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Map Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/10 text-violet-500 border border-violet-500/10 gap-0.5">
            <Sparkles size={10} />
            PRO
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-900">
        <button
          onClick={() => {
            setActiveTab("places");
            if (mode === "plan-route") setMode("view");
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
            activeTab === "places"
              ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
              : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          )}
        >
          <MapPin size={14} />
          Places
        </button>
        <button
          onClick={() => {
            setActiveTab("routes");
            setMode("plan-route");
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
            activeTab === "routes"
              ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
              : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          )}
        >
          <Route size={14} />
          Routes
        </button>
        <button
          onClick={() => {
            setActiveTab("analytics");
            if (mode === "plan-route") setMode("view");
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all duration-200",
            activeTab === "analytics"
              ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
              : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          )}
        >
          <BarChart3 size={14} />
          Stats
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* TAB 1: PLACES */}
        {activeTab === "places" && (
          <div className="space-y-4">
            {/* Adding Place Mode Form */}
            {selectedPlace ? (
              <form
                onSubmit={handleSavePlace}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 space-y-3 animate-in slide-in-from-top-4 duration-300"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                    Save Selected Location
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedPlace(null)}
                    className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="E.g., Favorite Coffee Shop"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-violet-500 text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                    Description / Address
                  </label>
                  <textarea
                    value={placeDesc}
                    onChange={(e) => setPlaceDesc(e.target.value)}
                    placeholder="Short description..."
                    rows={2}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-violet-500 text-zinc-800 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() =>
                          setPlaceCat(cat.value as SavedPlace["category"])
                        }
                        className={cn(
                          "py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200",
                          placeCat === cat.value
                            ? "bg-violet-500/15 border-violet-500 text-violet-500 dark:text-violet-400"
                            : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 hover:scale-[1.01] active:scale-100 transition-all duration-150"
                >
                  Save to Bookmarks
                </button>
              </form>
            ) : (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  Tip: Click anywhere on the map or search to place a marker, then save it here!
                </p>
              </div>
            )}

            {/* Places List Filters */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Bookmarks ({savedPlaces.length})
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-[10px] font-bold bg-transparent text-zinc-500 dark:text-zinc-400 border-none outline-none focus:ring-0 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            {savedPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <MapPin className="w-8 h-8 stroke-1 mb-2 text-zinc-300" />
                <span className="text-xs font-semibold">No saved bookmarks</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedPlaces
                  .filter(
                    (p) => filterCategory === "all" || p.category === filterCategory
                  )
                  .map((place) => (
                    <div
                      key={place.id}
                      onClick={() => {
                        flyTo(place.lng, place.lat, 14);
                        setSelectedPlace({
                          lat: place.lat,
                          lng: place.lng,
                          name: place.name,
                          address: place.description,
                        });
                      }}
                      className="group p-3.5 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm hover:shadow-md hover:border-violet-500/20 dark:hover:border-violet-500/20 cursor-pointer transition-all duration-200 flex items-start justify-between"
                    >
                      <div className="flex gap-3 min-w-0">
                        <div
                          className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${place.color}15`,
                            color: place.color,
                          }}
                        >
                          <MapPin size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors truncate">
                            {place.name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                            {place.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 mt-2">
                            <Calendar size={10} />
                            {new Date(place.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedPlace(place.id);
                          // Clear selected if we deleted it
                          if (
                            selectedPlace &&
                            selectedPlace.lat === place.lat &&
                            selectedPlace.lng === place.lng
                          ) {
                            setSelectedPlace(null);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all duration-200 shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROUTES */}
        {activeTab === "routes" && (
          <div className="space-y-4">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <Route size={14} />
                Route planner mode active
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Click consecutive points directly on the map to plot a route. We will calculate the path distance dynamically.
              </p>
            </div>

            {/* Waypoints List */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Waypoints ({routeWaypoints.length})
              </span>
              {routeWaypoints.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={removeLastRouteWaypoint}
                    className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                  >
                    <Undo size={11} />
                    Undo
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-800">|</span>
                  <button
                    onClick={clearRouteWaypoints}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {routeWaypoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Route className="w-8 h-8 stroke-1 mb-2 text-zinc-300" />
                <span className="text-xs font-semibold">Click on the map to start drawing</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Distance Card */}
                {routeWaypoints.length >= 2 && (
                  <div className="p-4 bg-gradient-to-tr from-violet-600 to-indigo-500 text-white rounded-2xl shadow-lg shadow-violet-500/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-100">
                      Total Calculated Distance
                    </span>
                    <h3 className="text-2xl font-black mt-1">
                      {routeDistance.toFixed(2)} km
                    </h3>
                  </div>
                )}

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {routeWaypoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 truncate w-48">
                          Lng: {pt[0].toFixed(4)}, Lat: {pt[1].toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-2xl">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block">
                  Total Bookmarks
                </span>
                <span className="text-xl font-black text-zinc-800 dark:text-zinc-50 mt-1 block">
                  {totalPlaces}
                </span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-2xl">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block">
                  Active Mode
                </span>
                <span className="text-xs font-bold text-violet-500 mt-2 block capitalize">
                  {mode === "plan-route" ? "Route planner" : "Explorer"}
                </span>
              </div>
            </div>

            {/* Chart */}
            {totalPlaces === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <BarChart3 className="w-8 h-8 stroke-1 mb-2 text-zinc-300" />
                <span className="text-xs font-semibold">No data to display. Please add bookmarks.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Category Breakdown
                </span>

                <div className="h-48 w-full bg-white dark:bg-zinc-950 p-2 border border-zinc-100 dark:border-zinc-900 rounded-2xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(9, 9, 11, 0.9)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "10px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2.5">
                  {chartData.map((entry) => {
                    const percent = totalPlaces > 0 ? (entry.value / totalPlaces) * 100 : 0;
                    return (
                      <div key={entry.name} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                          <span>{entry.name}</span>
                          <span>
                            {entry.value} ({Math.round(percent)}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: entry.color,
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
