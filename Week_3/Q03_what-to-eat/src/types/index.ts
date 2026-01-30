// 날씨 태그 타입
export type WeatherTag =
  | "Clear"
  | "Clouds"
  | "Rain"
  | "Snow"
  | "Thunderstorm"
  | "Drizzle"
  | "Mist";

// 기분 태그 타입
export type MoodTag = "stress" | "tired" | "happy" | "sad" | "normal";

// 메뉴 데이터 타입
export interface Menu {
  id: string;
  name: string;
  category: string;
  weather_tags: WeatherTag[];
  mood_tags: MoodTag[];
  image_url: string;
}

// 날씨 API 응답 타입
export interface WeatherData {
  weather: WeatherTag;
  description: string;
  temp: number;
  icon: string;
  location?: string;
  humidity?: number;
  windSpeed?: number;
  feelsLike?: number;
}

// 추천 결과 타입
export interface RecommendationResult {
  items: {
    menu: Menu;
    reason: string;
    score: number;
    weather_match: boolean;
    mood_match: boolean;
  }[];
}
