import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city');
    const days = parseInt(searchParams.get('days') || '7');

    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenWeatherMap API key is not configured' },
        { status: 500 }
      );
    }

    let forecastUrl: string;

    if (lat && lon) {
      forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr&cnt=${days * 8}`;
    } else if (city) {
      forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr&cnt=${days * 8}`;
    } else {
      return NextResponse.json(
        { error: 'Either coordinates (lat, lon) or city name is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(forecastUrl);
    const forecastData = response.data;

    const dailyForecasts = new Map();

    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, {
          date: date,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          weather_main: item.weather[0].main,
        });
      } else {
        const existing = dailyForecasts.get(date);
        existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
        existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
      }
    });

    const formattedForecast = Array.from(dailyForecasts.values()).slice(0, days).map(day => ({
      date: day.date,
      temp: {
        min: Math.round(day.temp_min),
        max: Math.round(day.temp_max),
      },
      weather: {
        main: day.weather_main,
        description: day.description,
        icon: day.icon,
      },
      humidity: day.humidity,
      windSpeed: Math.round(day.wind_speed * 10) / 10,
    }));

    return NextResponse.json({
      location: {
        name: forecastData.city.name,
        country: forecastData.city.country,
        lat: forecastData.city.coord.lat,
        lon: forecastData.city.coord.lon,
      },
      forecast: formattedForecast,
    });

  } catch (error) {
    console.error('Forecast API error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Failed to fetch forecast data';
      
      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}