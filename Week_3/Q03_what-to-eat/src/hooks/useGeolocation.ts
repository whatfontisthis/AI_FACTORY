"use client";

import { useState, useEffect } from "react";

const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator?.geolocation) {
      setState({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LON,
        error: null,
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      () => {
        setState({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LON,
          error: null,
          loading: false,
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return state;
}
