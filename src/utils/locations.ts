// List of interesting locations around the world
const FEATURED_LOCATIONS = [
  { name: "Mount Fuji", lat: 35.3606, lon: 138.7274 },
  { name: "Machu Picchu", lat: -13.1631, lon: -72.5450 },
  { name: "Great Barrier Reef", lat: -18.2871, lon: 147.6992 },
  { name: "Santorini", lat: 36.3932, lon: 25.4615 },
  { name: "Victoria Falls", lat: -17.9243, lon: 25.8572 },
  { name: "Northern Lights (Iceland)", lat: 64.9631, lon: -19.0208 },
  { name: "Grand Canyon", lat: 36.0544, lon: -112.1401 },
  { name: "Great Wall of China", lat: 40.4319, lon: 116.5704 },
  { name: "Petra", lat: 30.3285, lon: 35.4444 },
  { name: "Taj Mahal", lat: 27.1751, lon: 78.0421 }
];

export function getRandomLocation() {
  const randomIndex = Math.floor(Math.random() * FEATURED_LOCATIONS.length);
  return FEATURED_LOCATIONS[randomIndex];
}