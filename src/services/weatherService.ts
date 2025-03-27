import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  windGust?: number;
  cloudCover: number;
  visibility: number;
  precipChance: number;
  description: string;
  icon: string;
  high: number;
  low: number;
  sunrise: number;
  sunset: number;
  date: number;
}

export interface ForecastData {
  daily: {
    date: number;
    high: number;
    low: number;
    description: string;
    icon: string;
    precipChance: number;
  }[];
  hourly: {
    time: number;
    temperature: number;
    icon: string;
    precipChance: number;
    windSpeed: number;
    windDirection: string;
  }[];
}

export interface MoonData {
  phase: string;
  illumination: number;
  moonrise: number;
  moonset: number;
  overhead: number;
  underfoot: number;
}

// Since we're mocking the API for now, provide mock data
export const getMockWeatherData = (): WeatherData => {
  return {
    temperature: 50.68,
    feelsLike: 50.68,
    humidity: 83,
    pressure: 29.94,
    windSpeed: 3.94,
    windDirection: 'N',
    windGust: 6.65,
    cloudCover: 23,
    visibility: 9.942,
    precipChance: 0,
    description: 'Mostly Clear',
    icon: '01d',
    high: 62.0,
    low: 46.0,
    sunrise: 1710837420, // 7:31 AM
    sunset: 1710880980, // 7:33 PM
    date: Date.now(),
  };
};

export const getMockForecastData = (): ForecastData => {
  const daily = [
    {
      date: 1710825600000, // Monday
      high: 62,
      low: 46,
      description: 'Partly Cloudy with Showers',
      icon: '10d',
      precipChance: 40,
    },
    {
      date: 1710912000000, // Tuesday
      high: 72,
      low: 37,
      description: 'Sunny',
      icon: '01d',
      precipChance: 0,
    },
    {
      date: 1710998400000, // Wednesday
      high: 77,
      low: 45,
      description: 'Mostly Sunny',
      icon: '02d',
      precipChance: 10,
    },
    {
      date: 1711084800000, // Thursday
      high: 67,
      low: 48,
      description: 'Partly Cloudy with Scattered Showers',
      icon: '10d',
      precipChance: 30,
    },
    {
      date: 1711171200000, // Friday
      high: 60,
      low: 36,
      description: 'Partly Cloudy with Isolated Showers',
      icon: '10d',
      precipChance: 20,
    },
  ];

  const hourly = Array.from({ length: 24 }, (_, i) => {
    const time = new Date();
    time.setHours(time.getHours() + i);
    return {
      time: time.getTime(),
      temperature: Math.floor(Math.random() * 20) + 50, // Random temp between 50-70
      icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)], // Random icon
      precipChance: Math.floor(Math.random() * 50),
      windSpeed: Math.floor(Math.random() * 10) + 2,
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    };
  });

  return { daily, hourly };
};

export const getMockMoonData = (): MoonData => {
  return {
    phase: 'Waning Gibbous',
    illumination: 93,
    moonrise: 1710667020, // 10:57 PM
    moonset: 1710714900, // 8:55 AM
    overhead: 1710696600, // 3:50 AM
    underfoot: 1710739860, // 3:51 PM
  };
};

export const getGameActivityTimes = () => {
  return {
    amMinor: [
      { date: Date.now(), time: '7:55 AM' },
      { date: Date.now(), time: '9:55 AM' },
    ],
    amMajor: [
      { date: Date.now(), time: '2:38 AM' },
      { date: Date.now(), time: '5:30 AM' },
    ],
    pmMinor: [
      { date: Date.now(), time: '9:57 PM' },
      { date: Date.now(), time: '11:57 PM' },
    ],
    pmMajor: [
      { date: Date.now(), time: '1:51 PM' },
      { date: Date.now(), time: '4:51 PM' },
    ],
  };
};

// In a real app, these functions would call the actual OpenWeather API
export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // This would make a real API call
    // const response = await axios.get(
    //   `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
    // );
    // Process the response...

    // For now, return mock data
    return getMockWeatherData();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getMockWeatherData(); // Fallback to mock data
  }
};

export const getForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  try {
    // This would make a real API call
    // const response = await axios.get(
    //   `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${API_KEY}&units=imperial`
    // );
    // Process the response...

    // For now, return mock data
    return getMockForecastData();
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return getMockForecastData(); // Fallback to mock data
  }
};

export const getMoonPhase = async (lat: number, lon: number): Promise<MoonData> => {
  // In a real app, we might use a specialized API for lunar data
  return getMockMoonData();
};
