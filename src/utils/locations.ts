// Popular cities around the world for fallback locations
const POPULAR_LOCATIONS = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Berlin", lat: 52.5200, lon: 13.4050 },
  { name: "Toronto", lat: 43.6532, lon: -79.3832 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 }
];

export function getRandomLocation() {
  const randomIndex = Math.floor(Math.random() * POPULAR_LOCATIONS.length);
  return POPULAR_LOCATIONS[randomIndex];
} 