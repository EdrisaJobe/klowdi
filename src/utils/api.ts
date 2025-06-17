import type { LocationSuggestion } from '../types/location';
import type { WeatherData } from '../types/weather';

// Use backend proxy routes instead of direct API calls
const BASE_URL = '/api';

export async function searchLocations(
  query: string
): Promise<{ data: LocationSuggestion[]; error?: string }> {
  if (!query.trim()) {
    return { data: [] };
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}`
    );
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Location search failed: ${errorText || response.statusText}`);
    }
  
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid location data format received');
    }
    
    // Filter out results with missing required data
    const validData = data.filter(item => 
      item.name && 
      typeof item.lat === 'number' && 
      typeof item.lon === 'number' &&
      item.country
    );
    
    return {
      data: validData.map(item => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      }))
    };
  } catch (error) {
    console.error('Error in searchLocations:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to search locations'
    };
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}`
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid weather data format');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}