// Using fallback elevation data for development to avoid CORS issues

interface ElevationData extends Array<number> {
  min: number;
  max: number;
}

///////////////////// THIS IS PRIMARILY FOR CORS BYPASS IN DEVELOPMENT /////////////////////
function createFallbackElevationData(lat: number, lon: number): ElevationData {
  // Create realistic elevation data based on latitude and longitude (deterministic)
  const baseElevation = Math.abs(lat) * 10; // Higher elevations towards poles
  const coastalEffect = Math.sin(lon * Math.PI / 180) * 50; // Coastal variations
  
  const points = 36;
  const fallbackData = Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2;
    const terrainVariation = Math.sin(angle * 3) * 30; // Natural terrain variations
    // Use deterministic "noise" based on position instead of Math.random()
    const positionSeed = lat * 1000 + lon * 1000 + i;
    const deterministicNoise = Math.sin(positionSeed) * 10; // Deterministic variation
    return Math.max(0, baseElevation + coastalEffect + terrainVariation + deterministicNoise);
  }) as ElevationData;
  
  fallbackData.min = Math.min(...fallbackData);
  fallbackData.max = Math.max(...fallbackData);
  
  return fallbackData;
}

export async function getElevationData(lat: number, lon: number): Promise<ElevationData | null> {
  try {
    return await getElevationDataFromAPI(lat, lon);
  } catch (error) {
    // Only fall back to mock data if real API fails
    console.warn('Failed to fetch real elevation data, using fallback:', error);
    return createFallbackElevationData(lat, lon);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////

// Use server proxy to avoid CORS issues
const ELEVATION_API_URL = '/api/elevation';

interface ElevationResponse {
  elevations: number[];
  min: number;
  max: number;
  fallback?: boolean;
}

// Cache for elevation data to reduce API calls
const elevationCache = new Map<string, { data: ElevationData; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour

export async function getElevationDataFromAPI(lat: number, lon: number): Promise<ElevationData | null> {
  try {
    // Round coordinates to reduce unique requests
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    const cacheKey = `${roundedLat},${roundedLon}`;
    
    // Check cache first
    const cached = elevationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const response = await fetch(ELEVATION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: roundedLat, lon: roundedLon })
    });
    
    if (!response.ok) throw new Error('Failed to fetch elevation data');

    const data: ElevationResponse = await response.json();
    
    const result = data.elevations as ElevationData;
    result.min = data.min;
    result.max = data.max;
    
    // Cache the result
    elevationCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.warn('Error fetching elevation data:', error);
    return createFallbackElevationData(lat, lon);
  }
}