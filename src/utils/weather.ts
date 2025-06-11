const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function getWindData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch wind data');
    }

    const data = await response.json();
    return data.wind;
  } catch (error) {
    console.error('Error fetching wind data:', error);
    return null;
  }
}

export async function getWindGridData(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  gridSize: number = 8
) {
  try {
    // Get center point data
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    const windData = await getWindData(centerLat, centerLon);
    if (!windData) return [];

    const grid: Array<{ lat: number; lon: number; speed: number; deg: number }> = [];
    const latStep = (maxLat - minLat) / gridSize;
    const lonStep = (maxLon - minLon) / gridSize;

    // Create interpolated grid
    for (let lat = minLat; lat <= maxLat; lat += latStep) {
      for (let lon = minLon; lon <= maxLon; lon += lonStep) {
        // Add random variation to create more natural wind patterns
        const speedVariation = (Math.random() - 0.5) * 2; // ±1 m/s
        const degVariation = (Math.random() - 0.5) * 20; // ±10 degrees
        
        // Calculate distance factor from center (0-1)
        const distanceFromCenter = Math.sqrt(
          Math.pow((lat - centerLat) / (maxLat - minLat), 2) +
          Math.pow((lon - centerLon) / (maxLon - minLon), 2)
        );
        
        // Reduce wind speed slightly at edges
        const speedFactor = 1 - (distanceFromCenter * 0.3);
        
        grid.push({
          lat,
          lon,
          speed: Math.max(0, windData.speed * speedFactor + speedVariation),
          deg: (windData.deg + degVariation) % 360
        });
      }
    }

    return grid;
  } catch (error) {
    console.error('Error fetching wind grid data:', error);
    return [];
  }
}

export async function getTemperatureData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch temperature data');
    }

    const data = await response.json();
    return { temp: data.main.temp };
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return null;
  }
}

export async function getCloudData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch cloud data');
    }

    const data = await response.json();
    return { 
      clouds: data.clouds.all, // Cloud coverage percentage
      weather: data.weather[0] // Weather condition
    };
  } catch (error) {
    console.error('Error fetching cloud data:', error);
    return null;
  }
}

export async function getRainData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch rain data: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid weather data format');
    }

    return { 
      rain: data.rain || { '1h': 0 },  // Default to no rain if not present
      weather: data.weather?.[0] || { main: 'Clear', description: 'clear sky' }  // Default weather if not present
    };
  } catch (error) {
    console.error('Error fetching rain data:', error);
    return null;
  }
}