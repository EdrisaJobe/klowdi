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
    // Try to use real elevation data first
    console.log('Fetching real elevation data from Open Elevation API');
    return await getElevationDataFromAPI(lat, lon);
  } catch (error) {
    // Only fall back to mock data if real API fails
    console.warn('Failed to fetch real elevation data, using fallback:', error);
    return createFallbackElevationData(lat, lon);
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////

// Original API implementation
// I can enable this in production with proper CORS configuration
const ELEVATION_API_URL = 'https://api.open-elevation.com/api/v1/lookup';

interface ElevationResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    elevation: number;
  }>;
}

export async function getElevationDataFromAPI(lat: number, lon: number): Promise<ElevationData | null> {
  try {
    const radius = 0.05;
    const points = 36;
    const locations = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const pointLat = lat + Math.sin(angle) * radius;
      const pointLon = lon + Math.cos(angle) * radius;
      locations.push({ latitude: pointLat, longitude: pointLon });
    }
    
    const response = await fetch(ELEVATION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations })
    });
    
    if (!response.ok) throw new Error('Failed to fetch elevation data');

    const data: ElevationResponse = await response.json();
    const elevations = data.results.map(result => 
      result.elevation === null ? 0 : result.elevation
    );
    
    const result = elevations as ElevationData;
    result.min = Math.min(...elevations);
    result.max = Math.max(...elevations);
    
    return result;
  } catch (error) {
    console.warn('Error fetching elevation data:', error);
    return createFallbackElevationData(lat, lon);
  }
}