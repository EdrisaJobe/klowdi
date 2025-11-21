import fetch from 'node-fetch';

const OPENWEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;

/**
 * Search for locations by name
 */
export async function searchLocations(query) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to search locations');
  }

  const data = await response.json();
  
  return data.map((location) => ({
    name: location.local_names?.en || location.name,
    lat: location.lat,
    lon: location.lon,
    country: location.country,
    state: location.state || location.country
  }));
}

/**
 * Get weather data for coordinates
 */
export async function getWeatherData(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    coord: { lat: data.coord.lat, lon: data.coord.lon },
    weather: data.weather.map((w) => ({
      id: w.id,
      main: w.main,
      description: w.description,
      icon: w.icon
    })),
    main: {
      temp: Math.round(data.main.temp * 10) / 10,
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
    clouds: data.clouds ? { all: data.clouds.all } : undefined,
    rain: data.rain ? { '1h': data.rain['1h'] } : undefined,
    visibility: data.visibility,
    sys: {
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    },
    name: data.name || 'Current Location'
  };
}

/**
 * Get weather data tool for AI agent
 */
export async function getWeatherDataTool(location) {
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
    const locations = await searchLocations(location);
    if (locations.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    // Use the first result
    const firstResult = locations[0];
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
export function formatWeatherData(result) {
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

