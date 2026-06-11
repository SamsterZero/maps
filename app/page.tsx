"use client";

import { useState } from "react";
import Sidebar from "@/components/map/Sidebar";
import MapContainer from "@/components/map/MapContainer";
import SearchBar from "@/components/map/SearchBar";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="h-screen w-screen overflow-hidden font-sans select-none relative bg-zinc-950">
      {/* Map fills the entire viewport */}
      <MapContainer />

      {/* Floating Search Bar */}
      <div
        className={cn(
          "absolute top-4 z-30 transition-all duration-300 ease-in-out",
          // Mobile styling: takes up remaining width next to toggle button
          "left-[4rem] w-[calc(100%-5rem)]",
          // Desktop styling: fixed width, dynamic left position based on sidebar
          "md:w-[22rem]",
          sidebarOpen ? "md:left-[25.5rem]" : "md:left-[4rem]"
        )}
      >
        <SearchBar />
      </div>

      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        title={sidebarOpen ? "Close panel" : "Open panel"}
        className="absolute top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-900/60 flex items-center justify-center text-zinc-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 shadow-lg hover:scale-105 active:scale-100 transition-all duration-150"
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {/* Overlay Sidebar Panel */}
      <div
        className={cn(
          "absolute top-[4.5rem] left-4 bottom-4 z-30 transition-all duration-300 ease-in-out",
          // Mobile styling: almost full width
          "w-[calc(100%-2rem)]",
          // Desktop styling: 24rem (96) width
          "md:w-96",
          sidebarOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-6 pointer-events-none"
        )}
      >
        <Sidebar />
      </div>
    </main>
  );
}
