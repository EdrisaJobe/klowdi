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
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const weatherData = generateMockWeatherData(lat, lon);
  
  return weatherData;
}