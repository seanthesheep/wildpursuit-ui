import React, { useState, useEffect, useRef } from 'react';
import { useMap } from '../contexts/MapContext';
import {
  getCurrentWeather,
  getForecast,
  getMoonPhase,
  getGameActivityTimes,
  WeatherData,
  ForecastData,
  MoonData
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
        const [weatherData, forecastData, moonPhaseData] = await Promise.all([
          getCurrentWeather(mapLocation.latitude, mapLocation.longitude),
          getForecast(mapLocation.latitude, mapLocation.longitude),
          getMoonPhase(mapLocation.latitude, mapLocation.longitude)
        ]);

        setWeather(weatherData);
        setForecast(forecastData);
        setMoonData(moonPhaseData);
        setGameActivity(getGameActivityTimes());
      } catch (error) {
        console.error('Error fetching weather data:', error);
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

      {/* Weather Cards */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 md:p-4 overflow-y-auto max-h-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
        {/* Area Name */}
        <div className="text-white text-xl md:text-3xl font-semibold ml-2">My Location</div>

        {/* Current Weather Card */}
        <div className="bg-green-600 text-white text-center py-2 rounded-t-md font-semibold col-span-1">
          CURRENT WEATHER
        </div>

        {/* Solunar Card */}
        <div className="bg-green-600 text-white text-center py-2 rounded-t-md font-semibold col-span-1">
          SOLUNAR
        </div>

        {/* Current Weather Content */}
        <div className="bg-black bg-opacity-75 text-white p-3 md:p-4 rounded-b-md">
          <div className="text-center mb-4">
            <div className="text-base md:text-2xl">{formatDate()}</div>
            <div className="flex flex-wrap items-center justify-center mt-4">
              <div className="mb-2 md:mb-0 md:mr-8">
                <img
                  src="https://c.tadst.com/gfx/1200x630/waning-gibbous-moon.jpg?1"
                  alt="Moon"
                  className="w-20 h-20 md:w-32 md:h-32"
                />
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
                    {/* Wind direction indicator */}
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

        {/* Solunar Content */}
        <div className="bg-black bg-opacity-75 text-white p-3 md:p-4 rounded-b-md">
          {/* Moon Phase Calendar - displays 5 days */}
          <div className="mb-3 md:mb-4 text-xs md:text-base">
            <h3 className="text-sm font-semibold mb-2">Moon Phase Calendar</h3>
            <div className="grid grid-cols-5 text-center mb-3 md:mb-4 border-b border-gray-700 pb-2">
              {weekDates.map((date, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="font-medium">{formatShortDay(date.getTime())}</span>
                  <span className="text-xs text-gray-400">{formatMonthDay(date.getTime())}</span>
                </div>
              ))}
            </div>

            {/* Moon Phase Icons */}
            <div className="grid grid-cols-5 text-center mb-2">
              {weekDates.map((date, index) => {
                const illumination = getMoonIlluminationForDate(index);
                return (
                  <div key={`moon-${index}`} className="flex flex-col items-center">
                    <img
                      src={getMoonPhaseIcon(illumination)}
                      alt={`Moon phase day ${index+1}`}
                      className="w-8 h-8 md:w-12 md:h-12"
                    />
                    <span className="text-xs mt-1">{illumination}%</span>
                    <span className="text-xs text-gray-400">{getMoonPhaseForDate(index)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-3 md:mb-4 text-xs md:text-base">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">Today's Moon Phase:</span>
              <span>{moonData?.phase}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
              <div>
                <h3 className="text-center mb-1 md:mb-2">Solar position</h3>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>Sunrise:</span>
                  <span>Mar 17, 7:31 AM</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Sunset:</span>
                  <span>Mar 17, 7:33 PM</span>
                </div>
              </div>
              <div>
                <h3 className="text-center mb-1 md:mb-2">Lunar Position</h3>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>Moonrise:</span>
                  <span>Mar 17, 10:57 PM</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>Overhead:</span>
                  <span>Mar 17, 3:50 AM</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>Moonset:</span>
                  <span>Mar 17, 8:55 AM</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Underfoot:</span>
                  <span>Mar 17, 3:51 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 md:mb-4 text-xs md:text-base">
            <h3 className="font-semibold mb-1 md:mb-2">Peak Game Activity Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>AM Minor:</span>
                  <span className="text-right">7:55 AM / 9:55 AM</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>AM Major:</span>
                  <span className="text-right">2:38 AM / 5:30 AM</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>PM Minor:</span>
                  <span className="text-right">9:57 PM / 11:57 PM</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>PM Major:</span>
                  <span className="text-right">1:51 PM / 4:51 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-3">
            <Sun size={20} className="text-yellow-400 mr-2" />
            <div className="w-40 h-2 bg-gray-700 rounded-full">
              <div className="h-2 bg-yellow-400 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <Moon size={20} className="text-blue-300 ml-2" />
          </div>

          <div className="text-xs text-center text-gray-400">
            Based on current moon phase and solar/lunar positions
          </div>
        </div>
      </div>

      {/* 5 Day Forecast Toggle Button */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <button
          onClick={toggleForecast}
          className="w-full bg-green-600 text-white py-1 md:py-2 font-semibold flex items-center justify-center"
        >
          5 DAY FORECAST
          {showForecast ?
            <ChevronDown className="ml-2" size={18} /> :
            <ChevronUp className="ml-2" size={18} />
          }
        </button>

        {/* Collapsible Forecast Content */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showForecast ? 'max-h-80' : 'max-h-0'}`}>
          <div className="grid grid-cols-5 bg-gray-200 bg-opacity-80 text-xs md:text-base">
            {forecast?.daily.map((day, index) => (
              <div key={index} className="text-center p-2 md:p-4">
                <div className="font-semibold">{formatShortDay(day.date)}</div>
                <div className="text-xs text-gray-600">{formatMonthDay(day.date)}</div>
                <div className="my-2 md:my-4 flex justify-center">
                  <img
                    src={`https://same-assets.com/${day.icon === '01d' ? '75fb4090-1e9e-495e-a9e3-36010d4aa5b3.png' : '68c2fcda-d23c-49c2-a3c7-6c92bf18c0a3.png'}`}
                    alt={day.description}
                    className="w-10 h-10 md:w-20 md:h-20"
                  />
                </div>
                <div className="text-xs md:text-sm hidden md:block">{day.description}</div>
                <div className="font-semibold mt-1 md:mt-2 text-xs md:text-base">
                  {day.high}° / {day.low}°
                </div>
                <div className="mt-2 md:mt-4 text-center">
                  <button className="bg-gray-400 text-white py-1 px-2 md:px-4 rounded-sm text-xs md:text-sm">
                    DETAILS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
