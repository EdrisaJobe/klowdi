import type { LocationSuggestion } from '../types/location';
import type { WeatherData } from '../types/weather';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

interface GeocodingResponse {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  local_names?: { en?: string };
}

interface WeatherAPIResponse {
  coord: { lat: number; lon: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind?: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  name: string;
}

async function searchLocationsByAPI(query: string): Promise<LocationSuggestion[]> {
  if (!API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to search locations');
  }

  const data: GeocodingResponse[] = await response.json();
  
  return data.map((location) => ({
    name: location.local_names?.en || location.name,
    lat: location.lat,
    lon: location.lon,
    country: location.country,
    state: location.state || location.country
  }));
}

// Mock data for fallback
function generateMockWeatherData(lat: number, lon: number): WeatherData {
  const temp = Math.floor(Math.random() * 30) + 10;
  const feelsLike = temp + Math.floor(Math.random() * 5) - 2;
  const humidity = Math.floor(Math.random() * 60) + 20;
  const windSpeed = Math.floor(Math.random() * 30) + 5;
  const conditions = [
    { id: 800, main: 'Clear', description: 'clear sky' },
    { id: 801, main: 'Clouds', description: 'few clouds' },
    { id: 802, main: 'Clouds', description: 'scattered clouds' },
    { id: 500, main: 'Rain', description: 'light rain' },
    { id: 501, main: 'Rain', description: 'moderate rain' },
    { id: 200, main: 'Thunderstorm', description: 'thunderstorm with light rain' }
  ];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    coord: { lat, lon },
    weather: [{
      id: condition.id,
      main: condition.main,
      description: condition.description,
      icon: '01d'
    }],
    main: {
      temp,
      feels_like: feelsLike,
      temp_min: temp - Math.floor(Math.random() * 3),
      temp_max: temp + Math.floor(Math.random() * 3),
      humidity,
      pressure: 1013,
    },
    wind: {
      speed: windSpeed,
      deg: Math.floor(Math.random() * 360)
    },
    sys: {
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 21600
    },
    name: 'Current Location'
  };
}

export async function searchLocations(
  query: string
): Promise<{ data: LocationSuggestion[]; error?: string }> {
  if (!query.trim()) {
    return { data: [] };
  }
  
  try {
    const locations = await searchLocationsByAPI(query);
    
    return {
      data: locations
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to search locations'
    };
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  if (!API_KEY) {
    console.warn('OpenWeather API key not configured, using mock data');
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockWeatherData(lat, lon);
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
    }

    const data: WeatherAPIResponse = await response.json();
    
    // Return the actual weather data from the API
    return {
      coord: { lat: data.coord.lat, lon: data.coord.lon },
      weather: data.weather.map((w) => ({
        id: w.id,
        main: w.main,
        description: w.description,
        icon: w.icon
      })),
      main: {
        temp: Math.round(data.main.temp * 10) / 10, // Round to 1 decimal place
        feels_like: Math.round(data.main.feels_like * 10) / 10,
        temp_min: Math.round(data.main.temp_min * 10) / 10,
        temp_max: Math.round(data.main.temp_max * 10) / 10,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
      },
      wind: {
        speed: data.wind?.speed || 0,
        deg: data.wind?.deg || 0
      },
      sys: {
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
      },
      name: data.name || 'Current Location'
    };
  } catch (error) {
    console.error('Error fetching real weather data:', error);
    console.warn('Falling back to mock data');
    
    // Fallback to mock data if real API fails
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockWeatherData(lat, lon);
  }
}