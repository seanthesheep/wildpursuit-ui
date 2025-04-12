const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.weather.gov';

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
    moonPhase?: string;
    moonIllumination?: number;
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

// Add this interface for Solunar data
export interface SolunarData {
  date: string;
  dayRating: number;
  majorPeriods: {
    start: string;
    end: string;
    weight: number;
  }[];
  minorPeriods: {
    start: string;
    end: string;
    weight: number;
  }[];
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  moonIllumination: number;
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

export const getCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      {
        headers: {
          'User-Agent': '(wild-pursuit-ui, contact@wildpursuit.com)',
          'Accept': 'application/geo+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Process the response...
    return getMockWeatherData(); // For now, still using mock data
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getMockWeatherData();
  }
};

export const getForecast = async (lat: number, lon: number): Promise<ForecastData> => {
  try {
    // First get the grid coordinates for the location
    const pointResponse = await fetch(
      `${BASE_URL}/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
      {
        headers: {
          'User-Agent': '(wild-pursuit-ui, contact@wildpursuit.com)',
          'Accept': 'application/geo+json'
        }
      }
    );

    if (!pointResponse.ok) {
      throw new Error('Failed to get grid points');
    }

    const { properties } = await pointResponse.json();
    
    // Get both the regular forecast and hourly forecast
    const [forecastResponse, hourlyResponse] = await Promise.all([
      fetch(properties.forecast, {
        headers: {
          'User-Agent': '(wild-pursuit-ui, contact@wildpursuit.com)',
          'Accept': 'application/geo+json'
        }
      }),
      fetch(properties.forecastHourly, {
        headers: {
          'User-Agent': '(wild-pursuit-ui, contact@wildpursuit.com)',
          'Accept': 'application/geo+json'
        }
      })
    ]);

    if (!forecastResponse.ok || !hourlyResponse.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const forecastData = await forecastResponse.json();
    const hourlyData = await hourlyResponse.json();

    // Process daily forecast - NOAA provides day/night periods, so we need to combine them
    const dailyPeriods = forecastData.properties.periods;
    const daily = [];
    
    for (let i = 0; i < dailyPeriods.length; i += 2) {
      if (dailyPeriods[i] && dailyPeriods[i + 1]) {
        daily.push({
          date: new Date(dailyPeriods[i].startTime).getTime(),
          high: dailyPeriods[i].temperature, // Day temperature
          low: dailyPeriods[i + 1].temperature, // Night temperature
          description: dailyPeriods[i].shortForecast,
          icon: getIconFromDescription(dailyPeriods[i].shortForecast),
          precipChance: dailyPeriods[i].probabilityOfPrecipitation?.value || 0
        });
      }
    }

    const dailyForecast = daily.map(async (day) => {
      // Get solunar data for each day
      const date = new Date(day.date).toISOString().split('T')[0].replace(/-/g, '');
      const solunarData = await getSolunarData(lat, lon, date);
      
      return {
        ...day,
        moonPhase: solunarData.moonPhase,
        moonIllumination: solunarData.moonIllumination
      };
    });

    // Process hourly forecast
    const hourly = hourlyData.properties.periods
      .slice(0, 24)
      .map((period: any) => ({
        time: new Date(period.startTime).getTime(),
        temperature: period.temperature,
        icon: getIconFromDescription(period.shortForecast),
        precipChance: period.probabilityOfPrecipitation?.value || 0,
        windSpeed: parseInt(period.windSpeed.split(' ')[0]),
        windDirection: period.windDirection
      }));

    return { 
      daily: await Promise.all(dailyForecast),
      hourly 
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return getMockForecastData();
  }
};

// Helper function to calculate sunrise/sunset
const calculateSunriseSunset = (lat: number, lon: number) => {
  // This is a simplified calculation
  const date = new Date();
  const sunrise = new Date(date.setHours(6, 0, 0, 0)).getTime();
  const sunset = new Date(date.setHours(20, 0, 0, 0)).getTime();
  return { sunrise, sunset };
};

export const getMoonPhase = async (lat: number, lon: number): Promise<MoonData> => {
  // In a real app, we might use a specialized API for lunar data
  return getMockMoonData();
};

// Add the getSolunarData function
export const getSolunarData = async (lat: number, lon: number, date?: string): Promise<SolunarData> => {
  try {
    const formattedDate = date || 
      new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const tzOffset = -(new Date().getTimezoneOffset() / 60);
    
    const url = `https://api.solunar.org/solunar/${lat},${lon},${formattedDate},${tzOffset}`;
    console.log('Fetching solunar data from:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Solunar API Response:', data);
    
    // Map the API response to our interface
    const solunarData: SolunarData = {
      date: formattedDate,
      dayRating: data.dayRating,
      majorPeriods: [
        {
          start: data.major1Start,
          end: data.major1Stop,
          weight: data.hourlyRating[Math.floor(data.major1StartDec)] || 0
        },
        {
          start: data.major2Start,
          end: data.major2Stop,
          weight: data.hourlyRating[Math.floor(data.major2StartDec)] || 0
        }
      ],
      minorPeriods: [
        {
          start: data.minor1Start,
          end: data.minor1Stop,
          weight: data.hourlyRating[Math.floor(data.minor1StartDec)] || 0
        },
        {
          start: data.minor2Start,
          end: data.minor2Stop,
          weight: data.hourlyRating[Math.floor(data.minor2StartDec)] || 0
        }
      ],
      sunrise: data.sunRise,
      sunset: data.sunSet,
      moonrise: data.moonRise,
      moonset: data.moonSet,
      moonPhase: data.moonPhase,
      moonIllumination: Math.round(data.moonIllumination * 100)
    };

    console.log('Processed Solunar Data:', solunarData);
    return solunarData;
  } catch (error) {
    console.error('Error fetching solunar data:', error);
    return getMockSolunarData();
  }
};

// Update the mock data to match the interface
const getMockSolunarData = (): SolunarData => {
  return {
    date: new Date().toISOString().split('T')[0],
    dayRating: 5,
    majorPeriods: [
      { start: '00:08', end: '02:09', weight: 80 },
      { start: '12:28', end: '14:28', weight: 80 }
    ],
    minorPeriods: [
      { start: '19:39', end: '20:39', weight: 100 },
      { start: '06:25', end: '07:25', weight: 80 }
    ],
    sunrise: '7:11',
    sunset: '20:08',
    moonrise: '20:09',
    moonset: '6:55',
    moonPhase: 'Waning Gibbous',
    moonIllumination: 99
  };
};

// Helper function to map NOAA descriptions to icons
const getIconFromDescription = (description: string): string => {
  const desc = description.toLowerCase();
  if (desc.includes('sun') || desc.includes('clear')) return '01d';
  if (desc.includes('cloud')) return '03d';
  if (desc.includes('rain') || desc.includes('shower')) return '10d';
  if (desc.includes('storm') || desc.includes('thunder')) return '11d';
  if (desc.includes('snow')) return '13d';
  if (desc.includes('fog') || desc.includes('mist')) return '50d';
  return '02d'; // Default to partly cloudy
};
