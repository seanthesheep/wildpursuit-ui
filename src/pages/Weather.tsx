import React, { useState, useEffect, useRef } from 'react';
import { useMap } from '../contexts/MapContext';
import {
  getCurrentWeather,
  getForecast,
  getMoonPhase,
  getGameActivityTimes,
  WeatherData,
  ForecastData,
  MoonData,
  getSolunarData,
  SolunarData
} from '../services/weatherService';
import { MapPin, ChevronUp, ChevronDown, Moon, Sun } from 'react-feather';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the access token directly - using a dedicated token for this project
mapboxgl.accessToken = 'pk.eyJ1Ijoic3N1bGxpdmFuZGV2IiwiYSI6ImNtOGN6azhnejBqZWkybHBzbXBvc3RqOTYifQ.jqD31E5Hd0xtu16Oy45uIA';

const WeatherPage: React.FC = () => {
  const { mapLocation } = useMap();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [gameActivity, setGameActivity] = useState<any>(null);
  const [solunarData, setSolunarData] = useState<SolunarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Get moon phase for a specific date
  const getMoonPhaseForDate = (dayOffset: number): string => {
    // This is mocked data for the demo
    const phases = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
    ];
    return phases[(new Date().getDate() + dayOffset) % phases.length];
  };

  // Get moon phase percentage for a specific date (0-100)
  const getMoonIlluminationForDate = (dayOffset: number): number => {
    // For demo purposes, we'll generate illumination based on day of month
    const day = (new Date().getDate() + dayOffset) % 30;
    if (day < 15) {
      return Math.round((day / 15) * 100); // Waxing from 0% to 100%
    } else {
      return Math.round(((30 - day) / 15) * 100); // Waning from 100% to 0%
    }
  };

  // Generate dates for week
  const getWeekDates = () => {
    const today = new Date();
    const dates = [];

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Add this helper function in Weather.tsx
  const getMoonIcon = (phase: string) => {
    const phases: { [key: string]: string } = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘'
    };
    return phases[phase] || '🌑';
  };

  // Add this helper function alongside getMoonIcon
  const getWeatherIcon = (description: string) => {
    const conditions: Record<string, string> = {
      'Clear': '☀️',
      'Sunny': '☀️',
      'Partly Cloudy': '⛅',
      'Mostly Cloudy': '🌥️',
      'Cloudy': '☁️',
      'Rain': '🌧️',
      'Light Rain': '🌦️',
      'Heavy Rain': '⛈️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Light Snow': '🌨️',
      'Heavy Snow': '❄️',
      'Fog': '🌫️',
      'Haze': '🌫️',
      'Wind': '💨',
      'Storm':'⛈️',
    };
    
    // Find partial matches if exact match isn't found
    const condition = Object.keys(conditions).find(key => 
      description.toLowerCase().includes(key.toLowerCase())
    );
    
    return condition ? conditions[condition] : '☀️'; // Default to sunny if no match
  };

  // Initialize background map
  useEffect(() => {
    // Wait for container ref to be available
    if (!mapContainer.current) return;

    // Don't reinitialize if map already exists
    if (map.current) return;

    // Initialize map
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [mapLocation.longitude, mapLocation.latitude],
        zoom: 12,
        interactive: false,
        cooperativeGestures: true, // Better for mobile
      });

      // Add marker at current location
      new mapboxgl.Marker({ color: '#3FB1CE' })
        .setLngLat([mapLocation.longitude, mapLocation.latitude])
        .addTo(map.current);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapContainer, mapLocation.longitude, mapLocation.latitude]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data for location:', mapLocation);
        const [weatherData, forecastData, solunarResponse] = await Promise.all([
          getCurrentWeather(mapLocation.latitude, mapLocation.longitude),
          getForecast(mapLocation.latitude, mapLocation.longitude),
          getSolunarData(mapLocation.latitude, mapLocation.longitude)
        ]);

        console.log('Solunar Response:', solunarResponse);
        setWeather(weatherData);
        setForecast(forecastData);
        setSolunarData(solunarResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mapLocation]);

  // Format date for display
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  // Format time for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format day for display
  const formatDay = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format short day for display
  const formatShortDay = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short' // Changed to 'short' for mobile
    });
  };

  // Format month/day for display
  const formatMonthDay = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleForecast = () => {
    setShowForecast(!showForecast);
  };

  // Returns moon phase icon URL based on illumination percentage
  const getMoonPhaseIcon = (illumination: number) => {
    if (illumination < 5) return 'https://same-assets.com/9a56ca76-afec-4af7-b63b-5d26491f37c8.png'; // New moon
    if (illumination < 45) return 'https://same-assets.com/0b1d1ed4-e0f3-4c2d-9bf6-c85c59d61ffd.png'; // Crescent
    if (illumination < 55) return 'https://same-assets.com/ed42afdb-a20b-4c30-9d6e-ee6b9c13f4ee.png'; // Quarter
    if (illumination < 95) return 'https://same-assets.com/c1b18a8e-4c74-4652-9302-a0a98d88c375.png'; // Gibbous
    return 'https://same-assets.com/0c33dfe5-aebb-4296-89ed-5b2996a74b7a.png'; // Full moon
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Get week dates for moon phase calendar
  const weekDates = getWeekDates();

  return (
    <div className="h-full relative">
      {/* Background Map */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Main Content Container */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 md:p-4 overflow-y-auto max-h-full">
        {/* Location Header */}
        <div className="text-white text-xl md:text-3xl font-semibold ml-2 mb-4">
          My Location
        </div>

        {/* Weather and Solunar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Weather Section */}
          <div>
            <div className="bg-green-600 text-white text-center py-2 rounded-t-md font-semibold">
              CURRENT WEATHER
            </div>
            <div className="bg-black bg-opacity-75 text-white p-3 md:p-4 rounded-b-md">
              <div className="text-center mb-4">
                <div className="text-base md:text-2xl">{formatDate()}</div>
                <div className="flex flex-wrap items-center justify-center mt-4">
                  <div className="mb-2 md:mb-0 md:mr-8">
                    <div className="text-4xl md:text-6xl">
                      {getWeatherIcon(weather?.description || '')}
                    </div>
                  </div>
                  <div className="mx-4 md:mx-0">
                    <div className="text-3xl md:text-5xl">{weather?.temperature.toFixed(0)}°F</div>
                    <div className="text-xs md:text-sm">Feels like {weather?.feelsLike.toFixed(0)}°F</div>
                    <div className="text-xs md:text-sm mt-1 md:mt-2">
                      Hi: {weather?.high.toFixed(0)}°F | Lo: {weather?.low.toFixed(0)}°F
                    </div>
                  </div>
                  <div className="ml-4 md:ml-8 mt-2 md:mt-0">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-green-500 flex items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-green-400 flex items-center justify-center">
                          <div className="w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-green-300 flex items-center justify-center">
                            <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-red-500"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-4 text-base md:text-xl">{weather?.description}</div>

                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4 md:mt-6 text-xs md:text-base">
                  <div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Pressure:</span>
                      <span>{weather?.pressure} inHg</span>
                    </div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Visibility:</span>
                      <span>{weather?.visibility} mi</span>
                    </div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Cloud cover:</span>
                      <span>{weather?.cloudCover}%</span>
                    </div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Chance of prec:</span>
                      <span>{weather?.precipChance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Humidity:</span>
                      <span>{weather?.humidity}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Wind direction:</span>
                      <span>N</span>
                    </div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Wind (out of):</span>
                      <span>{weather?.windSpeed} mph N</span>
                    </div>
                    <div className="flex justify-between mb-1 md:mb-2">
                      <span>Gust:</span>
                      <span>{weather?.windGust} mph</span>
                    </div>
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <span></span>
                      <div className="w-20 md:w-32 bg-gray-700 h-2 rounded-full">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <span></span>
                      <div className="w-20 md:w-32 bg-gray-700 h-2 rounded-full">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solunar Section */}
          <div>
            <div className="bg-green-600 text-white text-center py-2 rounded-t-md font-semibold">
              SOLUNAR
            </div>
            <div className="bg-black bg-opacity-75 text-white p-3 md:p-4 rounded-b-md">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                </div>
              ) : solunarData ? (
                <div className="mb-3 md:mb-4">
                  <h3 className="font-semibold mb-2">
                    Day Rating: {solunarData.dayRating}/5
                    <span className="text-xs text-gray-400 ml-2">(Debug: {JSON.stringify(solunarData.dayRating)})</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Major Periods</h4>
                      <div className="text-sm">
                        {solunarData.majorPeriods[0].start} - {solunarData.majorPeriods[0].end}
                        <span className="text-xs text-gray-400 ml-2">({solunarData.majorPeriods[0].weight}%)</span>
                      </div>
                      <div className="text-sm">
                        {solunarData.majorPeriods[1].start} - {solunarData.majorPeriods[1].end}
                        <span className="text-xs text-gray-400 ml-2">({solunarData.majorPeriods[1].weight}%)</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Minor Periods</h4>
                      <div className="text-sm">
                        {solunarData.minorPeriods[0].start} - {solunarData.minorPeriods[0].end}
                        <span className="text-xs text-gray-400 ml-2">({solunarData.minorPeriods[0].weight}%)</span>
                      </div>
                      <div className="text-sm">
                        {solunarData.minorPeriods[1].start} - {solunarData.minorPeriods[1].end}
                        <span className="text-xs text-gray-400 ml-2">({solunarData.minorPeriods[1].weight}%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="font-medium mb-1">Sun</h4>
                      <div className="text-sm">Rise: {solunarData.sunrise}</div>
                      <div className="text-sm">Set: {solunarData.sunset}</div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Moon</h4>
                      <div className="text-sm">Phase: {solunarData.moonPhase}</div>
                      <div className="text-sm">Rise: {solunarData.moonrise}</div>
                      <div className="text-sm">Set: {solunarData.moonset}</div>
                      <div className="text-sm">Illumination: {solunarData.moonIllumination}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  No solunar data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5 Day Forecast Section */}
        <div className="mt-4">
          <button
            onClick={toggleForecast}
            className="w-full bg-green-600 text-white py-1 md:py-2 font-semibold flex items-center justify-center"
          >
            5 DAY FORECAST
            {showForecast ? (
              <ChevronDown className="ml-2" size={18} />
            ) : (
              <ChevronUp className="ml-2" size={18} />
            )}
          </button>

          {/* Collapsible Forecast Content */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showForecast ? 'max-h-80' : 'max-h-0'
            }`}
          >
            <div className="grid grid-cols-5 bg-black bg-opacity-75 text-white text-xs md:text-base">
              {forecast?.daily.map((day, index) => (
                <div key={index} className="text-center p-2 md:p-4 border-r border-gray-700 last:border-r-0">
                  <div className="font-medium">{formatDay(day.date)}</div>
                  <div className="flex flex-col items-center my-2">
                    <div className="text-2xl md:text-3xl mb-1">
                      {getWeatherIcon(day.description)}
                    </div>
                    <div className="text-xs mt-1">{day.description}</div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-sm">H: {day.high}°</div>
                    <div className="text-sm">L: {day.low}°</div>
                  </div>
                  {/* Moon Phase */}
                  <div className="mt-2 text-xs text-gray-300">
                    <div className="text-lg">{getMoonIcon(day.moonPhase)}</div>
                    <div>{day.moonIllumination}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
