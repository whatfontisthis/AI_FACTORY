import { NextRequest, NextResponse } from "next/server";
import type { WeatherTag } from "@/types";

const WEATHER_TAGS: WeatherTag[] = [
  "Clear",
  "Clouds",
  "Rain",
  "Snow",
  "Thunderstorm",
  "Drizzle",
  "Mist",
];

function toWeatherTag(main: string): WeatherTag {
  if (WEATHER_TAGS.includes(main as WeatherTag)) return main as WeatherTag;
  if (main === "Atmosphere") return "Mist";
  return "Clear";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENWEATHER_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // 1. Fetch Current Weather (with lang=kr for description)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error("Weather API error");
    }
    const weatherData = await weatherRes.json();

    // 2. Fetch Reverse Geocoding for Korean City Name
    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const geoRes = await fetch(geoUrl);
    let location = weatherData.name;
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData.length > 0 && geoData[0].local_names?.ko) {
        location = geoData[0].local_names.ko;
      }
    }

    const weather = toWeatherTag(weatherData.weather?.[0]?.main ?? "Clear");
    const description = weatherData.weather?.[0]?.description ?? "";
    const temp = Number(weatherData.main?.temp) ?? 0;
    const icon = weatherData.weather?.[0]?.icon ?? "01d";
    const humidity = weatherData.main?.humidity;
    const windSpeed = weatherData.wind?.speed;
    const feelsLike = weatherData.main?.feels_like;

    return NextResponse.json({
      weather,
      description,
      temp,
      icon,
      location,
      humidity,
      windSpeed,
      feelsLike,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch weather", details: String(e) },
      { status: 500 }
    );
  }
}
