import axios from 'axios';

export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    description: string;
    icon: string;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number | null;
  };
  temp: {
    min: number;
    max: number;
  };
  sys: {
    sunrise: string;
    sunset: string;
  };
}

export interface ForecastData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  forecast: Array<{
    date: string;
    temp: {
      min: number;
      max: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    humidity: number;
    windSpeed: number;
  }>;
}

export class WeatherService {
  private static baseUrl = '/api/weather';

  static async getCurrentWeather(params: {
    lat?: number;
    lon?: number;
    city?: string;
  }): Promise<WeatherData> {
    const searchParams = new URLSearchParams();
    
    if (params.lat && params.lon) {
      searchParams.set('lat', params.lat.toString());
      searchParams.set('lon', params.lon.toString());
    }
    
    if (params.city) {
      searchParams.set('city', params.city);
    }

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch weather data');
    }
    
    return response.json();
  }

  static async getForecast(params: {
    lat?: number;
    lon?: number;
    city?: string;
    days?: number;
  }): Promise<ForecastData> {
    const searchParams = new URLSearchParams();
    
    if (params.lat && params.lon) {
      searchParams.set('lat', params.lat.toString());
      searchParams.set('lon', params.lon.toString());
    }
    
    if (params.city) {
      searchParams.set('city', params.city);
    }
    
    if (params.days) {
      searchParams.set('days', params.days.toString());
    }

    const response = await fetch(`${this.baseUrl}/forecast?${searchParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch forecast data');
    }
    
    return response.json();
  }
}