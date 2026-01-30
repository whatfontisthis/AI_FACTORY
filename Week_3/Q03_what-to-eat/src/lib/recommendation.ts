import type { Menu, WeatherTag, MoodTag } from "@/types";

const W_WEATHER = 0.4;
const W_MOOD = 0.6;

/**
 * 단일 메뉴 점수 계산
 * Score = (W × 0.4) + (M × 0.6)
 */
export function calculateScore(
  menu: Menu,
  weather: WeatherTag,
  mood: MoodTag
): number {
  const W = menu.weather_tags.includes(weather) ? 1 : 0;
  const M = menu.mood_tags.includes(mood) ? 1 : 0;
  return W * W_WEATHER + M * W_MOOD;
}

/**
 * 최고 점수 메뉴 그룹 필터링
 */
export function filterTopScoreMenus(
  menus: Menu[],
  weather: WeatherTag,
  mood: MoodTag
): Menu[] {
  if (menus.length === 0) return [];
  const scores = menus.map((m) => ({
    menu: m,
    score: calculateScore(m, weather, mood),
  }));
  const maxScore = Math.max(...scores.map((s) => s.score));
  return scores.filter((s) => s.score === maxScore).map((s) => s.menu);
}

/**
 * 최종 메뉴 선택 (무작위)
 */
export function selectRandomMenu(menus: Menu[]): Menu {
  return menus[Math.floor(Math.random() * menus.length)];
}

/**
 * 추천 사유 생성
 */
export function generateReason(
  menu: Menu,
  weather: WeatherTag,
  mood: MoodTag
): string {
  const weatherKo: Record<WeatherTag, string> = {
    Clear: "맑은",
    Clouds: "흐린",
    Rain: "비 오는",
    Snow: "눈 오는",
    Thunderstorm: "천둥번개 치는",
    Drizzle: "이슬비 오는",
    Mist: "안개 낀",
  };
  const moodKo: Record<MoodTag, string> = {
    stress: "스트레스",
    tired: "피곤",
    happy: "신나",
    sad: "우울",
    normal: "그냥 그래",
  };
  const w = weatherKo[weather];
  const m = moodKo[mood];
  if (weather === "Rain" && mood === "stress")
    return `${menu.name}로 스트레스 확 풀어요!`;
  if (weather === "Clear" && mood === "happy")
    return `기분 좋은 날엔 ${menu.name} 어때요?`;
  if (weather === "Clouds" && mood === "tired")
    return `피곤할 땐 든든한 ${menu.name}!`;
  return `${w} 날, ${m}할 때 ${menu.name} 어떠세요?`;
}
