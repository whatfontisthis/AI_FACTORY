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

    if (!OPENWEATHER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenWeatherMap API key is not configured' },
        { status: 500 }
      );
    }

    let weatherUrl: string;

    if (lat && lon) {
      weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;
    } else if (city) {
      weatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;
    } else {
      return NextResponse.json(
        { error: 'Either coordinates (lat, lon) or city name is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    const formattedWeather = {
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        visibility: weatherData.visibility / 1000,
        uvIndex: null,
      },
      temp: {
        min: Math.round(weatherData.main.temp_min),
        max: Math.round(weatherData.main.temp_max),
      },
      sys: {
        sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toISOString(),
      },
    };

    return NextResponse.json(formattedWeather);

  } catch (error) {
    console.error('Weather API error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Failed to fetch weather data';
      
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