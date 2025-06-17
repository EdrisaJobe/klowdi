import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Mock weather data generator
function generateWeatherData(lat, lon, cityName) {
  // Generate random but realistic weather data
  const temp = 15 + Math.random() * 20; // Temperature between 15-35°C
  const humidity = 40 + Math.random() * 40; // Humidity between 40-80%
  const windSpeed = 1 + Math.random() * 10; // Wind speed between 1-11 m/s
  
  // Weather conditions based on temperature
  let weatherCondition;
  if (temp < 20) {
    weatherCondition = {
      id: 500,
      main: "Rain",
      description: "light rain",
      icon: "10d"
    };
  } else if (temp < 25) {
    weatherCondition = {
      id: 800,
      main: "Clear",
      description: "clear sky",
      icon: "01d"
    };
  } else {
    weatherCondition = {
      id: 800,
      main: "Clear",
      description: "clear sky",
      icon: "01d"
    };
  }

  return {
    coord: { lon: parseFloat(lon), lat: parseFloat(lat) },
    weather: [weatherCondition],
    base: "stations",
    main: {
      temp: temp.toFixed(1),
      feels_like: (temp - 1).toFixed(1),
      temp_min: (temp - 2).toFixed(1),
      temp_max: (temp + 2).toFixed(1),
      pressure: 1000 + Math.floor(Math.random() * 30),
      humidity: Math.floor(humidity)
    },
    visibility: 10000,
    wind: {
      speed: windSpeed.toFixed(1),
      deg: Math.floor(Math.random() * 360)
    },
    clouds: {
      all: Math.floor(Math.random() * 100)
    },
    dt: Date.now() / 1000,
    sys: {
      type: 2,
      id: Math.floor(Math.random() * 1000000),
      country: "US",
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 21600
    },
    timezone: -14400,
    id: Math.floor(Math.random() * 1000000),
    name: cityName,
    cod: 200
  };
}

// Generate mock locations based on search query
function generateLocations(query) {
  const locations = [];
  const queryLower = query.toLowerCase();
  
  // Common city prefixes and suffixes
  const prefixes = ['New', 'San', 'Los', 'Las', 'Fort', 'Mount', 'Lake', 'Port'];
  const suffixes = ['City', 'Town', 'Village', 'Heights', 'Park', 'Hills', 'Beach', 'Springs'];
  
  // Generate 3-5 locations based on the query
  const numLocations = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numLocations; i++) {
    // Generate random coordinates within reasonable bounds
    const lat = 25 + Math.random() * 30; // Roughly US latitude range
    const lon = -125 + Math.random() * 60; // Roughly US longitude range
    
    // Generate a city name based on the query
    let cityName;
    if (i === 0) {
      // First result is always the exact query
      cityName = query.charAt(0).toUpperCase() + query.slice(1);
    } else {
      // Other results are variations
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      cityName = `${prefix} ${query.charAt(0).toUpperCase() + query.slice(1)} ${suffix}`;
    }
    
    locations.push({
      name: cityName,
      local_names: {
        en: cityName
      },
      lat: lat,
      lon: lon,
      country: "US",
      state: "State" // You could add a list of states if needed
    });
  }
  
  return locations;
}

// API routes - MUST be before static file serving
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Failed to fetch weather data',
        message: 'Latitude and longitude are required'
      });
    }
    
    // Generate weather data for the requested coordinates
    const weatherData = generateWeatherData(lat, lon, "Current Location");
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error?.message || 'Unknown error')
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error?.message || 'An unexpected error occurred'
    })
  }
})

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({ 
        error: 'Failed to search locations',
        message: 'Search query is required'
      });
    }
    
    // Generate locations based on the search query
    const locations = generateLocations(q);
    res.json(locations);
  } catch (error) {
    console.error('Location search API error:', error?.message || 'Unknown error')
    res.status(500).json({ 
      error: 'Failed to search locations',
      message: error?.message || 'An unexpected error occurred'
    })
  }
})

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
  console.log(`Serving content from: ${path.join(__dirname, 'dist')}`)
})