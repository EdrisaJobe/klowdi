import type { LocationSuggestion } from '../types/location';
import type { WeatherData } from '../types/weather';

// Function to generate mock locations directly in the frontend
function generateMockLocations(query: string): LocationSuggestion[] {
  const queryLower = query.toLowerCase();
  const queryCapitalized = query.charAt(0).toUpperCase() + query.slice(1);
  
  // Known cities database for more realistic results
  const knownCities = {
    // US Cities
    'albany ny': { lat: 42.6526, lon: -73.7562, state: 'New York', country: 'US' },
    'albany': { lat: 42.6526, lon: -73.7562, state: 'New York', country: 'US' },
    'new york': { lat: 40.7128, lon: -74.0060, state: 'New York', country: 'US' },
    'new york ny': { lat: 40.7128, lon: -74.0060, state: 'New York', country: 'US' },
    'los angeles': { lat: 34.0522, lon: -118.2437, state: 'California', country: 'US' },
    'los angeles ca': { lat: 34.0522, lon: -118.2437, state: 'California', country: 'US' },
    'chicago': { lat: 41.8781, lon: -87.6298, state: 'Illinois', country: 'US' },
    'chicago il': { lat: 41.8781, lon: -87.6298, state: 'Illinois', country: 'US' },
    'houston': { lat: 29.7604, lon: -95.3698, state: 'Texas', country: 'US' },
    'houston tx': { lat: 29.7604, lon: -95.3698, state: 'Texas', country: 'US' },
    'phoenix': { lat: 33.4484, lon: -112.0740, state: 'Arizona', country: 'US' },
    'phoenix az': { lat: 33.4484, lon: -112.0740, state: 'Arizona', country: 'US' },
    'philadelphia': { lat: 39.9526, lon: -75.1652, state: 'Pennsylvania', country: 'US' },
    'philadelphia pa': { lat: 39.9526, lon: -75.1652, state: 'Pennsylvania', country: 'US' },
    'san antonio': { lat: 29.4241, lon: -98.4936, state: 'Texas', country: 'US' },
    'san antonio tx': { lat: 29.4241, lon: -98.4936, state: 'Texas', country: 'US' },
    'san diego': { lat: 32.7157, lon: -117.1611, state: 'California', country: 'US' },
    'san diego ca': { lat: 32.7157, lon: -117.1611, state: 'California', country: 'US' },
    'dallas': { lat: 32.7767, lon: -96.7970, state: 'Texas', country: 'US' },
    'dallas tx': { lat: 32.7767, lon: -96.7970, state: 'Texas', country: 'US' },
    'san jose': { lat: 37.3382, lon: -121.8863, state: 'California', country: 'US' },
    'san jose ca': { lat: 37.3382, lon: -121.8863, state: 'California', country: 'US' },
    'austin': { lat: 30.2672, lon: -97.7431, state: 'Texas', country: 'US' },
    'austin tx': { lat: 30.2672, lon: -97.7431, state: 'Texas', country: 'US' },
    'seattle': { lat: 47.6062, lon: -122.3321, state: 'Washington', country: 'US' },
    'seattle wa': { lat: 47.6062, lon: -122.3321, state: 'Washington', country: 'US' },
    'denver': { lat: 39.7392, lon: -104.9903, state: 'Colorado', country: 'US' },
    'denver co': { lat: 39.7392, lon: -104.9903, state: 'Colorado', country: 'US' },
    'boston': { lat: 42.3601, lon: -71.0589, state: 'Massachusetts', country: 'US' },
    'boston ma': { lat: 42.3601, lon: -71.0589, state: 'Massachusetts', country: 'US' },
    'miami': { lat: 25.7617, lon: -80.1918, state: 'Florida', country: 'US' },
    'miami fl': { lat: 25.7617, lon: -80.1918, state: 'Florida', country: 'US' },
    'atlanta': { lat: 33.7490, lon: -84.3880, state: 'Georgia', country: 'US' },
    'atlanta ga': { lat: 33.7490, lon: -84.3880, state: 'Georgia', country: 'US' },
    'las vegas': { lat: 36.1699, lon: -115.1398, state: 'Nevada', country: 'US' },
    'las vegas nv': { lat: 36.1699, lon: -115.1398, state: 'Nevada', country: 'US' },
    'san francisco': { lat: 37.7749, lon: -122.4194, state: 'California', country: 'US' },
    'san francisco ca': { lat: 37.7749, lon: -122.4194, state: 'California', country: 'US' },
    
    // International Cities
    'london': { lat: 51.5074, lon: -0.1278, state: 'England', country: 'GB' },
    'paris': { lat: 48.8566, lon: 2.3522, state: 'Île-de-France', country: 'FR' },
    'tokyo': { lat: 35.6762, lon: 139.6503, state: 'Tokyo', country: 'JP' },
    'berlin': { lat: 52.5200, lon: 13.4050, state: 'Berlin', country: 'DE' },
    'sydney': { lat: -33.8688, lon: 151.2093, state: 'New South Wales', country: 'AU' },
    'toronto': { lat: 43.6532, lon: -79.3832, state: 'Ontario', country: 'CA' },
    'mexico city': { lat: 19.4326, lon: -99.1332, state: 'Mexico City', country: 'MX' },
    'mumbai': { lat: 19.0760, lon: 72.8777, state: 'Maharashtra', country: 'IN' },
    'shanghai': { lat: 31.2304, lon: 121.4737, state: 'Shanghai', country: 'CN' },
    'moscow': { lat: 55.7558, lon: 37.6173, state: 'Moscow', country: 'RU' },
    'rome': { lat: 41.9028, lon: 12.4964, state: 'Lazio', country: 'IT' },
    'madrid': { lat: 40.4168, lon: -3.7038, state: 'Madrid', country: 'ES' }
  };

  // Check if query matches a known city (exact match or contains match)
  const knownCity = knownCities[queryLower as keyof typeof knownCities];
  if (knownCity) {
    const locations: LocationSuggestion[] = [
      {
        name: queryCapitalized,
        lat: knownCity.lat,
        lon: knownCity.lon,
        country: knownCity.country,
        state: knownCity.state
      }
    ];

    // Add nearby variations
    for (let i = 1; i < 4; i++) {
      const variation = i === 1 ? 'Metro Area' : i === 2 ? 'County' : 'District';
      locations.push({
        name: `${queryCapitalized} ${variation}`,
        lat: parseFloat((knownCity.lat + (Math.random() * 0.2 - 0.1)).toFixed(4)),
        lon: parseFloat((knownCity.lon + (Math.random() * 0.2 - 0.1)).toFixed(4)),
        country: knownCity.country,
        state: knownCity.state
      });
    }

    return locations;
  }

  // Check for partial matches in known cities
  const partialMatches = Object.entries(knownCities).filter(([key]) => 
    key.includes(queryLower) || queryLower.includes(key.split(' ')[0])
  );

  if (partialMatches.length > 0) {
    return partialMatches.slice(0, 4).map(([key, city]) => ({
      name: key.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      lat: city.lat,
      lon: city.lon,
      country: city.country,
      state: city.state
    }));
  }

  // Parse city, state format (e.g., "Albany, NY" or "Albany NY")
  const cityStateMatch = query.match(/^([^,]+)[\s,]+([A-Z]{2}|[A-Za-z\s]+)$/);
  if (cityStateMatch) {
    const [, cityName, stateName] = cityStateMatch;
    const cleanCityName = cityName.trim();
    const cleanStateName = stateName.trim();
    
    // US state abbreviations to full names
    const stateMap = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };

    const fullStateName = stateMap[cleanStateName.toUpperCase() as keyof typeof stateMap] || cleanStateName;
    
    // Generate realistic coordinates for US states
    const stateCoords = {
      'New York': { baseLat: 42.5, baseLon: -75.0 },
      'California': { baseLat: 36.7, baseLon: -119.7 },
      'Texas': { baseLat: 31.0, baseLon: -99.0 },
      'Florida': { baseLat: 27.8, baseLon: -81.7 },
      'Illinois': { baseLat: 40.0, baseLon: -89.0 },
      'Pennsylvania': { baseLat: 40.3, baseLon: -76.9 },
      'Ohio': { baseLat: 40.4, baseLon: -82.7 },
      'Georgia': { baseLat: 33.0, baseLon: -83.5 },
      'North Carolina': { baseLat: 35.5, baseLon: -79.0 },
      'Michigan': { baseLat: 43.3, baseLon: -84.5 }
    };

    const stateCoord = stateCoords[fullStateName as keyof typeof stateCoords] || { baseLat: 39.0, baseLon: -98.0 }; // Default to center US

    const locations: LocationSuggestion[] = [];
    
    // Generate 3-4 variations
    for (let i = 0; i < 4; i++) {
      const nameVariations = [
        cleanCityName,
        `${cleanCityName} City`,
        `${cleanCityName} Township`,
        `${cleanCityName} County`
      ];

      locations.push({
        name: nameVariations[i],
        lat: parseFloat((stateCoord.baseLat + (Math.random() * 4 - 2)).toFixed(4)),
        lon: parseFloat((stateCoord.baseLon + (Math.random() * 4 - 2)).toFixed(4)),
        country: 'US',
        state: fullStateName
      });
    }

    return locations;
  }

  // Fallback to original random generation for unknown places
  const regions = [
    { name: 'North America', baseLat: 40, baseLon: -100, country: 'US' },
    { name: 'Europe', baseLat: 50, baseLon: 10, country: 'DE' },
    { name: 'Asia', baseLat: 35, baseLon: 105, country: 'CN' },
    { name: 'South America', baseLat: -15, baseLon: -60, country: 'BR' },
    { name: 'Africa', baseLat: 0, baseLon: 20, country: 'KE' },
    { name: 'Oceania', baseLat: -25, baseLon: 140, country: 'AU' }
  ];
  
  const cityVariations = ['', ' City', ' Town', ' Village', ' Heights', ' Park'];
  const prefixes = ['', 'New ', 'Old ', 'East ', 'West ', 'North ', 'South '];
  
  const locations: LocationSuggestion[] = [];
  const numResults = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numResults; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const variation = cityVariations[Math.floor(Math.random() * cityVariations.length)];
    const prefix = i === 0 ? '' : prefixes[Math.floor(Math.random() * prefixes.length)];
    
    const lat = region.baseLat + (Math.random() * 20 - 10);
    const lon = region.baseLon + (Math.random() * 20 - 10);
    
    let locationName;
    if (i === 0) {
      locationName = queryCapitalized;
    } else {
      locationName = `${prefix}${queryCapitalized}${variation}`;
    }
    
    const stateNames = ['Province', 'State', 'Region', 'County', 'District', 'Territory'];
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