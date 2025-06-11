interface IPLocation {
  latitude: number;
  longitude: number;
}

const LOCATION_CACHE_KEY = 'cached_location';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedLocation {
  data: { latitude: number; longitude: number };
  timestamp: number;
}

function getCachedLocation(): CachedLocation | null {
  const cached = localStorage.getItem(LOCATION_CACHE_KEY);
  if (!cached) return null;
  
  try {
    const parsed = JSON.parse(cached) as CachedLocation;
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  }
}

function cacheLocation(location: { latitude: number; longitude: number }) {
  const cache: CachedLocation = {
    data: location,
    timestamp: Date.now()
  };
  localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
}

async function getGeolocationPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 5000,
      maximumAge: 0,
      enableHighAccuracy: true
    });
  });
}

export async function getIPLocation(): Promise<IPLocation> {
  try {
    // Try multiple IP geolocation services for redundancy
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://ipwho.is/'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        // Handle different API response formats
        return {
          latitude: data.latitude ?? data.lat,
          longitude: data.longitude ?? data.lon,
        };
      } catch {
        continue; // Try next service if this one fails
      }
    }
    throw new Error('All IP geolocation services failed');
  } catch (error) {
    console.error('IP geolocation failed:', error);
    throw error;
  }
}

export async function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  // Check cache first
  const cached = getCachedLocation();
  if (cached) {
    // Refresh cache in background
    getGeolocationPosition()
      .then(position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        cacheLocation(location);
      })
      .catch(() => {/* Ignore errors when refreshing cache */});
    return cached.data;
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation not supported');
  }

  try {
    // Try precise geolocation first
    const position = await getGeolocationPosition();
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    cacheLocation(location);
    return location;
  } catch {
    // Fall back to IP-based location
    const ipLocation = await getIPLocation();
    cacheLocation(ipLocation);
    return ipLocation;
  }
}