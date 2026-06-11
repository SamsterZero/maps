"use client";

import React, { useEffect, useState } from "react";
import { useMapStore } from "@/lib/store";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  Wind,
  Droplets,
  Loader2,
} from "lucide-react";

interface WeatherData {
  temp: number;
  windSpeed: number;
  conditionCode: number;
  isDay: boolean;
}

export default function WeatherWidget() {
  const { selectedPlace } = useMapStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selectedPlace) {
      setWeather(null);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(false);
      try {
        const { lat, lng } = selectedPlace;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day,weather_code,wind_speed_10m,relative_humidity_2m`
        );
        if (!res.ok) throw new Error("Weather fetch failed");
        const data = await res.json();
        
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            windSpeed: Math.round(data.current.wind_speed_10m),
            conditionCode: data.current.weather_code,
            isDay: data.current.is_day === 1,
          });
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedPlace]);

  if (!selectedPlace) return null;

  const getWeatherIcon = (code: number, isDay: boolean) => {
    const className = "w-8 h-8 text-amber-500 animate-pulse";
    if (code === 0) {
      return isDay ? (
        <Sun className={className} />
      ) : (
        <Moon className="w-8 h-8 text-indigo-400 animate-pulse" />
      );
    }
    if (code >= 1 && code <= 3) {
      return <Cloud className="w-8 h-8 text-zinc-400 dark:text-zinc-500 animate-pulse" />;
    }
    if (code === 45 || code === 48) {
      return <CloudFog className="w-8 h-8 text-zinc-400 dark:text-zinc-500 animate-pulse" />;
    }
    if (code >= 51 && code <= 55) {
      return <CloudDrizzle className="w-8 h-8 text-blue-400 animate-pulse" />;
    }
    if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
      return <CloudRain className="w-8 h-8 text-blue-500 animate-pulse" />;
    }
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return <CloudSnow className="w-8 h-8 text-sky-300 animate-pulse" />;
    }
    if (code >= 95) {
      return <CloudLightning className="w-8 h-8 text-purple-500 animate-pulse" />;
    }
    return <Cloud className="w-8 h-8 text-zinc-400 animate-pulse" />;
  };

  const getWeatherDesc = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code === 1) return "Mainly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 85 && code <= 86) return "Snow Showers";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
  };

  return (
    <div className="absolute top-20 right-4 z-40 w-64 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border border-white/20 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <span className="text-xs font-semibold text-zinc-500 mt-2">
              Loading weather data...
            </span>
          </div>
        ) : error || !weather ? (
          <div className="flex flex-col items-center justify-center text-center py-2">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Weather unavailable for this location
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-zinc-800 dark:text-zinc-50 font-sans tracking-tighter">
                {weather.temp}°C
              </span>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                {getWeatherDesc(weather.conditionCode)}
              </span>
              <div className="flex items-center gap-3 mt-3 text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center gap-1">
                  <Wind size={13} className="text-zinc-400 dark:text-zinc-500" />
                  <span className="text-[10px] font-semibold">
                    {weather.windSpeed} km/h
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets size={13} className="text-zinc-400 dark:text-zinc-500" />
                  <span className="text-[10px] font-semibold">Humid</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-white/10 dark:border-zinc-800/20">
              {getWeatherIcon(weather.conditionCode, weather.isDay)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
