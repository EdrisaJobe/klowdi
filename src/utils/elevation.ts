const ELEVATION_API_URL = 'https://api.open-elevation.com/api/v1/lookup';

interface ElevationData extends Array<number> {
  min: number;
  max: number;
}

interface ElevationResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    elevation: number;
  }>;
}

export async function getElevationData(lat: number, lon: number): Promise<ElevationData | null> {
  try {
    // Create a circular pattern of points around the center
    const radius = 0.05; // ~5.5km radius
    const points = 36; // Number of points to sample
    
    const locations = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const pointLat = lat + Math.sin(angle) * radius;
      const pointLon = lon + Math.cos(angle) * radius;
      locations.push({ latitude: pointLat, longitude: pointLon });
    }
    
    const response = await fetch(ELEVATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locations
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch elevation data');
    }

    const data: ElevationResponse = await response.json();
    const elevations = data.results.map(result => 
      result.elevation === null ? 0 : result.elevation
    );
    
    // Add min/max properties to the array
    const result = elevations as ElevationData;
    result.min = Math.min(...elevations);
    result.max = Math.max(...elevations);
    
    // Handle flat areas more gracefully
    if (result.max - result.min < 5) {
      // For flat areas, create subtle variations
      const baseElevation = result[0];
      return Array.from({ length: points }, (_, i) => {
        const variation = Math.sin((i / points) * Math.PI * 2) * 2;
        return baseElevation + variation;
      }) as ElevationData;
    }
    
    return result;
  } catch (error) {
    // Provide fallback data for development/testing
    console.warn('Error fetching elevation data:', error);
    
    const fallbackData = Array.from({ length: 36 }, (_, i) => {
      return 100 + Math.sin((i / 36) * Math.PI * 2) * 20;
    }) as ElevationData;
    fallbackData.min = Math.min(...fallbackData);
    fallbackData.max = Math.max(...fallbackData);
    return fallbackData;
  }
}