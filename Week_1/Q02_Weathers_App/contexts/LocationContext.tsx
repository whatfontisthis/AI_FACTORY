'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LocationContextType {
  selectedLocation: string | null;
  selectedCoordinates: { lat: number; lon: number } | null;
  setLocation: (location: string) => void;
  setCoordinates: (coords: { lat: number; lon: number }) => void;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  const setLocation = useCallback((location: string) => {
    setSelectedLocation(location);
    setSelectedCoordinates(null);
  }, []);

  const setCoordinates = useCallback((coords: { lat: number; lon: number }) => {
    setSelectedCoordinates(prev => {
      // Only update if coordinates actually changed
      if (prev && prev.lat === coords.lat && prev.lon === coords.lon) {
        return prev;
      }
      return coords;
    });
    setSelectedLocation(null);
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
    setSelectedCoordinates(null);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        selectedCoordinates,
        setLocation,
        setCoordinates,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
