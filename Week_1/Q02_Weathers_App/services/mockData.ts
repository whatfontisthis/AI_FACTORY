export const mockWeatherData = {
  location: {
    name: '서울',
    country: 'KR',
    lat: 37.5665,
    lon: 126.9780,
  },
  current: {
    temperature: 24,
    feelsLike: 26,
    description: '맑음',
    icon: '01d',
    humidity: 65,
    pressure: 1013,
    windSpeed: 3.2,
    windDirection: 180,
    visibility: 10,
    uvIndex: 6,
  },
  temp: {
    min: 18,
    max: 28,
  },
  sys: {
    sunrise: new Date('2024-01-18T06:12:00').toISOString(),
    sunset: new Date('2024-01-18T19:48:00').toISOString(),
  },
};

export const mockForecastData = {
  location: {
    name: '서울',
    country: 'KR',
    lat: 37.5665,
    lon: 126.9780,
  },
  forecast: [
    {
      date: new Date().toDateString(),
      temp: { min: 18, max: 28 },
      weather: {
        main: 'Clear',
        description: '맑음',
        icon: '01d',
      },
      humidity: 65,
      windSpeed: 3.2,
    },
    {
      date: new Date(Date.now() + 86400000).toDateString(),
      temp: { min: 20, max: 30 },
      weather: {
        main: 'Clouds',
        description: '구름 조금',
        icon: '02d',
      },
      humidity: 70,
      windSpeed: 2.8,
    },
    {
      date: new Date(Date.now() + 172800000).toDateString(),
      temp: { min: 17, max: 25 },
      weather: {
        main: 'Rain',
        description: '비',
        icon: '10d',
      },
      humidity: 85,
      windSpeed: 4.1,
    },
  ],
};