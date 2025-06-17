import type { LocationSuggestion } from '../types/location';
import type { WeatherData } from '../types/weather';

// Function to generate mock locations directly in the frontend
function generateMockLocations(query: string): LocationSuggestion[] {
  const queryCapitalized = query.charAt(0).toUpperCase() + query.slice(1);
  
  // Base coordinates for different regions of the world
  const regions = [
    { name: 'North America', baseLat: 40, baseLon: -100, country: 'US' },
    { name: 'Europe', baseLat: 50, baseLon: 10, country: 'DE' },
    { name: 'Asia', baseLat: 35, baseLon: 105, country: 'CN' },
    { name: 'South America', baseLat: -15, baseLon: -60, country: 'BR' },
    { name: 'Africa', baseLat: 0, baseLon: 20, country: 'KE' },
    { name: 'Oceania', baseLat: -25, baseLon: 140, country: 'AU' }
  ];
  
  // Common city suffixes and prefixes
  const cityVariations = [
    '',
    ' City',
    ' Town',
    ' Village',
    ' Heights',
    ' Park',
    ' Hills',
    ' Beach',
    ' Springs',
    ' Valley'
  ];
  
  const prefixes = [
    '',
    'New ',
    'Old ',
    'East ',
    'West ',
    'North ',
    'South ',
    'Upper ',
    'Lower ',
    'Greater '
  ];
  
  // Generate locations across different regions
  const locations: LocationSuggestion[] = [];
  
  // Generate 3-5 results
  const numResults = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numResults; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const variation = cityVariations[Math.floor(Math.random() * cityVariations.length)];
    const prefix = i === 0 ? '' : prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Generate coordinates within the region with some randomness
    const lat = region.baseLat + (Math.random() * 20 - 10); // ±10 degrees
    const lon = region.baseLon + (Math.random() * 20 - 10); // ±10 degrees
    
    // Create location name
    let locationName;
    if (i === 0) {
      // First result is always the exact query
      locationName = queryCapitalized;
    } else {
      locationName = `${prefix}${queryCapitalized}${variation}`;
    }
    
    // Generate state/province names
    const stateNames = [
      'Province', 'State', 'Region', 'County', 'District', 'Territory',
      'Canton', 'Oblast', 'Prefecture', 'Governorate'
    ];
    const stateName = `${queryCapitalized} ${stateNames[Math.floor(Math.random() * stateNames.length)]}`;
    
    locations.push({
      name: locationName.trim(),
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lon.toFixed(4)),
      country: region.country,
      state: stateName
    });
  }
  
  return locations;
}

// Function to generate mock weather data
function generateMockWeatherData(lat: number, lon: number): WeatherData {
  const temp = Math.floor(Math.random() * 30) + 10; // 10-40°C
  const feelsLike = temp + Math.floor(Math.random() * 5) - 2;
  const humidity = Math.floor(Math.random() * 60) + 20; // 20-80%
  const windSpeed = Math.floor(Math.random() * 30) + 5; // 5-35 km/h
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
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const locations = generateMockLocations(query);
    
    return {
      data: locations
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
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const weatherData = generateMockWeatherData(lat, lon);
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}