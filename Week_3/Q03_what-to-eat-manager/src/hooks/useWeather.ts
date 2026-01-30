"use client";

import { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "./useGeolocation";
import type { WeatherData } from "@/types";

export interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeather(): UseWeatherReturn {
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    const lat = latitude ?? 37.5665;
    const lon = longitude ?? 126.978;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "날씨 조회 실패");
      }
      const data = await res.json();
      setWeather(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "날씨 조회 실패");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (geoLoading) return;
    void fetchWeather();
  }, [geoLoading, fetchWeather]);

  return { weather, loading: geoLoading || loading, error, refetch: fetchWeather };
}
