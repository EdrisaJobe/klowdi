import { getWeatherData, searchLocations } from './api';
import type { WeatherData } from '../types/weather';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WeatherToolResult {
  location: string;
  weather: WeatherData;
}

/**
 * Tool function for getting weather data by location name or coordinates
 */
export async function getWeatherDataTool(location: string): Promise<WeatherToolResult> {
  // Check if location is coordinates (format: "lat,lon" or "lat, lon")
  const coordMatch = location.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  
  if (coordMatch) {
    // Direct coordinates
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    const weather = await getWeatherData(lat, lon);
    return { location: `${lat},${lon}`, weather };
  } else {
    // Location name - search for it first
    const searchResult = await searchLocations(location);
    if (searchResult.data.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    // Use the first result
    const firstResult = searchResult.data[0];
    const weather = await getWeatherData(firstResult.lat, firstResult.lon);
    return { 
      location: `${firstResult.name}, ${firstResult.state || firstResult.country}`, 
      weather 
    };
  }
}

/**
 * Format weather data into a readable string for the AI
 */
export function formatWeatherData(result: WeatherToolResult): string {
  const { location, weather } = result;
  const tempC = weather.main.temp;
  const tempF = (tempC * 9/5) + 32;
  const feelsLikeC = weather.main.feels_like;
  const feelsLikeF = (feelsLikeC * 9/5) + 32;
  
  return `Weather for ${location}:
- Temperature: ${Math.round(tempF)}°F (${Math.round(tempC)}°C)
- Feels like: ${Math.round(feelsLikeF)}°F (${Math.round(feelsLikeC)}°C)
- Condition: ${weather.weather[0].description}
- Humidity: ${weather.main.humidity}%
- Wind: ${weather.wind.speed} m/s at ${weather.wind.deg}°
- Pressure: ${weather.main.pressure} hPa
- Cloud coverage: ${weather.clouds?.all || 0}%
- Visibility: ${weather.visibility ? (weather.visibility / 1000).toFixed(1) : 'N/A'} km
- Precipitation: ${weather.rain?.['1h'] || 0} mm
- Sunrise: ${weather.sys ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString() : 'N/A'}
- Sunset: ${weather.sys ? new Date(weather.sys.sunset * 1000).toLocaleTimeString() : 'N/A'}`;
}

