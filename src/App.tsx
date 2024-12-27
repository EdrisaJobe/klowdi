import React, { useState, useEffect } from 'react';
import { SearchBox } from './components/SearchBox';
import { MapComponent } from './components/Map';
import { WeatherInfo } from './components/WeatherInfo';
import { LoadingOverlay } from './components/LoadingOverlay';
import type { WeatherData } from './types/weather';
import { getWeatherData } from './utils/api'; 
import { getUserLocation } from './utils/location';
import { getRandomLocation } from './utils/locations';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [center, setCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    async function initializeLocation() {
      try {
        const location = await getUserLocation();
        const coords: [number, number] = [location.longitude, location.latitude];
        setCenter(coords);
        handleLocationSelect(location.latitude, location.longitude);
      } catch (error) {
        console.log('Location services failed, using random location');
        const randomLocation = getRandomLocation();
        const coords: [number, number] = [randomLocation.lon, randomLocation.lat];
        setCenter(coords);
        handleLocationSelect(randomLocation.lat, randomLocation.lon);
      }
      setIsLoading(false);
    }

    initializeLocation();
  }, []);

  const handleLocationSelect = async (lat: number, lon: number) => {
    try {
      setCenter([lon, lat]);
      const data = await getWeatherData(lat, lon);
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="w-full h-screen relative">
      <SearchBox onLocationSelect={handleLocationSelect} />
      <MapComponent
        center={center || [0, 0]}
        ready={center !== null}
        weatherData={weatherData}
        onLocationSelect={handleLocationSelect}
      />
      {weatherData && <WeatherInfo weather={weatherData} />}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}

export default App;